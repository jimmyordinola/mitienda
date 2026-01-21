import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tiendaId = searchParams.get('tienda_id');

  // Obtener productos destacados o más vendidos de la tienda
  let query = supabase
    .from('productos')
    .select('*, categorias(nombre, emoji)')
    .eq('disponible', true)
    .eq('destacado', true);

  if (tiendaId) {
    query = query.eq('tienda_id', tiendaId);
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

  // Si no hay destacados, obtener los más vendidos de la tienda
  let ventasQuery = supabase
    .from('detalle_ventas')
    .select(`
      producto_id,
      cantidad,
      productos!inner(id, nombre, precio, imagen, descripcion, disponible, tienda_id, categorias(nombre, emoji))
    `);

  if (tiendaId) {
    ventasQuery = ventasQuery.eq('productos.tienda_id', tiendaId);
  }

  const { data: ventas, error: errorVentas } = await ventasQuery;

  if (errorVentas) {
    // Si falla, devolver productos aleatorios
    let fallbackQuery = supabase
      .from('productos')
      .select('*, categorias(nombre, emoji)')
      .eq('disponible', true);

    if (tiendaId) {
      fallbackQuery = fallbackQuery.eq('tienda_id', tiendaId);
    }

    const { data: fallback } = await fallbackQuery.limit(4);
    return NextResponse.json(fallback || []);
  }

  // Agrupar y contar ventas por producto
  const conteoProductos = {};
  ventas?.forEach(v => {
    if (v.productos && v.productos.disponible) {
      const id = v.producto_id;
      if (!conteoProductos[id]) {
        conteoProductos[id] = { ...v.productos, total_vendido: 0 };
      }
      conteoProductos[id].total_vendido += v.cantidad;
    }
  });

  // Ordenar por más vendidos
  const masPedidos = Object.values(conteoProductos)
    .sort((a, b) => b.total_vendido - a.total_vendido)
    .slice(0, 4);

  return NextResponse.json(masPedidos);
}
