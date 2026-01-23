import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// POST - Procesar venta
export async function POST(request) {
  const { cliente_id, items, total, descuento = 0, usar_puntos = 0 } = await request.json();

  // Requerir cliente logueado para procesar venta
  if (!cliente_id) {
    return NextResponse.json({ error: 'Debes iniciar sesión para realizar una compra' }, { status: 401 });
  }

  // Calcular total final después de descuento promoción
  const totalFinal = total - descuento;

  // Calcular puntos a ganar (1 punto por cada $10 del total con descuento)
  const puntos_ganados = Math.floor(totalFinal / 10);

  // Si usa puntos, verificar que tenga suficientes
  if (usar_puntos > 0 && cliente_id) {
    const { data: cliente } = await supabase
      .from('clientes')
      .select('puntos')
      .eq('id', cliente_id)
      .single();

    if (!cliente || cliente.puntos < usar_puntos) {
      return NextResponse.json({ error: 'Puntos insuficientes' }, { status: 400 });
    }
  }

  // Crear la venta
  console.log('Creando venta:', { cliente_id, total, descuento, totalFinal, puntos_ganados });
  const { data: venta, error: ventaError } = await supabase
    .from('ventas')
    .insert([{
      cliente_id: cliente_id || null,
      total: totalFinal,
      descuento,
      puntos_ganados
    }])
    .select()
    .single();

  if (ventaError) {
    console.error('Error creando venta:', ventaError);
    return NextResponse.json({ error: ventaError.message }, { status: 500 });
  }
  console.log('Venta creada:', venta);

  // Insertar detalle de venta
  const detalles = items.map(item => ({
    venta_id: venta.id,
    producto_id: item.id,
    cantidad: item.cantidad,
    precio_unitario: item.precioFinal || item.precio
  }));

  console.log('Insertando detalles:', detalles);
  const { error: detalleError } = await supabase.from('venta_detalle').insert(detalles);
  if (detalleError) {
    console.error('Error insertando detalles:', detalleError);
  }

  // Si hay cliente, actualizar puntos
  if (cliente_id) {
    const { data: cliente } = await supabase
      .from('clientes')
      .select('puntos')
      .eq('id', cliente_id)
      .single();

    const nuevos_puntos = (cliente?.puntos || 0) + puntos_ganados - usar_puntos;

    await supabase
      .from('clientes')
      .update({ puntos: nuevos_puntos })
      .eq('id', cliente_id);

    // Registrar transacción de puntos ganados
    if (puntos_ganados > 0) {
      await supabase.from('transacciones').insert([{
        cliente_id,
        tipo: 'GANADO',
        puntos: puntos_ganados,
        descripcion: `Compra #${venta.id} - $${total}`
      }]);
    }

    // Registrar transacción de puntos usados
    if (usar_puntos > 0) {
      await supabase.from('transacciones').insert([{
        cliente_id,
        tipo: 'CANJEADO',
        puntos: usar_puntos,
        descripcion: `Descuento en compra #${venta.id}`
      }]);
    }
  }

  return NextResponse.json({
    venta_id: venta.id,
    total: totalFinal,
    descuento,
    puntos_ganados,
    puntos_usados: usar_puntos,
    mensaje: `¡Ganaste ${puntos_ganados} puntos!`
  });
}
