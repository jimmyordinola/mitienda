import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(request) {
  const { auth_id, email, nombre, avatar_url } = await request.json();

  if (!auth_id || !email) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  // Buscar cliente existente por auth_id
  let { data: cliente, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('auth_id', auth_id)
    .single();

  // Si no existe por auth_id, buscar por email
  if (!cliente) {
    const { data: clientePorEmail } = await supabase
      .from('clientes')
      .select('*')
      .eq('email', email)
      .single();

    if (clientePorEmail) {
      // Vincular cuenta existente con auth_id
      const { data: clienteActualizado, error: updateError } = await supabase
        .from('clientes')
        .update({ auth_id, avatar_url })
        .eq('id', clientePorEmail.id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      cliente = clienteActualizado;
    }
  }

  // Si aún no existe, crear nuevo cliente
  if (!cliente) {
    const { data: nuevoCliente, error: insertError } = await supabase
      .from('clientes')
      .insert([{
        nombre,
        email,
        auth_id,
        avatar_url,
        puntos: 0
      }])
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    cliente = nuevoCliente;
  }

  // No devolver el PIN en la respuesta
  const { pin, ...clienteSinPin } = cliente;
  return NextResponse.json(clienteSinPin);
}
