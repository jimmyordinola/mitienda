import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Obtener todos los cupones
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tienda_id = searchParams.get('tienda_id');

  let query = supabase.from('cupones').select('*, tiendas(nombre)').order('created_at', { ascending: false });

  if (tienda_id) {
    query = query.eq('tienda_id', tienda_id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST - Crear cupón
export async function POST(request) {
  const cupon = await request.json();

  const { data, error } = await supabase
    .from('cupones')
    .insert([cupon])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'El código ya existe' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// PUT - Actualizar cupón
export async function PUT(request) {
  const { id, ...cupon } = await request.json();

  const { data, error } = await supabase
    .from('cupones')
    .update(cupon)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE - Eliminar cupón
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const { error } = await supabase
    .from('cupones')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
