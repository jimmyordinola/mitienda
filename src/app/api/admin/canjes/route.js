import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET - Obtener todos los canjes
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const limit = searchParams.get('limit') || 100;

    let query = supabase
      .from('canjes_recompensas')
      .select(`
        *,
        cliente:clientes(id, nombre, telefono),
        recompensa:recompensas(id, nombre, tipo, puntos_requeridos)
      `)
      .order('fecha_canje', { ascending: false })
      .limit(Number(limit));

    if (estado) {
      query = query.eq('estado', estado);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Actualizar estado de canje (marcar como usado, expirado, etc.)
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, estado } = body;

    if (!id || !estado) {
      return NextResponse.json({ error: 'ID y estado requeridos' }, { status: 400 });
    }

    const updateData = { estado };

    // Si se marca como usado, registrar fecha
    if (estado === 'usado') {
      updateData.fecha_uso = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('canjes_recompensas')
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
