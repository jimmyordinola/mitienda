import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente admin para bypass de RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET - Obtener todas las ventas con detalles
export async function GET() {
  try {
    const { data: ventas, error } = await supabase
      .from('ventas')
      .select(`
        *,
        clientes:cliente_id (id, nombre, telefono),
        detalles:venta_detalle (
          *,
          productos:producto_id (id, nombre, imagen)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(ventas || []);
  } catch (e) {
    console.error('Error in ventas API:', e);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
