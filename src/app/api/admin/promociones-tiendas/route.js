import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Obtener asignaciones de una promocion
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const promocion_id = searchParams.get('promocion_id');

  if (!promocion_id) {
    return NextResponse.json({ error: 'promocion_id requerido' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('promociones_tiendas')
    .select('*')
    .eq('promocion_id', promocion_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
