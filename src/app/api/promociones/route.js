import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tiendaId = searchParams.get('tienda_id');

  let query = supabase
    .from('promociones')
    .select('*, categorias(id, nombre, emoji), productos(id, nombre, imagen, precio)')
    .eq('activo', true);

  if (tiendaId) {
    // Promociones de la tienda específica o promociones globales (sin tienda)
    query = query.or(`tienda_id.eq.${tiendaId},tienda_id.is.null`);
  }

  // Filtrar por fechas vigentes
  const hoy = new Date().toISOString().split('T')[0];
  query = query.or(`fecha_inicio.is.null,fecha_inicio.lte.${hoy}`);
  query = query.or(`fecha_fin.is.null,fecha_fin.gte.${hoy}`);

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
