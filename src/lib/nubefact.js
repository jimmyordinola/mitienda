// Nubefact API configuration
const NUBEFACT_URL = process.env.NUBEFACT_URL || 'https://api.nubefact.com/api/v1';
const NUBEFACT_TOKEN = process.env.NUBEFACT_TOKEN;

// Generar comprobante electronico (Boleta o Factura)
export async function generarComprobante({
  tipo_comprobante, // 2 = Boleta, 1 = Factura
  cliente,
  items,
  total,
  descuento = 0,
  venta_id,
  tienda
}) {
  if (!NUBEFACT_TOKEN) {
    console.error('NUBEFACT_TOKEN no configurado');
    return null;
  }

  try {
    // Calcular valores
    const subtotal = total / 1.18; // Base imponible (sin IGV)
    const igv = total - subtotal;

    // Preparar items para Nubefact
    const itemsNubefact = items.map(item => {
      const precioUnitario = (item.precioFinal || item.precio);
      const precioSinIgv = precioUnitario / 1.18;
      const igvItem = precioUnitario - precioSinIgv;

      return {
        unidad_de_medida: 'NIU',
        codigo: item.id?.toString() || 'PROD001',
        descripcion: item.nombre + (item.personalizacion?.sabores?.length > 0
          ? ` (${item.personalizacion.sabores.map(s => s.nombre).join(', ')})`
          : ''),
        cantidad: item.cantidad,
        valor_unitario: parseFloat(precioSinIgv.toFixed(2)),
        precio_unitario: parseFloat(precioUnitario.toFixed(2)),
        descuento: 0,
        subtotal: parseFloat((precioSinIgv * item.cantidad).toFixed(2)),
        tipo_de_igv: 1,
        igv: parseFloat((igvItem * item.cantidad).toFixed(2)),
        total: parseFloat((precioUnitario * item.cantidad).toFixed(2)),
        anticipo_regularizacion: false
      };
    });

    // Determinar tipo de documento del cliente
    let tipoDocumento = '1'; // DNI por defecto
    let numeroDocumento = cliente.dni || '00000000';

    if (tipo_comprobante === 1) { // Factura
      tipoDocumento = '6'; // RUC
      numeroDocumento = cliente.ruc || cliente.dni;
    }

    const serie = tipo_comprobante === 2 ? 'B001' : 'F001';

    // Preparar documento para Nubefact
    const documento = {
      operacion: 'generar_comprobante',
      tipo_de_comprobante: tipo_comprobante,
      serie: serie,
      numero: venta_id,
      sunat_transaction: 1,
      cliente_tipo_de_documento: tipoDocumento,
      cliente_numero_de_documento: numeroDocumento,
      cliente_denominacion: cliente.nombre || 'Cliente',
      cliente_direccion: cliente.direccion || '-',
      cliente_email: cliente.email || '',
      cliente_email_1: '',
      cliente_email_2: '',
      fecha_de_emision: new Date().toISOString().split('T')[0].split('-').reverse().join('-'),
      fecha_de_vencimiento: '',
      moneda: 1,
      tipo_de_cambio: '',
      porcentaje_de_igv: 18.00,
      descuento_global: parseFloat(descuento.toFixed(2)),
      total_descuento: parseFloat(descuento.toFixed(2)),
      total_anticipo: 0,
      total_gravada: parseFloat(subtotal.toFixed(2)),
      total_inafecta: 0,
      total_exonerada: 0,
      total_igv: parseFloat(igv.toFixed(2)),
      total_gratuita: 0,
      total_otros_cargos: 0,
      total: parseFloat(total.toFixed(2)),
      percepcion_tipo: 0,
      percepcion_base_imponible: 0,
      total_percepcion: 0,
      total_incluido_percepcion: 0,
      detraccion: false,
      observaciones: `Pedido #${venta_id} - ${tienda?.nombre || 'El Chalan'}`,
      documento_que_se_modifica_tipo: '',
      documento_que_se_modifica_serie: '',
      documento_que_se_modifica_numero: '',
      tipo_de_nota_de_credito: '',
      tipo_de_nota_de_debito: '',
      enviar_automaticamente_a_la_sunat: true,
      enviar_automaticamente_al_cliente: true,
      codigo_unico: `${serie}-${venta_id}`,
      condiciones_de_pago: '',
      medio_de_pago: '',
      placa_vehiculo: '',
      orden_compra_servicio: '',
      tabla_personalizada_codigo: '',
      formato_de_pdf: '',
      items: itemsNubefact
    };

    // Enviar a Nubefact
    console.log('Enviando a Nubefact URL:', NUBEFACT_URL);
    console.log('Documento a enviar:', JSON.stringify(documento, null, 2));

    const response = await fetch(NUBEFACT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NUBEFACT_TOKEN}`
      },
      body: JSON.stringify(documento)
    });

    const resultado = await response.json();
    console.log('Respuesta Nubefact status:', response.status);
    console.log('Respuesta Nubefact body:', JSON.stringify(resultado));

    if (!response.ok) {
      console.error('Error Nubefact:', resultado);
      return null;
    }

    return {
      tipo: tipo_comprobante === 2 ? 'Boleta' : 'Factura',
      serie: resultado.serie,
      numero: resultado.numero,
      enlace_pdf: resultado.enlace_del_pdf,
      enlace_xml: resultado.enlace_del_xml,
      enlace_cdr: resultado.enlace_del_cdr,
      codigo_hash: resultado.codigo_hash,
      cadena_para_codigo_qr: resultado.cadena_para_codigo_qr
    };

  } catch (error) {
    console.error('Error en facturacion:', error);
    return null;
  }
}
