import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(request) {
  const { cliente_id, puntos, descripcion, tipo } = await request.json();

  // Verificar puntos si es canje
  if (tipo === 'canjear') {
    const { data: cliente } = await supabase
      .from('clientes')
      .select('puntos')
      .eq('id', cliente_id)
      .single();

    if (!cliente || cliente.puntos < puntos) {
      return NextResponse.json({ error: 'Puntos insuficientes' }, { status: 400 });
    }

    // Restar puntos
    await supabase
      .from('clientes')
      .update({ puntos: cliente.puntos - puntos })
      .eq('id', cliente_id);

    // Registrar transacción
    await supabase.from('transacciones').insert([{
      cliente_id,
      tipo: 'CANJEADO',
      puntos,
      descripcion: descripcion || 'Canje de premio'
    }]);
  } else {
    // Obtener puntos actuales
    const { data: cliente } = await supabase
      .from('clientes')
      .select('puntos')
      .eq('id', cliente_id)
      .single();

    // Sumar puntos
    await supabase
      .from('clientes')
      .update({ puntos: (cliente?.puntos || 0) + puntos })
      .eq('id', cliente_id);

    // Registrar transacción
    await supabase.from('transacciones').insert([{
      cliente_id,
      tipo: 'GANADO',
      puntos,
      descripcion: descripcion || 'Compra de helado'
    }]);
  }

  // Devolver cliente actualizado
  const { data: clienteActualizado } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', cliente_id)
    .single();

  return NextResponse.json(clienteActualizado);
}
