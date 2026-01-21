import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Obtener todos los clientes
export async function GET() {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('nombre');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST - Crear nuevo cliente
export async function POST(request) {
  const { nombre, telefono } = await request.json();

  const { data, error } = await supabase
    .from('clientes')
    .insert([{ nombre, telefono }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'El teléfono ya está registrado' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
