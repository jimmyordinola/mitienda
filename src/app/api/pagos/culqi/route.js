import { NextResponse } from 'next/server';

const CULQI_SECRET_KEY = process.env.CULQI_SECRET_KEY;
const CULQI_API_URL = 'https://api.culqi.com/v2';

// POST - Crear cargo con Culqi
export async function POST(request) {
  try {
    const { token, amount, email, description, metadata } = await request.json();

    if (!token || !amount || !email) {
      return NextResponse.json(
        { error: 'Token, amount y email son requeridos' },
        { status: 400 }
      );
    }

    // Crear el cargo en Culqi
    const chargeResponse = await fetch(`${CULQI_API_URL}/charges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CULQI_SECRET_KEY}`
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Culqi usa centavos
        currency_code: 'PEN',
        email,
        source_id: token,
        description: description || 'Compra en El Chalán Heladería',
        metadata: metadata || {}
      })
    });

    const chargeData = await chargeResponse.json();

    if (!chargeResponse.ok) {
      console.error('Culqi error:', chargeData);
      return NextResponse.json(
        { error: chargeData.user_message || chargeData.merchant_message || 'Error al procesar el pago' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      charge_id: chargeData.id,
      amount: chargeData.amount / 100,
      status: chargeData.outcome?.type || 'captured'
    });

  } catch (error) {
    console.error('Error procesando pago:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar el pago' },
      { status: 500 }
    );
  }
}
