import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Función auxiliar para obtener config
async function getConfig(clave, defaultValue) {
  const { data } = await supabaseAdmin
    .from('config_fidelidad')
    .select('valor')
    .eq('clave', clave)
    .single();
  return data?.valor || defaultValue;
}

// GET - Obtener puntos y cupones del cliente
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cliente_id = searchParams.get('cliente_id');
  const tienda_id = searchParams.get('tienda_id');

  if (!cliente_id) {
    return NextResponse.json({ error: 'Cliente no especificado' }, { status: 400 });
  }

  // Obtener puntos de la tienda actual
  let puntosActuales = 0;
  if (tienda_id) {
    const { data: puntosTienda } = await supabaseAdmin
      .from('puntos_tienda')
      .select('puntos, puntos_totales')
      .eq('cliente_id', cliente_id)
      .eq('tienda_id', tienda_id)
      .single();

    if (puntosTienda) {
      puntosActuales = puntosTienda.puntos;
    }
  }

  // Obtener todos los puntos por tienda
  const { data: todosPuntos } = await supabaseAdmin
    .from('puntos_tienda')
    .select(`
      puntos,
      puntos_totales,
      tiendas (id, nombre)
    `)
    .eq('cliente_id', cliente_id);

  // Obtener cupones vigentes (solo de la tienda actual si se especifica)
  const hoy = new Date().toISOString().split('T')[0];

  let cuponesQuery = supabaseAdmin
    .from('cupones')
    .select('*')
    .eq('cliente_id', cliente_id)
    .eq('estado', 'vigente')
    .eq('origen', 'fidelidad')
    .gte('fecha_fin', hoy);

  if (tienda_id) {
    cuponesQuery = cuponesQuery.eq('tienda_id', tienda_id);
  }

  const { data: cuponesVigentes } = await cuponesQuery;

  // Obtener cupones canjeados
  const { data: cuponesCanjeados } = await supabaseAdmin
    .from('cupones')
    .select('*')
    .eq('cliente_id', cliente_id)
    .eq('estado', 'canjeado')
    .eq('origen', 'fidelidad')
    .order('fecha_canje', { ascending: false })
    .limit(10);

  // Obtener cupones vencidos
  const { data: cuponesVencidos } = await supabaseAdmin
    .from('cupones')
    .select('*')
    .eq('cliente_id', cliente_id)
    .eq('estado', 'vigente')
    .eq('origen', 'fidelidad')
    .lt('fecha_fin', hoy)
    .limit(10);

  // Actualizar cupones vencidos a estado 'vencido'
  if (cuponesVencidos && cuponesVencidos.length > 0) {
    const idsVencidos = cuponesVencidos.map(c => c.id);
    await supabaseAdmin
      .from('cupones')
      .update({ estado: 'vencido' })
      .in('id', idsVencidos);
  }

  // Obtener datos del cliente (miembro fidelidad, puntos globales)
  const { data: cliente } = await supabaseAdmin
    .from('clientes')
    .select('puntos, miembro_fidelidad, fecha_union_fidelidad, fecha_nacimiento')
    .eq('id', cliente_id)
    .single();

  // Obtener recompensas disponibles
  const { data: recompensas } = await supabaseAdmin
    .from('recompensas')
    .select('*')
    .eq('activo', true)
    .or(`fecha_inicio.is.null,fecha_inicio.lte.${hoy}`)
    .or(`fecha_fin.is.null,fecha_fin.gte.${hoy}`)
    .order('puntos_requeridos', { ascending: true });

  // Obtener canjes pendientes del cliente
  const { data: canjesPendientes } = await supabaseAdmin
    .from('canjes_recompensas')
    .select(`
      *,
      recompensas (nombre, tipo, valor, imagen)
    `)
    .eq('cliente_id', cliente_id)
    .eq('estado', 'pendiente')
    .gte('fecha_expiracion', hoy);

  // Obtener historial de transacciones (últimas 20)
  const { data: historial } = await supabaseAdmin
    .from('transacciones')
    .select('*')
    .eq('cliente_id', cliente_id)
    .order('fecha', { ascending: false })
    .limit(20);

  return NextResponse.json({
    puntos_globales: cliente?.puntos || 0,
    puntos_tienda_actual: puntosActuales,
    puntos_para_cupon: 75 - puntosActuales,
    progreso_porcentaje: Math.min(100, Math.round((puntosActuales / 75) * 100)),
    puntos_por_tienda: todosPuntos || [],
    miembro_fidelidad: cliente?.miembro_fidelidad || false,
    fecha_union: cliente?.fecha_union_fidelidad,
    tiene_cumpleanos: cliente?.fecha_nacimiento ? true : false,
    cupones: {
      vigentes: cuponesVigentes || [],
      canjeados: cuponesCanjeados || [],
      vencidos: cuponesVencidos || []
    },
    recompensas: recompensas || [],
    canjes_pendientes: canjesPendientes || [],
    historial: historial || []
  });
}

// POST - Unirse al programa de fidelidad
export async function POST(request) {
  const body = await request.json();
  const { cliente_id, fecha_nacimiento } = body;

  if (!cliente_id) {
    return NextResponse.json({ error: 'Cliente no especificado' }, { status: 400 });
  }

  // Verificar si ya es miembro
  const { data: cliente } = await supabaseAdmin
    .from('clientes')
    .select('miembro_fidelidad, puntos')
    .eq('id', cliente_id)
    .single();

  if (!cliente) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
  }

  if (cliente.miembro_fidelidad) {
    return NextResponse.json({ error: 'Ya eres miembro del programa de fidelidad' }, { status: 400 });
  }

  // Obtener bonus de bienvenida de la config
  const bonusBienvenida = parseInt(await getConfig('bonus_bienvenida', '50'));

  // Actualizar cliente como miembro
  const updateData = {
    miembro_fidelidad: true,
    fecha_union_fidelidad: new Date().toISOString(),
    puntos: (cliente.puntos || 0) + bonusBienvenida
  };

  if (fecha_nacimiento) {
    updateData.fecha_nacimiento = fecha_nacimiento;
  }

  const { error: updateError } = await supabaseAdmin
    .from('clientes')
    .update(updateData)
    .eq('id', cliente_id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Registrar transacción de bonus
  await supabaseAdmin
    .from('transacciones')
    .insert([{
      cliente_id,
      tipo: 'BONUS_BIENVENIDA',
      puntos: bonusBienvenida,
      descripcion: 'Bonus de bienvenida al programa de fidelidad'
    }]);

  return NextResponse.json({
    success: true,
    mensaje: `¡Bienvenido al programa! Has recibido ${bonusBienvenida} puntos de regalo`,
    puntos_ganados: bonusBienvenida,
    puntos_totales: (cliente.puntos || 0) + bonusBienvenida
  });
}
