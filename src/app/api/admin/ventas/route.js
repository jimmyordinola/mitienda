import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Obtener todas las ventas con detalles
export async function GET() {
  try {
    // Obtener ventas (sin join a clientes para evitar errores de FK)
    const { data: ventas, error } = await supabase
      .from('ventas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ventas:', error);
      return NextResponse.json([]);
    }

    if (!ventas || ventas.length === 0) {
      return NextResponse.json([]);
    }

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
