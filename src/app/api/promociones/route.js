import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tiendaId = searchParams.get('tienda_id');

  // First get all active promotions with product info
  let query = supabase
    .from('promociones')
    .select('*, categorias(id, nombre, emoji), productos(id, nombre, imagen, precio)')
    .eq('activo', true);

  // Filtrar por fechas vigentes
  const hoy = new Date().toISOString().split('T')[0];
  query = query.or(`fecha_inicio.is.null,fecha_inicio.lte.${hoy}`);
  query = query.or(`fecha_fin.is.null,fecha_fin.gte.${hoy}`);

  const { data: promociones, error } = await query.order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If no tienda filter, return all
  if (!tiendaId) {
    return NextResponse.json(promociones);
  }

  // Get all promociones_tiendas assignments for this tienda
  const { data: asignaciones } = await supabase
    .from('promociones_tiendas')
    .select('promocion_id')
    .eq('tienda_id', tiendaId);

  const promocionesConTienda = new Set(asignaciones?.map(a => a.promocion_id) || []);

  // Get all promocion IDs that have ANY tienda assignment
  const { data: todasAsignaciones } = await supabase
    .from('promociones_tiendas')
    .select('promocion_id');

  const promocionesConAsignacion = new Set(todasAsignaciones?.map(a => a.promocion_id) || []);

  // Filter: promociones assigned to this tienda OR promociones with no assignments (global)
  const resultado = promociones.filter(p => {
    // If this promocion has specific tienda assignments, check if current tienda is included
    if (promocionesConAsignacion.has(p.id)) {
      return promocionesConTienda.has(p.id);
    }
    // If no tienda assignments, it's global (available everywhere)
    return true;
  });

  return NextResponse.json(resultado);
}
