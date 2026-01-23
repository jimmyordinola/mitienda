import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(request) {
  try {
    const { auth_id, email, nombre, avatar_url } = await request.json();

    console.log('Auth social request:', { auth_id, email, nombre });

    if (!auth_id || !email) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Primero verificar si las columnas existen intentando una query simple
    const { data: testData, error: testError } = await supabase
      .from('clientes')
      .select('id, nombre, puntos')
      .limit(1);

    if (testError) {
      console.error('Error accediendo a clientes:', testError);
      return NextResponse.json({ error: testError.message }, { status: 500 });
    }

    // Buscar cliente existente por auth_id
    let { data: cliente, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('auth_id', auth_id)
      .maybeSingle();

    if (error && !error.message.includes('column')) {
      console.error('Error buscando por auth_id:', error);
    }

    // Si no existe por auth_id, buscar por email
    if (!cliente) {
      const { data: clientePorEmail, error: emailError } = await supabase
        .from('clientes')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (emailError && !emailError.message.includes('column')) {
        console.error('Error buscando por email:', emailError);
      }

      if (clientePorEmail) {
        // Vincular cuenta existente con auth_id
        const { data: clienteActualizado, error: updateError } = await supabase
          .from('clientes')
          .update({ auth_id, avatar_url })
          .eq('id', clientePorEmail.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error actualizando cliente:', updateError);
          // Si falla por columnas faltantes, devolver cliente sin actualizar
          cliente = clientePorEmail;
        } else {
          cliente = clienteActualizado;
        }
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
        console.error('Error creando cliente:', insertError);
        // Intentar crear con campos mínimos si fallan las columnas nuevas
        const { data: clienteMinimo, error: minError } = await supabase
          .from('clientes')
          .insert([{
            nombre,
            puntos: 0
          }])
          .select()
          .single();

        if (minError) {
          return NextResponse.json({ error: 'No se pudo crear el cliente: ' + minError.message }, { status: 500 });
        }
        cliente = clienteMinimo;
      } else {
        cliente = nuevoCliente;
      }
    }

    // No devolver el PIN en la respuesta
    const { pin, ...clienteSinPin } = cliente;
    return NextResponse.json(clienteSinPin);

  } catch (err) {
    console.error('Error general en auth/social:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
