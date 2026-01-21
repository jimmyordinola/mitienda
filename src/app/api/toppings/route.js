import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tienda_id = searchParams.get('tienda_id');
  const categoria_id = searchParams.get('categoria_id');

  let query = supabase
    .from('toppings')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true });

  // Filtrar por tienda (incluye toppings globales sin tienda)
  if (tienda_id) {
    query = query.or(`tienda_id.eq.${tienda_id},tienda_id.is.null`);
  }

  // Filtrar por categoria (incluye toppings globales sin categoria)
  if (categoria_id) {
    query = query.or(`categoria_id.eq.${categoria_id},categoria_id.is.null`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
