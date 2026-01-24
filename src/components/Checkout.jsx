'use client';

import { useState, useEffect } from 'react';

export default function Checkout({ items, cliente, tienda, descuentoPromo = 0, onCompletado, onCancelar }) {
  const [usarPuntos, setUsarPuntos] = useState(0);
  const [procesando, setProcesando] = useState(false);
  const [metodoPago, setMetodoPago] = useState('tarjeta'); // tarjeta, yape
  const [culqiReady, setCulqiReady] = useState(false);

  // Verificar si Culqi esta configurado
  const culqiConfigurado = Boolean(process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY);

  // Cargar script de Culqi
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Culqi) {
      const script = document.createElement('script');
      script.src = 'https://checkout.culqi.com/js/v4';
      script.async = true;
      script.onload = () => {
        setCulqiReady(true);
      };
      document.body.appendChild(script);
    } else if (window.Culqi) {
      setCulqiReady(true);
    }
  }, []);

  // Si no hay cliente logueado, no mostrar checkout
  if (!cliente) {
    return null;
  }

  const subtotal = items.reduce((sum, item) => sum + ((item.precioFinal || item.precio) * item.cantidad), 0);
  const totalConPromo = subtotal - descuentoPromo;
  const descuentoPuntos = usarPuntos;
  const total = Math.max(0, totalConPromo - descuentoPuntos);
  const puntosGanar = Math.floor(total / 10);
  const maxPuntosUsar = Math.min(cliente.puntos, totalConPromo);

  // Configurar Culqi
  const configurarCulqi = () => {
    if (!window.Culqi) return;

    window.Culqi.publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY;
    window.Culqi.settings({
      title: 'El Chalan',
      currency: 'PEN',
      amount: Math.round(total * 100), // En centavos
      order: `orden-${Date.now()}`
    });

    window.Culqi.options({
      lang: 'es',
      installments: false,
      paymentMethods: {
        tarjeta: true,
        yape: metodoPago === 'yape',
        bancaMovil: false,
        agente: false,
        billetera: metodoPago === 'yape',
        cuotealo: false
      },
      style: {
        logo: '/images/logo.png',
        bannerColor: '#3d2314',
        buttonBackground: '#c53030',
        buttonText: 'Pagar S/' + total.toFixed(2),
        buttonTextColor: '#ffffff'
      }
    });
  };

  // Procesar pago con Culqi
  const procesarPagoCulqi = async (token) => {
    setProcesando(true);
    try {
      // 1. Crear cargo en Culqi
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

      // 2. Registrar venta
      const resVenta = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: cliente.id,
          tienda_id: tienda?.id,
          items,
          total: subtotal,
          descuento: descuentoPromo,
          usar_puntos: usarPuntos,
          metodo_pago: metodoPago === 'yape' ? 'yape' : 'tarjeta',
          referencia_pago: dataCulqi.charge_id
        })
      });

      if (resVenta.ok) {
        const resultado = await resVenta.json();
        onCompletado({
          ...resultado,
          metodo_pago: metodoPago === 'yape' ? 'Yape' : 'Tarjeta'
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

  // Abrir Culqi Checkout
  const abrirCulqi = () => {
    if (!culqiReady || !window.Culqi) {
      alert('El sistema de pago no esta listo. Intenta de nuevo.');
      return;
    }

    // Verificar que la llave de Culqi este configurada
    const culqiKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY;
    if (!culqiKey) {
      alert('El pago con tarjeta no esta disponible en este momento. Por favor selecciona pago en tienda.');
      setMetodoPago('tienda');
      return;
    }

    configurarCulqi();

    // Handler global para respuesta de Culqi
    window.culqi = function() {
      if (window.Culqi.token) {
        // Token creado exitosamente
        procesarPagoCulqi(window.Culqi.token.id);
      } else if (window.Culqi.error) {
        // Error en el proceso
        alert(window.Culqi.error.user_message || 'Error procesando el pago');
      }
    };

    // Abrir checkout de Culqi
    window.Culqi.open();
  };

  // Procesar pago en tienda
  const procesarPagoTienda = async () => {
    setProcesando(true);

    try {
      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: cliente.id,
          tienda_id: tienda?.id,
          items,
          total: subtotal,
          descuento: descuentoPromo,
          usar_puntos: usarPuntos,
          metodo_pago: 'efectivo'
        })
      });

      if (res.ok) {
        const resultado = await res.json();
        onCompletado({
          ...resultado,
          metodo_pago: 'Pago en tienda'
        });
      } else {
        const error = await res.json();
        alert(error.error || 'Error al procesar el pedido');
      }
    } catch (e) {
      alert('Error de conexion');
    }

    setProcesando(false);
  };

  // Handler del boton de pago
  const handlePagar = () => {
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
              {/* Mostrar sabores si existen */}
              {item.personalizacion?.sabores?.length > 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  <span className="font-medium">Sabores:</span> {item.personalizacion.sabores.map(s => s.nombre).join(', ')}
                </p>
              )}
              {/* Mostrar toppings si existen */}
              {item.personalizacion?.toppings?.length > 0 && (
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Toppings:</span> {item.personalizacion.toppings.map(t => t.nombre).join(', ')}
                </p>
              )}
            </div>
          ))}

          {/* Subtotal */}
          <div className="border-t border-[#3d2314]/20 mt-2 pt-2 flex justify-between text-sm text-[#3d2314]">
            <span>Subtotal:</span>
            <span>S/{subtotal.toFixed(2)}</span>
          </div>

          {/* Descuento promocion */}
          {descuentoPromo > 0 && (
            <div className="flex justify-between text-sm text-green-600 font-medium">
              <span>Descuento promocion:</span>
              <span>-S/{descuentoPromo.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Usar puntos */}
        {cliente.puntos > 0 && (
          <div className="bg-[#4a9b8c]/10 rounded-xl p-4 mb-4">
            <h3 className="font-semibold text-[#3d2314] mb-2">
              Usar puntos ({cliente.puntos} disponibles)
            </h3>
            <p className="text-xs text-[#4a9b8c] mb-2">1 punto = S/1 de descuento</p>
            <input
              type="range"
              min="0"
              max={maxPuntosUsar}
              value={usarPuntos}
              onChange={(e) => setUsarPuntos(parseInt(e.target.value))}
              className="w-full accent-[#4a9b8c]"
            />
            <div className="flex justify-between text-sm mt-1">
              <span className="text-[#3d2314]">Usar: {usarPuntos} puntos</span>
              <span className="text-[#4a9b8c] font-bold">-S/{usarPuntos.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Metodo de pago */}
        <div className="mb-4">
          <h3 className="font-semibold text-[#3d2314] mb-3">Metodo de pago</h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Tarjeta */}
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

            {/* Yape */}
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

          {/* Mensaje segun metodo */}
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
            disabled={procesando || !culqiReady || !culqiConfigurado}
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
        <div className="mt-4 flex items-center justify-center gap-4 opacity-60">
          <img src="https://culqi.com/wp-content/uploads/2021/03/visa.png" alt="Visa" className="h-6" />
          <img src="https://culqi.com/wp-content/uploads/2021/03/mastercard.png" alt="Mastercard" className="h-6" />
          <span className="text-xs text-gray-500">Pago seguro con Culqi</span>
        </div>
      </div>
    </div>
  );
}
