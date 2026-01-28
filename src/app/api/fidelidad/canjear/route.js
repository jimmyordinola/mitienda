import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// POST - Canjear una recompensa
export async function POST(request) {
  const body = await request.json();
  const { cliente_id, recompensa_id } = body;

  if (!cliente_id || !recompensa_id) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  // Obtener cliente
  const { data: cliente, error: clienteError } = await supabaseAdmin
    .from('clientes')
    .select('puntos, miembro_fidelidad')
    .eq('id', cliente_id)
    .single();

  if (clienteError || !cliente) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
  }

  if (!cliente.miembro_fidelidad) {
    return NextResponse.json({ error: 'Debes ser miembro del programa de fidelidad' }, { status: 400 });
  }

  // Obtener recompensa
  const hoy = new Date().toISOString().split('T')[0];
  const { data: recompensa, error: recompensaError } = await supabaseAdmin
    .from('recompensas')
    .select('*')
    .eq('id', recompensa_id)
    .eq('activo', true)
    .single();

  if (recompensaError || !recompensa) {
    return NextResponse.json({ error: 'Recompensa no disponible' }, { status: 404 });
  }

  // Verificar fechas
  if (recompensa.fecha_inicio && recompensa.fecha_inicio > hoy) {
    return NextResponse.json({ error: 'Esta recompensa aún no está disponible' }, { status: 400 });
  }
  if (recompensa.fecha_fin && recompensa.fecha_fin < hoy) {
    return NextResponse.json({ error: 'Esta recompensa ha expirado' }, { status: 400 });
  }

  // Verificar stock
  if (recompensa.stock !== null && recompensa.stock <= 0) {
    return NextResponse.json({ error: 'Recompensa agotada' }, { status: 400 });
  }

  // Verificar puntos suficientes
  if (cliente.puntos < recompensa.puntos_requeridos) {
    return NextResponse.json({
      error: `Necesitas ${recompensa.puntos_requeridos} puntos. Tienes ${cliente.puntos}`,
      puntos_faltantes: recompensa.puntos_requeridos - cliente.puntos
    }, { status: 400 });
  }

  // Calcular fecha de expiración (30 días por defecto)
  const { data: configDias } = await supabaseAdmin
    .from('config_fidelidad')
    .select('valor')
    .eq('clave', 'dias_expiracion_canje')
    .single();

  const diasExpiracion = parseInt(configDias?.valor || '30');
  const fechaExpiracion = new Date();
  fechaExpiracion.setDate(fechaExpiracion.getDate() + diasExpiracion);

  // Generar código único
  const codigoCanje = Math.random().toString(36).substring(2, 10).toUpperCase();

  // Crear canje
  const { data: canje, error: canjeError } = await supabaseAdmin
    .from('canjes_recompensas')
    .insert([{
      cliente_id,
      recompensa_id,
      puntos_usados: recompensa.puntos_requeridos,
      codigo_canje: codigoCanje,
      estado: 'pendiente',
      fecha_expiracion: fechaExpiracion.toISOString().split('T')[0]
    }])
    .select()
    .single();

  if (canjeError) {
    return NextResponse.json({ error: canjeError.message }, { status: 500 });
  }

  // Descontar puntos
  const nuevosPuntos = cliente.puntos - recompensa.puntos_requeridos;
  await supabaseAdmin
    .from('clientes')
    .update({ puntos: nuevosPuntos })
    .eq('id', cliente_id);

  // Registrar transacción
  await supabaseAdmin
    .from('transacciones')
    .insert([{
      cliente_id,
      tipo: 'RECOMPENSA',
      puntos: -recompensa.puntos_requeridos,
      descripcion: `Canje: ${recompensa.nombre}`,
      referencia_id: canje.id,
      referencia_tipo: 'canje_recompensa'
    }]);

  // Reducir stock si aplica
  if (recompensa.stock !== null) {
    await supabaseAdmin
      .from('recompensas')
      .update({ stock: recompensa.stock - 1 })
      .eq('id', recompensa_id);
  }

  return NextResponse.json({
    success: true,
    mensaje: `¡Has canjeado "${recompensa.nombre}"!`,
    canje: {
      id: canje.id,
      codigo: codigoCanje,
      recompensa: recompensa.nombre,
      tipo: recompensa.tipo,
      valor: recompensa.valor,
      fecha_expiracion: canje.fecha_expiracion
    },
    puntos_usados: recompensa.puntos_requeridos,
    puntos_restantes: nuevosPuntos
  });
}

// PUT - Usar/validar un canje (para el negocio)
export async function PUT(request) {
  const body = await request.json();
  const { codigo_canje, cliente_id } = body;

  if (!codigo_canje) {
    return NextResponse.json({ error: 'Código de canje requerido' }, { status: 400 });
  }

  // Buscar canje
  const { data: canje, error } = await supabaseAdmin
    .from('canjes_recompensas')
    .select(`
      *,
      recompensas (nombre, tipo, valor, producto_id)
    `)
    .eq('codigo_canje', codigo_canje.toUpperCase())
    .single();

  if (error || !canje) {
    return NextResponse.json({ error: 'Código no válido' }, { status: 404 });
  }

  // Validar cliente si se proporciona
  if (cliente_id && canje.cliente_id !== parseInt(cliente_id)) {
    return NextResponse.json({ error: 'Este código no pertenece a este cliente' }, { status: 400 });
  }

  if (canje.estado === 'usado') {
    return NextResponse.json({ error: 'Este código ya fue utilizado' }, { status: 400 });
  }

  if (canje.estado === 'expirado' || new Date(canje.fecha_expiracion) < new Date()) {
    // Actualizar a expirado si no lo está
    if (canje.estado !== 'expirado') {
      await supabaseAdmin
        .from('canjes_recompensas')
        .update({ estado: 'expirado' })
        .eq('id', canje.id);
    }
    return NextResponse.json({ error: 'Este código ha expirado' }, { status: 400 });
  }

  // Marcar como usado
  await supabaseAdmin
    .from('canjes_recompensas')
    .update({
      estado: 'usado',
      fecha_uso: new Date().toISOString()
    })
    .eq('id', canje.id);

  return NextResponse.json({
    success: true,
    mensaje: 'Recompensa aplicada correctamente',
    recompensa: {
      nombre: canje.recompensas.nombre,
      tipo: canje.recompensas.tipo,
      valor: canje.recompensas.valor,
      producto_id: canje.recompensas.producto_id
    }
  });
}
