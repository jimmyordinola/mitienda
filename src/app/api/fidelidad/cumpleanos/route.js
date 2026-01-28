import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// POST - Reclamar bonus de cumpleaños
export async function POST(request) {
  const body = await request.json();
  const { cliente_id } = body;

  if (!cliente_id) {
    return NextResponse.json({ error: 'Cliente no especificado' }, { status: 400 });
  }

  // Obtener datos del cliente
  const { data: cliente, error: clienteError } = await supabaseAdmin
    .from('clientes')
    .select('puntos, miembro_fidelidad, fecha_nacimiento, ultimo_bonus_cumpleanos')
    .eq('id', cliente_id)
    .single();

  if (clienteError || !cliente) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
  }

  if (!cliente.miembro_fidelidad) {
    return NextResponse.json({ error: 'Debes ser miembro del programa de fidelidad' }, { status: 400 });
  }

  if (!cliente.fecha_nacimiento) {
    return NextResponse.json({
      error: 'No tienes fecha de nacimiento registrada',
      requiere_fecha: true
    }, { status: 400 });
  }

  const hoy = new Date();
  const fechaNac = new Date(cliente.fecha_nacimiento);
  const anioActual = hoy.getFullYear();

  // Verificar si ya recibió bonus este año
  if (cliente.ultimo_bonus_cumpleanos === anioActual) {
    return NextResponse.json({
      error: 'Ya recibiste tu bonus de cumpleaños este año',
      ya_reclamado: true
    }, { status: 400 });
  }

  // Verificar si es su cumpleaños (mismo día y mes)
  const esCumpleanos = fechaNac.getDate() === hoy.getDate() &&
                       fechaNac.getMonth() === hoy.getMonth();

  if (!esCumpleanos) {
    // Permitir reclamar durante todo el mes de cumpleaños como alternativa
    const esMesCumpleanos = fechaNac.getMonth() === hoy.getMonth();
    if (!esMesCumpleanos) {
      return NextResponse.json({
        error: 'El bonus solo puede reclamarse en tu mes de cumpleaños',
        fecha_nacimiento: cliente.fecha_nacimiento
      }, { status: 400 });
    }
  }

  // Obtener puntos de bonus de la config
  const { data: configBonus } = await supabaseAdmin
    .from('config_fidelidad')
    .select('valor')
    .eq('clave', 'bonus_cumpleanos')
    .single();

  const bonusPuntos = parseInt(configBonus?.valor || '100');

  // Otorgar bonus
  const nuevosPuntos = (cliente.puntos || 0) + bonusPuntos;
  await supabaseAdmin
    .from('clientes')
    .update({
      puntos: nuevosPuntos,
      ultimo_bonus_cumpleanos: anioActual
    })
    .eq('id', cliente_id);

  // Registrar transacción
  await supabaseAdmin
    .from('transacciones')
    .insert([{
      cliente_id,
      tipo: 'BONUS_CUMPLEANOS',
      puntos: bonusPuntos,
      descripcion: `Bonus de cumpleaños ${anioActual}`
    }]);

  return NextResponse.json({
    success: true,
    mensaje: `¡Feliz cumpleaños! Has recibido ${bonusPuntos} puntos de regalo`,
    puntos_ganados: bonusPuntos,
    puntos_totales: nuevosPuntos
  });
}

// PUT - Actualizar fecha de nacimiento
export async function PUT(request) {
  const body = await request.json();
  const { cliente_id, fecha_nacimiento } = body;

  if (!cliente_id || !fecha_nacimiento) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  // Validar formato de fecha
  const fecha = new Date(fecha_nacimiento);
  if (isNaN(fecha.getTime())) {
    return NextResponse.json({ error: 'Fecha inválida' }, { status: 400 });
  }

  // Actualizar fecha
  const { error } = await supabaseAdmin
    .from('clientes')
    .update({ fecha_nacimiento })
    .eq('id', cliente_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    mensaje: 'Fecha de nacimiento actualizada'
  });
}
