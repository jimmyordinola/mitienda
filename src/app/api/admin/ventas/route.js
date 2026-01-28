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
    console.log('=== FETCHING VENTAS ===');

    // Obtener ventas ordenadas por fecha
    const { data: ventas, error } = await supabase
      .from('ventas')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('Ventas result:', { ventas, error });

    if (error) {
      console.error('Error fetching ventas:', error);
      return NextResponse.json({ error: error.message, debug: 'fetch_error' });
    }

    if (!ventas || ventas.length === 0) {
      console.log('No ventas found');
      return NextResponse.json({ debug: 'no_ventas', ventas: [] });
    }

    console.log('Found ventas:', ventas.length);

    // Obtener detalles de cada venta con info del cliente
    const ventasConDetalles = await Promise.all(
      ventas.map(async (venta) => {
        // Obtener cliente si existe
        let cliente = null;
        if (venta.cliente_id) {
          const { data: clienteData } = await supabase
            .from('clientes')
            .select('id, nombre, telefono')
            .eq('id', venta.cliente_id)
            .single();
          cliente = clienteData;
        }

        // Obtener detalles de la venta
        const { data: detalles } = await supabase
          .from('venta_detalle')
          .select('*')
          .eq('venta_id', venta.id);

        // Obtener info de productos para cada detalle
        const detallesConProducto = await Promise.all(
          (detalles || []).map(async (detalle) => {
            const { data: producto } = await supabase
              .from('productos')
              .select('id, nombre, imagen')
              .eq('id', detalle.producto_id)
              .single();
            return { ...detalle, productos: producto };
          })
        );

        return {
          ...venta,
          clientes: cliente,
          detalles: detallesConProducto
        };
      })
    );

    return NextResponse.json(ventasConDetalles);
  } catch (e) {
    console.error('Error in ventas API:', e);
    return NextResponse.json([]);
  }
}
