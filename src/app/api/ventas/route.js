import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// POST - Procesar venta
export async function POST(request) {
  const { cliente_id, items, total, usar_puntos = 0 } = await request.json();

  // Calcular puntos a ganar (1 punto por cada $10)
  const puntos_ganados = Math.floor(total / 10);

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
  const { data: venta, error: ventaError } = await supabase
    .from('ventas')
    .insert([{
      cliente_id: cliente_id || null,
      total,
      puntos_ganados
    }])
    .select()
    .single();

  if (ventaError) {
    return NextResponse.json({ error: ventaError.message }, { status: 500 });
  }

  // Insertar detalle de venta
  const detalles = items.map(item => ({
    venta_id: venta.id,
    producto_id: item.id,
    cantidad: item.cantidad,
    precio_unitario: item.precio
  }));

  await supabase.from('venta_detalle').insert(detalles);

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
    total,
    puntos_ganados,
    puntos_usados: usar_puntos,
    mensaje: cliente_id
      ? `¡Ganaste ${puntos_ganados} puntos!`
      : 'Venta completada (sin acumular puntos)'
  });
}
