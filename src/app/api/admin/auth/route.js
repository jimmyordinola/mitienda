import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(request) {
  const { email, password } = await request.json();

  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .eq('password_hash', password)
    .eq('activo', true)
    .single();

  if (error || !admin) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  }

  const { password_hash: _, ...adminSinPassword } = admin;
  return NextResponse.json(adminSinPassword);
}
