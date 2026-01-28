import { NextResponse } from 'next/server';

const API_TOKEN = process.env.APIS_NET_PE_TOKEN;
const API_BASE_URL = 'https://api.apis.net.pe/v2';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get('tipo'); // 'dni' o 'ruc'
  const numero = searchParams.get('numero');

  if (!tipo || !numero) {
    return NextResponse.json(
      { error: 'Faltan parametros: tipo y numero requeridos' },
      { status: 400 }
    );
  }

  // Validar longitud
  if (tipo === 'dni' && numero.length !== 8) {
    return NextResponse.json(
      { error: 'DNI debe tener 8 digitos' },
      { status: 400 }
    );
  }

  if (tipo === 'ruc' && numero.length !== 11) {
    return NextResponse.json(
      { error: 'RUC debe tener 11 digitos' },
      { status: 400 }
    );
  }

  if (!API_TOKEN) {
    return NextResponse.json(
      { error: 'API no configurada' },
      { status: 500 }
    );
  }

  try {
    // Usar token en query string (más confiable según documentación)
    const endpoint = tipo === 'dni'
      ? `${API_BASE_URL}/reniec/dni?numero=${numero}&token=${API_TOKEN}`
      : `${API_BASE_URL}/sunat/ruc?numero=${numero}&token=${API_TOKEN}`;

    const response = await fetch(endpoint, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'No se encontro el documento' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Normalizar respuesta
    if (tipo === 'dni') {
      return NextResponse.json({
        success: true,
        tipo: 'dni',
        numero: data.numeroDocumento || numero,
        nombre: `${data.nombres || ''} ${data.apellidoPaterno || ''} ${data.apellidoMaterno || ''}`.trim(),
        nombres: data.nombres,
        apellidoPaterno: data.apellidoPaterno,
        apellidoMaterno: data.apellidoMaterno
      });
    } else {
      return NextResponse.json({
        success: true,
        tipo: 'ruc',
        numero: data.numeroDocumento || numero,
        razonSocial: data.razonSocial || data.nombre || '',
        direccion: data.direccion || '',
        estado: data.estado,
        condicion: data.condicion,
        ubigeo: data.ubigeo,
        departamento: data.departamento,
        provincia: data.provincia,
        distrito: data.distrito
      });
    }
  } catch (error) {
    console.error('Error consultando documento:', error);
    return NextResponse.json(
      { error: 'Error al consultar el documento' },
      { status: 500 }
    );
  }
}
