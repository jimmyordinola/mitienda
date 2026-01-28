'use client';

import { useState, useEffect } from 'react';

export default function Checkout({ items, cliente, tienda, descuentoPromo = 0, onCompletado, onCancelar }) {
  const [procesando, setProcesando] = useState(false);
  const [metodoPago, setMetodoPago] = useState('tarjeta');
  const [culqiReady, setCulqiReady] = useState(false);
  const [horarioRecojo, setHorarioRecojo] = useState('');
  const [fechaRecojo, setFechaRecojo] = useState(() => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  });
  const [cuponCodigo, setCuponCodigo] = useState('');
  const [cuponAplicado, setCuponAplicado] = useState(null);
  const [cuponesDisponibles, setCuponesDisponibles] = useState([]);
  const [mostrarCupones, setMostrarCupones] = useState(false);

  // Facturacion
  const [tipoComprobante, setTipoComprobante] = useState(2); // 2=Boleta, 1=Factura
  const [documentoCliente, setDocumentoCliente] = useState(cliente?.dni || '');
  const [razonSocial, setRazonSocial] = useState('');
  const [direccionFiscal, setDireccionFiscal] = useState('');
  const [emailComprobante, setEmailComprobante] = useState(cliente?.email || '');
  const [consultandoDoc, setConsultandoDoc] = useState(false);
  const [nombreConsultado, setNombreConsultado] = useState('');

  const culqiConfigurado = Boolean(process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY);

  // Obtener horarios de la tienda (configurables)
  const horaApertura = tienda?.hora_apertura ? parseInt(tienda.hora_apertura.split(':')[0]) : 10;
  const horaCierre = tienda?.hora_cierre ? parseInt(tienda.hora_cierre.split(':')[0]) : 22;
  const intervalo = tienda?.intervalo_minutos || 30;

  // Generar fechas disponibles (7 dias)
  const generarFechas = () => {
    const fechas = [];
    const hoy = new Date();

    for (let i = 0; i < 7; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);

      const value = fecha.toISOString().split('T')[0];
      const diaSemana = fecha.toLocaleDateString('es-PE', { weekday: 'short' });
      const dia = fecha.getDate();
      const mes = fecha.toLocaleDateString('es-PE', { month: 'short' });

      let label = i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : diaSemana;

      fechas.push({
        value,
        label,
        dia,
        mes,
        esHoy: i === 0
      });
    }
    return fechas;
  };

  const fechasDisponibles = generarFechas();
  const fechaSeleccionada = fechasDisponibles.find(f => f.value === fechaRecojo);
  const esHoy = fechaSeleccionada?.esHoy || false;

  // Generar horarios disponibles segun la tienda
  const generarHorarios = () => {
    const horarios = [];
    const ahora = new Date();
    const horaActual = ahora.getHours();
    const minActual = ahora.getMinutes();

    let horaInicio = esHoy ? horaActual : horaApertura;
    let minInicio = esHoy ? (minActual < 30 ? 30 : 0) : 0;
    if (esHoy && minActual >= 30) horaInicio++;

    // Si es hoy y ya paso la hora de cierre
    if (esHoy && horaActual >= horaCierre) {
      return [];
    }

    if (horaInicio < horaApertura) {
      horaInicio = horaApertura;
      minInicio = 0;
    }

    for (let h = horaInicio; h < horaCierre; h++) {
      for (let m = (h === horaInicio ? minInicio : 0); m < 60; m += intervalo) {
        if (h === horaCierre - 1 && m > 30) break;
        const hora = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        horarios.push(hora);
      }
    }
    return horarios;
  };

  const horariosDisponibles = generarHorarios();

  // Cargar Culqi
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Culqi) {
      const script = document.createElement('script');
      script.src = 'https://checkout.culqi.com/js/v4';
      script.async = true;
      script.onload = () => setCulqiReady(true);
      document.body.appendChild(script);
    } else if (window.Culqi) {
      setCulqiReady(true);
    }
  }, []);

  // Cargar cupones disponibles
  useEffect(() => {
    if (cliente?.id && tienda?.id) {
      cargarCupones();
    }
  }, [cliente?.id, tienda?.id]);

  // Consultar DNI/RUC automaticamente
  useEffect(() => {
    const consultarDocumento = async () => {
      const longitudRequerida = tipoComprobante === 2 ? 8 : 11;
      const tipo = tipoComprobante === 2 ? 'dni' : 'ruc';

      if (documentoCliente.length !== longitudRequerida) {
        setNombreConsultado('');
        return;
      }

      setConsultandoDoc(true);
      try {
        const res = await fetch(`/api/consulta-documento?tipo=${tipo}&numero=${documentoCliente}`);
        const data = await res.json();

        if (data.success) {
          if (tipo === 'dni') {
            setNombreConsultado(data.nombre);
          } else {
            setNombreConsultado(data.razonSocial);
            // Auto-rellenar campos de factura
            if (data.razonSocial && !razonSocial) {
              setRazonSocial(data.razonSocial);
            }
            if (data.direccion && !direccionFiscal) {
              setDireccionFiscal(data.direccion);
            }
          }
        } else {
          setNombreConsultado('');
        }
      } catch (e) {
        console.error('Error consultando documento:', e);
        setNombreConsultado('');
      }
      setConsultandoDoc(false);
    };

    const timeoutId = setTimeout(consultarDocumento, 300);
    return () => clearTimeout(timeoutId);
  }, [documentoCliente, tipoComprobante]);

  const cargarCupones = async () => {
    try {
      const res = await fetch(`/api/fidelidad?cliente_id=${cliente.id}&tienda_id=${tienda.id}`);
      const data = await res.json();
      setCuponesDisponibles(data.cupones?.vigentes || []);
    } catch (e) {
      console.error('Error cargando cupones:', e);
    }
  };

  if (!cliente) return null;

  const subtotal = items.reduce((sum, item) => sum + ((item.precioFinal || item.precio) * item.cantidad), 0);
  const descuentoCupon = cuponAplicado ? cuponAplicado.valor : 0;
  const total = Math.max(0, subtotal - descuentoPromo - descuentoCupon);
  const puntosGanar = Math.floor(total); // 1 punto por sol

  const aplicarCupon = (cupon) => {
    setCuponAplicado(cupon);
    setCuponCodigo(cupon.codigo);
    setMostrarCupones(false);
  };

  const quitarCupon = () => {
    setCuponAplicado(null);
    setCuponCodigo('');
  };

  // Configurar Culqi
  const configurarCulqi = () => {
    if (!window.Culqi) return;

    window.Culqi.publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY;
    window.Culqi.settings({
      title: 'El Chalan',
      currency: 'PEN',
      amount: Math.round(total * 100)
    });

    window.Culqi.options({
      lang: 'es',
      installments: false,
      paymentMethods: {
        tarjeta: true,
        yape: metodoPago === 'yape',
        bancaMovil: false,
        agente: false,
        billetera: false,
        cuotealo: false
      },
      style: {
        bannerColor: '#3d2314',
        buttonBackground: '#c53030',
        menuColor: '#3d2314'
      }
    });
  };

  // Procesar pago con Culqi
  const procesarPagoCulqi = async (token) => {
    setProcesando(true);
    try {
      const resCulqi = await fetch('/api/pagos/culqi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          amount: total,
          email: cliente.email || `${cliente.telefono}@elchalan.pe`,
          description: `Pedido El Chalan - ${tienda?.nombre || 'Tienda'}`,
          metadata: {
            cliente_id: cliente.id,
            nombre: cliente.nombre,
            telefono: cliente.telefono,
            tienda_id: tienda?.id
          }
        })
      });

      const dataCulqi = await resCulqi.json();

      if (!resCulqi.ok) {
        throw new Error(dataCulqi.error || 'Error procesando el pago');
      }

      // Registrar venta
      const resVenta = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: cliente.id,
          tienda_id: tienda?.id,
          items,
          total: subtotal,
          descuento: descuentoPromo,
          cupon_codigo: cuponAplicado?.codigo || null,
          metodo_pago: metodoPago === 'yape' ? 'yape' : 'tarjeta',
          referencia_pago: dataCulqi.charge_id,
          horario_recojo: `${fechaSeleccionada?.label} ${fechaSeleccionada?.dia} ${fechaSeleccionada?.mes} - ${horarioRecojo}`,
          // Datos de facturacion
          tipo_comprobante: tipoComprobante,
          documento_cliente: documentoCliente || null,
          razon_social: tipoComprobante === 1 ? razonSocial : null,
          direccion_fiscal: tipoComprobante === 1 ? direccionFiscal : null,
          email_comprobante: emailComprobante || null
        })
      });

      if (resVenta.ok) {
        const resultado = await resVenta.json();
        onCompletado({
          ...resultado,
          metodo_pago: metodoPago === 'yape' ? 'Yape' : 'Tarjeta',
          horario_recojo: `${fechaSeleccionada?.label} ${fechaSeleccionada?.dia} ${fechaSeleccionada?.mes} a las ${horarioRecojo}`
        });
      } else {
        const error = await resVenta.json();
        alert(error.error || 'Error al registrar el pedido');
      }
    } catch (e) {
      alert(e.message || 'Error procesando el pago');
    }
    setProcesando(false);
  };

  // Abrir Culqi
  const abrirCulqi = () => {
    if (!culqiReady || !window.Culqi) {
      alert('El sistema de pago no esta listo. Intenta de nuevo.');
      return;
    }

    const culqiKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY;
    if (!culqiKey) {
      alert('El pago con tarjeta no esta disponible en este momento.');
      return;
    }

    configurarCulqi();

    window.culqi = function() {
      if (window.Culqi.token) {
        // Cerrar el modal de Culqi
        window.Culqi.close();
        procesarPagoCulqi(window.Culqi.token.id);
      } else if (window.Culqi.error) {
        alert(window.Culqi.error.user_message || 'Error procesando el pago');
      }
    };

    window.Culqi.open();
  };

  const handlePagar = () => {
    if (!horarioRecojo) {
      alert('Selecciona un horario de recojo');
      return;
    }
    // Validar datos de factura
    if (tipoComprobante === 1) {
      if (!documentoCliente || documentoCliente.length !== 11) {
        alert('Ingresa un RUC valido (11 digitos)');
        return;
      }
      if (!razonSocial.trim()) {
        alert('Ingresa la razon social');
        return;
      }
      if (!direccionFiscal.trim()) {
        alert('Ingresa la direccion fiscal');
        return;
      }
    }
    abrirCulqi();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-4">
          <img src="/images/logo.png" alt="El Chalan" className="h-16 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-[#3d2314] mb-4 text-center">Confirmar Pedido</h2>

        {/* Resumen de productos */}
        <div className="bg-[#f5f0e8] rounded-xl p-4 mb-4">
          <h3 className="font-semibold text-[#3d2314] mb-2">Resumen</h3>
          {items.map((item) => (
            <div key={item.id} className="py-2 border-b border-[#3d2314]/10 last:border-0">
              <div className="flex justify-between text-sm text-[#3d2314]">
                <span className="font-medium">{item.cantidad}x {item.nombre}</span>
                <span className="font-bold">S/{((item.precioFinal || item.precio) * item.cantidad).toFixed(2)}</span>
              </div>
              {item.personalizacion?.sabores?.length > 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  <span className="font-medium">Sabores:</span> {item.personalizacion.sabores.map(s => s.nombre).join(', ')}
                </p>
              )}
              {item.personalizacion?.toppings?.length > 0 && (
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Toppings:</span> {item.personalizacion.toppings.map(t => t.nombre).join(', ')}
                </p>
              )}
            </div>
          ))}

          <div className="border-t border-[#3d2314]/20 mt-2 pt-2 flex justify-between text-sm text-[#3d2314]">
            <span>Subtotal:</span>
            <span>S/{subtotal.toFixed(2)}</span>
          </div>

          {descuentoPromo > 0 && (
            <div className="flex justify-between text-sm text-green-600 font-medium">
              <span>Descuento promocion:</span>
              <span>-S/{descuentoPromo.toFixed(2)}</span>
            </div>
          )}

          {cuponAplicado && (
            <div className="flex justify-between text-sm text-green-600 font-medium">
              <span>Cupon {cuponAplicado.codigo}:</span>
              <span>-S/{cuponAplicado.valor.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Cupones disponibles */}
        {cuponesDisponibles.length > 0 && !cuponAplicado && (
          <div className="mb-4">
            <button
              onClick={() => setMostrarCupones(!mostrarCupones)}
              className="w-full py-3 bg-[#4a9b8c]/10 text-[#4a9b8c] rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <span>🎫</span>
              Tienes {cuponesDisponibles.length} cupon{cuponesDisponibles.length > 1 ? 'es' : ''} disponible{cuponesDisponibles.length > 1 ? 's' : ''}
            </button>

            {mostrarCupones && (
              <div className="mt-2 space-y-2">
                {cuponesDisponibles.map(cupon => (
                  <button
                    key={cupon.id}
                    onClick={() => aplicarCupon(cupon)}
                    className="w-full p-3 bg-gradient-to-r from-[#4a9b8c] to-[#3d8b7c] rounded-xl text-white text-left"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold">S/ {cupon.valor} de descuento</p>
                        <p className="text-xs opacity-80">{cupon.codigo}</p>
                      </div>
                      <span className="text-2xl">+</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cupon aplicado */}
        {cuponAplicado && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex justify-between items-center">
            <div>
              <p className="text-green-700 font-medium">Cupon aplicado</p>
              <p className="text-sm text-green-600">{cuponAplicado.codigo} - S/{cuponAplicado.valor} de descuento</p>
            </div>
            <button
              onClick={quitarCupon}
              className="text-red-500 hover:text-red-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Tipo de comprobante */}
        <div className="mb-4">
          <h3 className="font-semibold text-[#3d2314] mb-3">Comprobante</h3>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => setTipoComprobante(2)}
              className={`p-3 rounded-xl border-2 transition-all ${
                tipoComprobante === 2
                  ? 'border-[#4a9b8c] bg-[#4a9b8c]/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="text-sm font-medium text-[#3d2314]">Boleta</p>
              <p className="text-xs text-gray-500">DNI</p>
            </button>
            <button
              onClick={() => setTipoComprobante(1)}
              className={`p-3 rounded-xl border-2 transition-all ${
                tipoComprobante === 1
                  ? 'border-[#4a9b8c] bg-[#4a9b8c]/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="text-sm font-medium text-[#3d2314]">Factura</p>
              <p className="text-xs text-gray-500">RUC</p>
            </button>
          </div>

          {tipoComprobante === 2 ? (
            <div className="space-y-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="DNI (opcional)"
                  value={documentoCliente}
                  onChange={(e) => setDocumentoCliente(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  className="w-full px-4 py-2 border-2 rounded-xl focus:border-[#4a9b8c] focus:outline-none text-sm"
                  maxLength={8}
                />
                {consultandoDoc && documentoCliente.length === 8 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-[#4a9b8c] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {nombreConsultado && documentoCliente.length === 8 && (
                <p className="text-xs text-[#4a9b8c] px-2 font-medium">{nombreConsultado}</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="RUC *"
                    value={documentoCliente}
                    onChange={(e) => setDocumentoCliente(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    className="w-full px-4 py-2 border-2 rounded-xl focus:border-[#4a9b8c] focus:outline-none text-sm"
                    maxLength={11}
                  />
                  {consultandoDoc && documentoCliente.length === 11 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-[#4a9b8c] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                {nombreConsultado && documentoCliente.length === 11 && (
                  <p className="text-xs text-[#4a9b8c] px-2 font-medium">{nombreConsultado}</p>
                )}
              </div>
              <input
                type="text"
                placeholder="Razon Social *"
                value={razonSocial}
                onChange={(e) => !nombreConsultado && setRazonSocial(e.target.value)}
                readOnly={!!nombreConsultado}
                className={`w-full px-4 py-2 border-2 rounded-xl focus:outline-none text-sm ${nombreConsultado ? 'bg-gray-50 text-gray-700 cursor-not-allowed' : 'focus:border-[#4a9b8c]'}`}
              />
              <input
                type="text"
                placeholder="Direccion Fiscal *"
                value={direccionFiscal}
                onChange={(e) => !nombreConsultado && setDireccionFiscal(e.target.value)}
                readOnly={!!nombreConsultado}
                className={`w-full px-4 py-2 border-2 rounded-xl focus:outline-none text-sm ${nombreConsultado ? 'bg-gray-50 text-gray-700 cursor-not-allowed' : 'focus:border-[#4a9b8c]'}`}
              />
            </div>
          )}

          <input
            type="email"
            placeholder="Email para recibir comprobante"
            value={emailComprobante}
            onChange={(e) => setEmailComprobante(e.target.value)}
            className="w-full mt-2 px-4 py-2 border-2 rounded-xl focus:border-[#4a9b8c] focus:outline-none text-sm"
          />
        </div>

        {/* Metodo de pago */}
        <div className="mb-4">
          <h3 className="font-semibold text-[#3d2314] mb-3">Metodo de pago</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => culqiConfigurado && setMetodoPago('tarjeta')}
              disabled={!culqiConfigurado}
              className={`p-3 rounded-xl border-2 transition-all ${
                metodoPago === 'tarjeta'
                  ? 'border-[#4a9b8c] bg-[#4a9b8c]/10'
                  : 'border-gray-200 hover:border-gray-300'
              } ${!culqiConfigurado ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <div className="text-2xl mb-1">💳</div>
              <p className="text-xs font-medium text-[#3d2314]">Tarjeta</p>
            </button>

            <button
              onClick={() => culqiConfigurado && setMetodoPago('yape')}
              disabled={!culqiConfigurado}
              className={`p-3 rounded-xl border-2 transition-all ${
                metodoPago === 'yape'
                  ? 'border-[#4a9b8c] bg-[#4a9b8c]/10'
                  : 'border-gray-200 hover:border-gray-300'
              } ${!culqiConfigurado ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <div className="flex justify-center mb-1">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <rect width="24" height="24" rx="6" fill="#6B2D8B"/>
                  <path d="M7 8L12 16L17 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-xs font-medium text-[#3d2314]">Yape</p>
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-2 text-center">
            {metodoPago === 'tarjeta' && 'Visa, Mastercard, American Express'}
            {metodoPago === 'yape' && 'Paga con tu billetera Yape'}
          </p>
          {!culqiConfigurado && (
            <p className="text-xs text-orange-500 mt-1 text-center">
              Pago online proximamente disponible
            </p>
          )}
        </div>

        {/* Fecha y Horario de recojo */}
        <div className="mb-4">
          <h3 className="font-semibold text-[#3d2314] mb-3">Fecha de recojo</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
            {fechasDisponibles.map((fecha) => (
              <button
                key={fecha.value}
                onClick={() => {
                  setFechaRecojo(fecha.value);
                  setHorarioRecojo('');
                }}
                className={`flex-shrink-0 w-16 p-2 rounded-xl border-2 transition-all ${
                  fechaRecojo === fecha.value
                    ? 'border-[#4a9b8c] bg-[#4a9b8c]/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="text-xs text-gray-500">{fecha.label}</p>
                <p className="text-xl font-bold text-[#3d2314]">{fecha.dia}</p>
                <p className="text-xs text-gray-500">{fecha.mes}</p>
              </button>
            ))}
          </div>

          <h3 className="font-semibold text-[#3d2314] mb-3">Horario de recojo</h3>
          <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
            {horariosDisponibles.map((hora) => (
              <button
                key={hora}
                onClick={() => setHorarioRecojo(hora)}
                className={`p-2 rounded-xl border-2 transition-all ${
                  horarioRecojo === hora
                    ? 'border-[#4a9b8c] bg-[#4a9b8c]/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="text-sm font-medium text-[#3d2314]">{hora}</p>
              </button>
            ))}
          </div>

          {horariosDisponibles.length === 0 && esHoy && (
            <p className="text-xs text-orange-500 mt-2 text-center">
              No hay mas horarios disponibles hoy. Selecciona otro dia.
            </p>
          )}

          {horarioRecojo && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Recoge el {fechaSeleccionada?.label === 'Hoy' ? 'hoy' : fechaSeleccionada?.label === 'Mañana' ? 'mañana' : fechaSeleccionada?.label + ' ' + fechaSeleccionada?.dia} a las {horarioRecojo}
            </p>
          )}
          <p className="text-xs text-gray-400 text-center mt-1">
            Horario tienda: {horaApertura}:00 - {horaCierre}:00
          </p>
        </div>

        {/* Total */}
        <div className="bg-[#3d2314] rounded-xl p-4 mb-4 text-white">
          <div className="flex justify-between text-2xl font-bold">
            <span>Total:</span>
            <span>S/{total.toFixed(2)}</span>
          </div>
          <p className="text-sm text-[#4a9b8c] mt-1">
            +{puntosGanar} puntos a ganar
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={onCancelar}
            disabled={procesando}
            className="flex-1 py-3 bg-gray-200 text-[#3d2314] rounded-xl font-bold hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handlePagar}
            disabled={procesando || !culqiReady || !culqiConfigurado || !horarioRecojo}
            className="flex-1 py-3 bg-[#c53030] text-white rounded-xl font-bold hover:bg-[#9b2c2c] hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {procesando ? (
              'Procesando...'
            ) : (
              <>
                {metodoPago === 'tarjeta' && (
                  <>
                    <span>💳</span> Pagar con Tarjeta
                  </>
                )}
                {metodoPago === 'yape' && (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <rect width="24" height="24" rx="6" fill="#6B2D8B"/>
                      <path d="M7 8L12 16L17 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Pagar con Yape
                  </>
                )}
              </>
            )}
          </button>
        </div>

        {/* Logos de seguridad */}
        <div className="mt-4 flex items-center justify-center gap-3 opacity-70">
          <svg viewBox="0 0 48 32" className="h-6" fill="none">
            <rect width="48" height="32" rx="4" fill="#1A1F71"/>
            <text x="24" y="20" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontStyle="italic">VISA</text>
          </svg>
          <svg viewBox="0 0 48 32" className="h-6" fill="none">
            <rect width="48" height="32" rx="4" fill="#f5f5f5"/>
            <circle cx="18" cy="16" r="10" fill="#EB001B"/>
            <circle cx="30" cy="16" r="10" fill="#F79E1B"/>
            <path d="M24 8.5a10 10 0 000 15" fill="#FF5F00"/>
          </svg>
          <span className="text-xs text-gray-500">Pago seguro</span>
        </div>
      </div>
    </div>
  );
}
