import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(request) {
  try {
    const { auth_id, email, nombre, avatar_url } = await request.json();

    console.log('Auth social request:', { auth_id, email, nombre });

    if (!auth_id || !email) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Verificar si las columnas auth_id y email existen
    let columnasExisten = false;
    try {
      const { data: columnas } = await supabase.rpc('get_columns_info', { table_name: 'clientes' });
      columnasExisten = columnas?.some(c => c.column_name === 'auth_id');
    } catch {
      // Si falla el RPC, intentamos directamente
      const { error: testError } = await supabase
        .from('clientes')
        .select('auth_id')
        .limit(1);
      columnasExisten = !testError;
    }

    let cliente = null;

    if (columnasExisten) {
      // Buscar cliente existente por auth_id
      const { data: clientePorAuth } = await supabase
        .from('clientes')
        .select('*')
        .eq('auth_id', auth_id)
        .maybeSingle();

      if (clientePorAuth) {
        cliente = clientePorAuth;
      } else {
        // Buscar por email
        const { data: clientePorEmail } = await supabase
          .from('clientes')
          .select('*')
          .eq('email', email)
          .maybeSingle();

        if (clientePorEmail) {
          // Vincular cuenta existente
          const { data: updated } = await supabase
            .from('clientes')
            .update({ auth_id, avatar_url })
            .eq('id', clientePorEmail.id)
            .select()
            .single();
          cliente = updated || clientePorEmail;
        }
      }

      // Si no existe, crear nuevo
      if (!cliente) {
        const { data: nuevo, error: insertError } = await supabase
          .from('clientes')
          .insert([{ nombre, email, auth_id, avatar_url, puntos: 0 }])
          .select()
          .single();

        if (insertError) {
          console.error('Error insertando cliente completo:', insertError);
        } else {
          cliente = nuevo;
        }
      }
    }

    // Fallback: crear cliente con campos mínimos
    if (!cliente) {
      console.log('Usando fallback - creando cliente con campos mínimos');
      const { data: minimo, error: minError } = await supabase
        .from('clientes')
        .insert([{ nombre, puntos: 0 }])
        .select()
        .single();

      if (minError) {
        console.error('Error creando cliente mínimo:', minError);
        return NextResponse.json({
          error: 'No se pudo crear cliente. Ejecuta el SQL en Supabase para agregar columnas auth_id, email, avatar_url',
          details: minError.message
        }, { status: 500 });
      }
      cliente = minimo;
    }

    const { pin, ...clienteSinPin } = cliente;
    return NextResponse.json(clienteSinPin);

  } catch (err) {
    console.error('Error general en auth/social:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
