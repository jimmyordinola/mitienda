import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tiendaId = searchParams.get('tienda_id');
  const categoriaId = searchParams.get('categoria_id');

  let query = supabase
    .from('productos')
    .select('*, categorias(nombre, emoji)')
    .eq('disponible', true);

  // Filtrar por tienda usando la tabla productos_tiendas (muchos a muchos)
  if (tiendaId) {
    const { data: asignaciones } = await supabase
      .from('productos_tiendas')
      .select('producto_id')
      .eq('tienda_id', tiendaId)
      .eq('disponible', true);

    if (asignaciones && asignaciones.length > 0) {
      const productIds = asignaciones.map(a => a.producto_id);
      query = query.in('id', productIds);
    } else {
      // No hay productos asignados a esta tienda
      return NextResponse.json([]);
    }
  }

  if (categoriaId) {
    query = query.eq('categoria_id', categoriaId);
  }

  const { data, error } = await query
    .order('orden')
    .order('nombre');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
