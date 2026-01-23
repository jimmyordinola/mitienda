import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(request) {
  try {
    const { auth_id, email, nombre, avatar_url } = await request.json();

    console.log('Auth social request:', { auth_id, email, nombre });

    if (!auth_id || !email) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    let cliente = null;

    // Buscar cliente existente por auth_id
    const { data: clientePorAuth, error: authError } = await supabase
      .from('clientes')
      .select('*')
      .eq('auth_id', auth_id)
      .maybeSingle();

    if (authError) {
      console.error('Error buscando por auth_id:', authError);
    }

    if (clientePorAuth) {
      cliente = clientePorAuth;
    } else {
      // Buscar por email
      const { data: clientePorEmail, error: emailError } = await supabase
        .from('clientes')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (emailError) {
        console.error('Error buscando por email:', emailError);
      }

      if (clientePorEmail) {
        // Vincular cuenta existente con auth_id
        const { data: updated, error: updateError } = await supabase
          .from('clientes')
          .update({ auth_id, avatar_url })
          .eq('id', clientePorEmail.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error actualizando:', updateError);
          cliente = clientePorEmail;
        } else {
          cliente = updated;
        }
      }
    }

    // Si no existe, crear nuevo cliente
    if (!cliente) {
      const { data: nuevo, error: insertError } = await supabase
        .from('clientes')
        .insert([{ nombre, email, auth_id, avatar_url, puntos: 0 }])
        .select()
        .single();

      if (insertError) {
        console.error('Error insertando cliente:', insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      cliente = nuevo;
    }

    const { pin, ...clienteSinPin } = cliente;
    return NextResponse.json(clienteSinPin);

  } catch (err) {
    console.error('Error general en auth/social:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
