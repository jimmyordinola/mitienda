import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tiendaId = searchParams.get('tienda_id');
  const categoriaId = searchParams.get('categoria_id');

  let query = supabase
    .from('productos')
    .select('*, categorias(nombre, emoji)')
    .eq('disponible', true);

  if (tiendaId) {
    query = query.eq('tienda_id', tiendaId);
  }

  if (categoriaId) {
    query = query.eq('categoria_id', categoriaId);
  }

  const { data, error } = await query
    .order('orden')
    .order('nombre');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
