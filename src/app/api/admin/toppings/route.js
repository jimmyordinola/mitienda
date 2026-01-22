import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Obtener toppings
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tienda_id = searchParams.get('tienda_id');
  const categoria_id = searchParams.get('categoria_id');

  let query = supabase
    .from('toppings')
    .select('*')
    .order('orden', { ascending: true });

  if (tienda_id) {
    query = query.or(`tienda_id.eq.${tienda_id},tienda_id.is.null`);
  }

  if (categoria_id) {
    query = query.or(`categoria_id.eq.${categoria_id},categoria_id.is.null`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST - Crear topping
export async function POST(request) {
  const { disponible, tiendas_ids, tienda_id, ...topping } = await request.json();

  const { data, error } = await supabase
    .from('toppings')
    .insert([topping])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Asignar topping a las tiendas seleccionadas
  if (tiendas_ids && tiendas_ids.length > 0) {
    const asignaciones = tiendas_ids.map(tid => ({
      topping_id: data.id,
      tienda_id: tid,
      disponible: true
    }));
    await supabase.from('toppings_tiendas').insert(asignaciones);
  }

  return NextResponse.json(data);
}

// PUT - Actualizar topping
export async function PUT(request) {
  const { id, disponible, tiendas_ids, tienda_id, ...topping } = await request.json();

  const { data, error } = await supabase
    .from('toppings')
    .update(topping)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Actualizar asignaciones de tiendas
  if (tiendas_ids) {
    // Eliminar asignaciones existentes
    await supabase.from('toppings_tiendas').delete().eq('topping_id', id);

    // Crear nuevas asignaciones
    if (tiendas_ids.length > 0) {
      const asignaciones = tiendas_ids.map(tid => ({
        topping_id: id,
        tienda_id: tid,
        disponible: true
      }));
      await supabase.from('toppings_tiendas').insert(asignaciones);
    }
  }

  return NextResponse.json(data);
}

// DELETE - Eliminar topping
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const { error } = await supabase
    .from('toppings')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
