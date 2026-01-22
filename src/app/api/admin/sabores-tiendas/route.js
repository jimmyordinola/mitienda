import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Obtener asignaciones de un sabor
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sabor_id = searchParams.get('sabor_id');

  if (!sabor_id) {
    return NextResponse.json({ error: 'sabor_id requerido' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('sabores_tiendas')
    .select('*')
    .eq('sabor_id', sabor_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
