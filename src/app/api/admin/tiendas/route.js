import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Obtener todas las tiendas
export async function GET() {
  const { data, error } = await supabase
    .from('tiendas')
    .select('*')
    .order('nombre');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST - Crear tienda
export async function POST(request) {
  const tienda = await request.json();

  const { data, error } = await supabase
    .from('tiendas')
    .insert([tienda])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// PUT - Actualizar tienda
export async function PUT(request) {
  const { id, ...tienda } = await request.json();

  const { data, error } = await supabase
    .from('tiendas')
    .update(tienda)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE - Eliminar tienda
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const { error } = await supabase
    .from('tiendas')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
