import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Obtener todas las promociones
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tienda_id = searchParams.get('tienda_id');

  let query = supabase.from('promociones').select('*').order('created_at', { ascending: false });

  if (tienda_id) {
    query = query.eq('tienda_id', tienda_id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST - Crear promoción
export async function POST(request) {
  const { tiendas_ids, categorias, tiendas, ...promocion } = await request.json();

  const { data, error } = await supabase
    .from('promociones')
    .insert([promocion])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Asignar promocion a las tiendas seleccionadas
  if (tiendas_ids && tiendas_ids.length > 0) {
    const asignaciones = tiendas_ids.map(tid => ({
      promocion_id: data.id,
      tienda_id: tid
    }));
    await supabase.from('promociones_tiendas').insert(asignaciones);
  }

  return NextResponse.json(data);
}

// PUT - Actualizar promocion
export async function PUT(request) {
  const { id, categorias, tiendas, tiendas_ids, ...promocion } = await request.json();

  // Limpiar campos vacios o undefined
  const cleanPromocion = {};
  for (const [key, value] of Object.entries(promocion)) {
    if (value !== '' && value !== undefined && value !== null) {
      cleanPromocion[key] = value;
    } else if (key === 'tienda_id' || key === 'categoria_id') {
      cleanPromocion[key] = null; // Permitir null para estos campos
    }
  }

  const { data, error } = await supabase
    .from('promociones')
    .update(cleanPromocion)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Actualizar asignaciones de tiendas
  if (tiendas_ids !== undefined) {
    // Eliminar asignaciones existentes
    await supabase.from('promociones_tiendas').delete().eq('promocion_id', id);

    // Crear nuevas asignaciones
    if (tiendas_ids && tiendas_ids.length > 0) {
      const asignaciones = tiendas_ids.map(tid => ({
        promocion_id: id,
        tienda_id: tid
      }));
      await supabase.from('promociones_tiendas').insert(asignaciones);
    }
  }

  return NextResponse.json(data);
}

// DELETE - Eliminar promoción
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const { error } = await supabase
    .from('promociones')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
