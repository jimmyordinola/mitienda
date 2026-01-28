import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Obtener todas las categorías
export async function GET() {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('orden');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST - Crear categoría
export async function POST(request) {
  const { disponible, tiendas_ids, ...categoria } = await request.json();

  const { data, error } = await supabase
    .from('categorias')
    .insert([categoria])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Asignar categoría a las tiendas seleccionadas
  if (tiendas_ids && tiendas_ids.length > 0) {
    const asignaciones = tiendas_ids.map(tid => ({
      categoria_id: data.id,
      tienda_id: tid,
      activo: true
    }));
    await supabase.from('tiendas_categorias').insert(asignaciones);
  }

  return NextResponse.json(data);
}

// PUT - Actualizar categoría
export async function PUT(request) {
  const { id, disponible, tiendas_ids, ...categoria } = await request.json();

  const { data, error } = await supabase
    .from('categorias')
    .update(categoria)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Actualizar asignaciones de tiendas
  if (tiendas_ids) {
    // Eliminar asignaciones existentes
    await supabase.from('tiendas_categorias').delete().eq('categoria_id', id);

    // Crear nuevas asignaciones
    if (tiendas_ids.length > 0) {
      const asignaciones = tiendas_ids.map(tid => ({
        categoria_id: id,
        tienda_id: tid,
        activo: true
      }));
      await supabase.from('tiendas_categorias').insert(asignaciones);
    }
  }

  return NextResponse.json(data);
}

// DELETE - Eliminar categoría
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const { error } = await supabase
    .from('categorias')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
