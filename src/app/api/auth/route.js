import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// POST - Login con teléfono y PIN
export async function POST(request) {
  const { telefono, pin } = await request.json();

  const { data: cliente, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('telefono', telefono)
    .single();

  if (error || !cliente) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
  }

  if (cliente.pin !== pin) {
    return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 });
  }

  // No devolver el PIN
  const { pin: _, ...clienteSinPin } = cliente;
  return NextResponse.json(clienteSinPin);
}
