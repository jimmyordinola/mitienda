import { NextResponse } from 'next/server';

const CULQI_SECRET_KEY = process.env.CULQI_SECRET_KEY;

export async function POST(request) {
  try {
    const { token, amount, email, description, metadata } = await request.json();

    if (!token || !amount || !email) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos (token, amount, email)' },
        { status: 400 }
      );
    }

    // Crear cargo en Culqi
    const response = await fetch('https://api.culqi.com/v2/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CULQI_SECRET_KEY}`
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Culqi usa centavos
        currency_code: 'PEN',
        email: email,
        source_id: token,
        description: description || 'Compra en El Chalan',
        antifraud_details: {
          address: metadata?.direccion || 'Lima, Peru',
          address_city: 'Piura',
          country_code: 'PE',
          first_name: metadata?.nombre?.split(' ')[0] || 'Cliente',
          last_name: metadata?.nombre?.split(' ').slice(1).join(' ') || 'El Chalan',
          phone_number: metadata?.telefono || '000000000'
        },
        metadata: metadata || {}
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error de Culqi:', data);
      return NextResponse.json(
        {
          error: data.user_message || data.merchant_message || 'Error procesando el pago',
          details: data
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      charge_id: data.id,
      amount: data.amount / 100,
      currency: data.currency_code,
      reference_code: data.reference_code
    });

  } catch (error) {
    console.error('Error en API de pagos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
