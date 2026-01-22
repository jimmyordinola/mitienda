import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tiendaId = searchParams.get('tienda_id');

  // Si hay tienda, obtener los IDs de productos asignados a esa tienda
  let productosAsignados = null;
  if (tiendaId) {
    const { data: asignaciones } = await supabase
      .from('productos_tiendas')
      .select('producto_id')
      .eq('tienda_id', tiendaId)
      .eq('disponible', true);

    if (!asignaciones || asignaciones.length === 0) {
      return NextResponse.json([]);
    }
    productosAsignados = asignaciones.map(a => a.producto_id);
  }

  // Obtener productos destacados
  let query = supabase
    .from('productos')
    .select('*, categorias(nombre, emoji)')
    .eq('disponible', true)
    .eq('destacado', true);

  if (productosAsignados) {
    query = query.in('id', productosAsignados);
  }

  const { data: destacados, error: errorDestacados } = await query
    .order('orden')
    .limit(4);

  if (errorDestacados) {
    return NextResponse.json({ error: errorDestacados.message }, { status: 500 });
  }

  // Si hay productos destacados, devolverlos
  if (destacados && destacados.length > 0) {
    return NextResponse.json(destacados);
  }

  // Si no hay destacados, obtener productos aleatorios de la tienda
  let fallbackQuery = supabase
    .from('productos')
    .select('*, categorias(nombre, emoji)')
    .eq('disponible', true);

  if (productosAsignados) {
    fallbackQuery = fallbackQuery.in('id', productosAsignados);
  }

  const { data: fallback } = await fallbackQuery.limit(4);
  return NextResponse.json(fallback || []);
}
