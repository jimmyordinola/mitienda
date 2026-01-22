import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Obtener asignaciones de un producto
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const producto_id = searchParams.get('producto_id');

  if (!producto_id) {
    return NextResponse.json({ error: 'producto_id requerido' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('productos_tiendas')
    .select('*, tiendas(nombre)')
    .eq('producto_id', producto_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST - Asignar producto a tienda
export async function POST(request) {
  const asignacion = await request.json();

  const { data, error } = await supabase
    .from('productos_tiendas')
    .insert([asignacion])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// PUT - Actualizar asignación (precio especial, disponibilidad)
export async function PUT(request) {
  const { id, ...asignacion } = await request.json();

  const { data, error } = await supabase
    .from('productos_tiendas')
    .update(asignacion)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE - Eliminar asignación
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const { error } = await supabase
    .from('productos_tiendas')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
