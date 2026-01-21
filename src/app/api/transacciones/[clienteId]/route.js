import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(request, { params }) {
  const { clienteId } = params;

  const { data, error } = await supabase
    .from('transacciones')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('fecha', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
