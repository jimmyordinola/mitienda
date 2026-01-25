import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente admin para bypass de RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Generar código único para cupón
function generarCodigoCupon() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = 'CHALAN-';
  for (let i = 0; i < 6; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return codigo;
}

// POST - Procesar venta
export async function POST(request) {
  const {
    cliente_id,
    tienda_id,
    items,
    total,
    descuento = 0,
    cupon_codigo = null,
    metodo_pago = 'efectivo',
    referencia_pago = null,
    horario_recojo = null
  } = await request.json();

  // Requerir cliente logueado
  if (!cliente_id) {
    return NextResponse.json({ error: 'Debes iniciar sesión para realizar una compra' }, { status: 401 });
  }

  // Calcular totales
  let descuentoCupon = 0;
  let cuponUsado = null;

  // Verificar y aplicar cupón si existe
  if (cupon_codigo) {
    const { data: cupon } = await supabaseAdmin
      .from('cupones')
      .select('*')
      .eq('codigo', cupon_codigo)
      .eq('cliente_id', cliente_id)
      .eq('tienda_id', tienda_id)
      .eq('estado', 'vigente')
      .single();

    if (cupon) {
      // Verificar que no esté vencido
      const hoy = new Date();
      const fechaFin = new Date(cupon.fecha_fin);
      if (fechaFin >= hoy) {
        descuentoCupon = cupon.valor;
        cuponUsado = cupon;
      }
    }
  }

  const totalFinal = Math.max(0, total - descuento - descuentoCupon);

  // Puntos a ganar: 1 punto por cada sol gastado
  const puntos_ganados = Math.floor(totalFinal);

  // Crear la venta
  const { data: venta, error: ventaError } = await supabaseAdmin
    .from('ventas')
    .insert([{
      cliente_id,
      tienda_id,
      total: totalFinal,
      descuento: descuento + descuentoCupon,
      puntos_ganados,
      metodo_pago,
      referencia_pago,
      horario_recojo
    }])
    .select()
    .single();

  if (ventaError) {
    console.error('Error creando venta:', ventaError);
    return NextResponse.json({ error: ventaError.message }, { status: 500 });
  }

  // Insertar detalle de venta
  const detalles = items.map(item => ({
    venta_id: venta.id,
    producto_id: item.id,
    cantidad: item.cantidad,
    precio_unitario: item.precioFinal || item.precio
  }));

  await supabaseAdmin.from('venta_detalle').insert(detalles);

  // Marcar cupón como canjeado
  if (cuponUsado) {
    await supabaseAdmin
      .from('cupones')
      .update({
        estado: 'canjeado',
        fecha_canje: new Date().toISOString()
      })
      .eq('id', cuponUsado.id);
  }

  // Actualizar puntos por tienda
  let cuponGenerado = null;
  let puntosActuales = 0;

  if (tienda_id && puntos_ganados > 0) {
    // Obtener o crear registro de puntos para esta tienda
    const { data: puntosExistentes } = await supabaseAdmin
      .from('puntos_tienda')
      .select('*')
      .eq('cliente_id', cliente_id)
      .eq('tienda_id', tienda_id)
      .single();

    if (puntosExistentes) {
      // Actualizar puntos existentes
      const nuevosPuntos = puntosExistentes.puntos + puntos_ganados;
      const nuevosTotales = puntosExistentes.puntos_totales + puntos_ganados;

      await supabaseAdmin
        .from('puntos_tienda')
        .update({
          puntos: nuevosPuntos,
          puntos_totales: nuevosTotales,
          updated_at: new Date().toISOString()
        })
        .eq('id', puntosExistentes.id);

      puntosActuales = nuevosPuntos;
    } else {
      // Crear nuevo registro
      await supabaseAdmin
        .from('puntos_tienda')
        .insert([{
          cliente_id,
          tienda_id,
          puntos: puntos_ganados,
          puntos_totales: puntos_ganados
        }]);

      puntosActuales = puntos_ganados;
    }

    // Verificar si alcanzó 75 puntos para generar cupón
    if (puntosActuales >= 75) {
      const cuponesAGenerar = Math.floor(puntosActuales / 75);
      const puntosRestantes = puntosActuales % 75;

      // Actualizar puntos restantes
      await supabaseAdmin
        .from('puntos_tienda')
        .update({
          puntos: puntosRestantes,
          updated_at: new Date().toISOString()
        })
        .eq('cliente_id', cliente_id)
        .eq('tienda_id', tienda_id);

      // Generar cupón(es)
      for (let i = 0; i < cuponesAGenerar; i++) {
        const codigo = generarCodigoCupon();
        const fechaVencimiento = new Date();
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 2); // 2 meses de vigencia

        const { data: nuevoCupon } = await supabaseAdmin
          .from('cupones')
          .insert([{
            codigo,
            cliente_id,
            tienda_id,
            descripcion: 'Cupón de fidelidad - 75 puntos',
            tipo: 'fidelidad',
            valor: 15,
            minimo_compra: 0,
            max_usos: 1,
            usos_actuales: 0,
            fecha_inicio: new Date().toISOString().split('T')[0],
            fecha_fin: fechaVencimiento.toISOString().split('T')[0],
            activo: true,
            estado: 'vigente',
            origen: 'fidelidad'
          }])
          .select()
          .single();

        if (i === 0) cuponGenerado = nuevoCupon;
      }

      puntosActuales = puntosRestantes;
    }
  }

  // Registrar transacción de puntos
  if (puntos_ganados > 0) {
    await supabaseAdmin.from('transacciones').insert([{
      cliente_id,
      tipo: 'GANADO',
      puntos: puntos_ganados,
      descripcion: `Compra #${venta.id} - S/${totalFinal.toFixed(2)}`
    }]);
  }

  const response = {
    venta_id: venta.id,
    total: totalFinal,
    descuento: descuento + descuentoCupon,
    puntos_ganados,
    puntos_actuales: puntosActuales,
    mensaje: `+${puntos_ganados} puntos acumulados`
  };

  if (cuponGenerado) {
    response.cupon_generado = {
      codigo: cuponGenerado.codigo,
      valor: cuponGenerado.valor,
      fecha_vencimiento: cuponGenerado.fecha_fin
    };
    response.mensaje = `¡Felicidades! Ganaste un cupón de S/15 por acumular 75 puntos`;
  }

  return NextResponse.json(response);
}
