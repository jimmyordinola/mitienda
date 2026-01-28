import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET - Obtener todas las recompensas
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('recompensas')
      .select('*')
      .order('puntos_requeridos', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Crear nueva recompensa
export async function POST(request) {
  try {
    const body = await request.json();
    const { nombre, descripcion, tipo, puntos_requeridos, valor, imagen, activo, stock, fecha_inicio, fecha_fin } = body;

    if (!nombre || !tipo || !puntos_requeridos) {
      return NextResponse.json({ error: 'Nombre, tipo y puntos requeridos son obligatorios' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('recompensas')
      .insert({
        nombre,
        descripcion,
        tipo,
        puntos_requeridos,
        valor: valor || null,
        imagen,
        activo: activo !== false,
        stock: stock || null,
        fecha_inicio: fecha_inicio || null,
        fecha_fin: fecha_fin || null
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Actualizar recompensa
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('recompensas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Eliminar recompensa
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const { error } = await supabase
      .from('recompensas')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
