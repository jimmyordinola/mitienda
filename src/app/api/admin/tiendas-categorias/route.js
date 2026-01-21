import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Obtener categorías por tienda
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tienda_id = searchParams.get('tienda_id');

  let query = supabase
    .from('tiendas_categorias')
    .select(`
      id,
      tienda_id,
      categoria_id,
      activo,
      orden,
      categorias (id, nombre, emoji, descripcion),
      tiendas (id, nombre)
    `)
    .order('orden', { ascending: true });

  if (tienda_id) {
    query = query.eq('tienda_id', tienda_id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST - Asignar categoría a tienda
export async function POST(request) {
  const body = await request.json();

  // Si viene un array de asignaciones, insertar multiples
  if (Array.isArray(body)) {
    const { data, error } = await supabase
      .from('tiendas_categorias')
      .upsert(body, { onConflict: 'tienda_id,categoria_id' })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  }

  // Si viene un objeto individual
  const { data, error } = await supabase
    .from('tiendas_categorias')
    .upsert([body], { onConflict: 'tienda_id,categoria_id' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// PUT - Actualizar asignación (orden, activo)
export async function PUT(request) {
  const { id, ...datos } = await request.json();

  const { data, error } = await supabase
    .from('tiendas_categorias')
    .update(datos)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE - Quitar categoría de tienda
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const tienda_id = searchParams.get('tienda_id');
  const categoria_id = searchParams.get('categoria_id');

  let query = supabase.from('tiendas_categorias').delete();

  if (id) {
    query = query.eq('id', id);
  } else if (tienda_id && categoria_id) {
    query = query.eq('tienda_id', tienda_id).eq('categoria_id', categoria_id);
  } else {
    return NextResponse.json({ error: 'Se requiere id o tienda_id y categoria_id' }, { status: 400 });
  }

  const { error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
