import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Obtener todas las ventas con detalles
export async function GET() {
  // Obtener ventas con información del cliente
  const { data: ventas, error } = await supabase
    .from('ventas')
    .select(`
      *,
      clientes (
        id,
        nombre,
        telefono
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Obtener detalles de cada venta
  const ventasConDetalles = await Promise.all(
    (ventas || []).map(async (venta) => {
      const { data: detalles } = await supabase
        .from('venta_detalle')
        .select(`
          *,
          productos (
            id,
            nombre,
            imagen
          )
        `)
        .eq('venta_id', venta.id);

      return {
        ...venta,
        detalles: detalles || []
      };
    })
  );

  return NextResponse.json(ventasConDetalles);
}
