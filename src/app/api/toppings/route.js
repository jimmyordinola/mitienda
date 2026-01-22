import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tienda_id = searchParams.get('tienda_id');
  const categoria_id = searchParams.get('categoria_id');

  // Obtener todos los toppings activos
  let query = supabase
    .from('toppings')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true });

  // Filtrar por categoría si se especifica
  if (categoria_id) {
    query = query.or(`categoria_id.eq.${categoria_id},categoria_id.is.null`);
  }

  const { data: allToppings, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Si no hay tienda_id, devolver todos los toppings
  if (!tienda_id) {
    return NextResponse.json(allToppings || []);
  }

  // Obtener los toppings asignados a esta tienda desde la tabla junction
  const { data: asignaciones } = await supabase
    .from('toppings_tiendas')
    .select('topping_id')
    .eq('tienda_id', tienda_id)
    .eq('disponible', true);

  const toppingsAsignadosIds = new Set((asignaciones || []).map(a => a.topping_id));

  // Obtener todos los toppings que tienen alguna asignación (para saber cuáles son globales)
  const { data: todasAsignaciones } = await supabase
    .from('toppings_tiendas')
    .select('topping_id');

  const toppingsConAsignacion = new Set((todasAsignaciones || []).map(a => a.topping_id));

  // Filtrar: incluir toppings asignados a esta tienda O toppings sin ninguna asignación (globales)
  const toppingsFiltrados = (allToppings || []).filter(topping => {
    const estaAsignadoATienda = toppingsAsignadosIds.has(topping.id);
    const esGlobal = !toppingsConAsignacion.has(topping.id);
    return estaAsignadoATienda || esGlobal;
  });

  return NextResponse.json(toppingsFiltrados);
}
