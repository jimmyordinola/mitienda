import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET - Obtener configuración de fidelidad
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('config_fidelidad')
      .select('*')
      .order('clave');

    if (error) throw error;

    // Convertir a objeto clave-valor para más fácil manejo
    const config = {};
    data.forEach(item => {
      config[item.clave] = {
        valor: item.valor,
        descripcion: item.descripcion,
        id: item.id
      };
    });

    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Actualizar configuración
export async function PUT(request) {
  try {
    const body = await request.json();
    const { clave, valor } = body;

    if (!clave || valor === undefined) {
      return NextResponse.json({ error: 'Clave y valor requeridos' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('config_fidelidad')
      .update({ valor: String(valor), updated_at: new Date().toISOString() })
      .eq('clave', clave)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
