import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Obtener todos los banners
export async function GET() {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .order('orden', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST - Crear banner
export async function POST(request) {
  const banner = await request.json();

  const { data, error } = await supabase
    .from('banners')
    .insert([banner])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// PUT - Actualizar banner
export async function PUT(request) {
  const { id, ...banner } = await request.json();

  const { data, error } = await supabase
    .from('banners')
    .update(banner)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE - Eliminar banner
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const { error } = await supabase
    .from('banners')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
