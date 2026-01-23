import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usar service role key para bypass de RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET - Obtener todos los clientes
export async function GET() {
  console.log('Fetching clientes...');

  const { data, error } = await supabaseAdmin
    .from('clientes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching clientes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log('Clientes found:', data?.length || 0);
  return NextResponse.json(data || []);
}
