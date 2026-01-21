import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Obtener banners activos (para el slider público)
export async function GET() {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
