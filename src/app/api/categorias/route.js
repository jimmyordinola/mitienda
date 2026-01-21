import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tiendaId = searchParams.get('tienda_id');

  if (tiendaId) {
    // Obtener categorías asignadas a esta tienda desde tiendas_categorias
    const { data: asignaciones, error: errorAsign } = await supabase
      .from('tiendas_categorias')
      .select(`
        categoria_id,
        orden,
        categorias (id, nombre, descripcion, emoji, imagen, orden, activo)
      `)
      .eq('tienda_id', tiendaId)
      .eq('activo', true)
      .order('orden');

    if (errorAsign) {
      // Si la tabla tiendas_categorias no existe o hay error, usar fallback
      console.log('Fallback: usando categorias directamente');
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('activo', true)
        .order('orden');

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json(data);
    }

    // Extraer las categorías de las asignaciones
    const categorias = asignaciones
      ?.map(a => a.categorias)
      .filter(Boolean)
      .filter(c => c.activo);

    // Si no hay categorías asignadas, devolver todas las activas
    if (!categorias || categorias.length === 0) {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('activo', true)
        .order('orden');

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json(data);
    }

    return NextResponse.json(categorias);
  }

  // Sin tienda específica, devolver todas las categorías activas
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('activo', true)
    .order('orden');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
