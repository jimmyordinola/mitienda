import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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

  return NextResponse.json({
    puntos_tienda_actual: puntosActuales,
    puntos_para_cupon: 75 - puntosActuales,
    progreso_porcentaje: Math.min(100, Math.round((puntosActuales / 75) * 100)),
    puntos_por_tienda: todosPuntos || [],
    cupones: {
      vigentes: cuponesVigentes || [],
      canjeados: cuponesCanjeados || [],
      vencidos: cuponesVencidos || []
    }
  });
}
