import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(request, { params }) {
  const { telefono } = params;

  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('telefono', telefono)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
  }

  return NextResponse.json(data);
}
