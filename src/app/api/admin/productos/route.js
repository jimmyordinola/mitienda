import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Obtener todos los productos
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tienda_id = searchParams.get('tienda_id');

  let query = supabase.from('productos').select('*, categorias(nombre)').order('categoria_id').order('nombre');

  if (tienda_id) {
    query = query.eq('tienda_id', tienda_id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST - Crear producto
export async function POST(request) {
  const { activo, categorias, tiendas_ids, tiendas_destacadas, tienda_id, ...producto } = await request.json();

  const { data, error } = await supabase
    .from('productos')
    .insert([producto])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Asignar producto a las tiendas seleccionadas
  if (tiendas_ids && tiendas_ids.length > 0) {
    const destacadasSet = new Set(tiendas_destacadas || []);
    const asignaciones = tiendas_ids.map(tid => ({
      producto_id: data.id,
      tienda_id: tid,
      disponible: true,
      destacado: destacadasSet.has(tid)
    }));
    await supabase.from('productos_tiendas').insert(asignaciones);
  }

  return NextResponse.json(data);
}

// PUT - Actualizar producto
export async function PUT(request) {
  const { id, activo, categorias, tiendas_ids, tiendas_destacadas, tienda_id, ...producto } = await request.json();

  const { data, error } = await supabase
    .from('productos')
    .update(producto)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Actualizar asignaciones de tiendas
  if (tiendas_ids) {
    // Eliminar asignaciones existentes
    await supabase.from('productos_tiendas').delete().eq('producto_id', id);

    // Crear nuevas asignaciones
    if (tiendas_ids.length > 0) {
      const destacadasSet = new Set(tiendas_destacadas || []);
      const asignaciones = tiendas_ids.map(tid => ({
        producto_id: id,
        tienda_id: tid,
        disponible: true,
        destacado: destacadasSet.has(tid)
      }));
      await supabase.from('productos_tiendas').insert(asignaciones);
    }
  }

  return NextResponse.json(data);
}

// DELETE - Eliminar producto
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
