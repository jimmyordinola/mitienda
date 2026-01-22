import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tiendaId = searchParams.get('tienda_id');

  if (!tiendaId) {
    // Sin tienda, devolver productos destacados globales
    const { data } = await supabase
      .from('productos')
      .select('*, categorias(nombre, emoji)')
      .eq('disponible', true)
      .eq('destacado', true)
      .order('orden')
      .limit(4);
    return NextResponse.json(data || []);
  }

  // Obtener productos destacados para esta tienda específica
  const { data: asignaciones } = await supabase
    .from('productos_tiendas')
    .select('producto_id')
    .eq('tienda_id', tiendaId)
    .eq('disponible', true)
    .eq('destacado', true);

  if (asignaciones && asignaciones.length > 0) {
    const productIds = asignaciones.map(a => a.producto_id);
    const { data: destacados } = await supabase
      .from('productos')
      .select('*, categorias(nombre, emoji)')
      .eq('disponible', true)
      .in('id', productIds)
      .order('orden')
      .limit(4);

    if (destacados && destacados.length > 0) {
      return NextResponse.json(destacados);
    }
  }

  // Si no hay destacados por tienda, obtener productos aleatorios de la tienda
  const { data: todosAsignados } = await supabase
    .from('productos_tiendas')
    .select('producto_id')
    .eq('tienda_id', tiendaId)
    .eq('disponible', true);

  if (todosAsignados && todosAsignados.length > 0) {
    const productIds = todosAsignados.map(a => a.producto_id);
    const { data: fallback } = await supabase
      .from('productos')
      .select('*, categorias(nombre, emoji)')
      .eq('disponible', true)
      .in('id', productIds)
      .limit(4);
    return NextResponse.json(fallback || []);
  }

  return NextResponse.json([]);
}
