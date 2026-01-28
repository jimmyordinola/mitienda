import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Obtener tiendas asignadas a una categoría
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const categoria_id = searchParams.get('categoria_id');

  if (!categoria_id) {
    return NextResponse.json({ error: 'categoria_id requerido' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('tiendas_categorias')
    .select('*')
    .eq('categoria_id', categoria_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
