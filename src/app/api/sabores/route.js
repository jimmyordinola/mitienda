import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tienda_id = searchParams.get('tienda_id');
  const categoria_id = searchParams.get('categoria_id');

  // Obtener todos los sabores activos
  let query = supabase
    .from('sabores')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true });

  // Filtrar por categoría si se especifica
  if (categoria_id) {
    query = query.or(`categoria_id.eq.${categoria_id},categoria_id.is.null`);
  }

  const { data: allSabores, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Si no hay tienda_id, devolver todos los sabores
  if (!tienda_id) {
    return NextResponse.json(allSabores || []);
  }

  // Obtener solo los sabores asignados a esta tienda desde la tabla junction
  const { data: asignaciones } = await supabase
    .from('sabores_tiendas')
    .select('sabor_id')
    .eq('tienda_id', tienda_id)
    .eq('disponible', true);

  if (!asignaciones || asignaciones.length === 0) {
    return NextResponse.json([]);
  }

  const saboresAsignadosIds = new Set(asignaciones.map(a => a.sabor_id));

  // Filtrar: solo mostrar sabores asignados a esta tienda
  const saboresFiltrados = (allSabores || []).filter(sabor =>
    saboresAsignadosIds.has(sabor.id)
  );

  return NextResponse.json(saboresFiltrados);
}
