import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET() {
  // Total de clientes
  const { count: totalClientes } = await supabase
    .from('clientes')
    .select('*', { count: 'exact', head: true });

  // Suma total de puntos
  const { data: puntosData } = await supabase
    .from('clientes')
    .select('puntos');

  const totalPuntos = puntosData?.reduce((sum, c) => sum + (c.puntos || 0), 0) || 0;

  // Top 5 clientes
  const { data: topClientes } = await supabase
    .from('clientes')
    .select('*')
    .order('puntos', { ascending: false })
    .limit(5);

  return NextResponse.json({
    totalClientes: totalClientes || 0,
    totalPuntos,
    topClientes: topClientes || []
  });
}
