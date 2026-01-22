import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

// GET - Obtener asignaciones de un topping
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const topping_id = searchParams.get('topping_id');

  if (!topping_id) {
    return NextResponse.json({ error: 'topping_id requerido' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('toppings_tiendas')
    .select('*')
    .eq('topping_id', topping_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
