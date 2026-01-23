'use client';

import { useState, useEffect } from 'react';

const CULQI_PUBLIC_KEY = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY || 'pk_test_xxxxxxxx';

export default function Checkout({ items, cliente, tienda, onCompletado, onCancelar }) {
  const [usarPuntos, setUsarPuntos] = useState(0);
  const [procesando, setProcesando] = useState(false);
  const [metodoPago, setMetodoPago] = useState(null); // 'tarjeta', 'yape', 'tienda'
  const [email, setEmail] = useState(cliente?.email || '');

  const subtotal = items.reduce((sum, item) => sum + ((item.precioFinal || item.precio) * item.cantidad), 0);
  const descuentoPuntos = usarPuntos;
  const total = Math.max(0, subtotal - descuentoPuntos);
  const puntosGanar = Math.floor(total / 10);
  const maxPuntosUsar = cliente ? Math.min(cliente.puntos, subtotal) : 0;

  // Configurar Culqi cuando cambia el total
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Culqi) {
      window.Culqi.publicKey = CULQI_PUBLIC_KEY;

      window.Culqi.settings({
        title: 'El Chalán Heladería',
        currency: 'PEN',
        amount: Math.round(total * 100),
        order: `order-${Date.now()}`
      });

      window.Culqi.options({
        lang: 'es',
        installments: false,
        paymentMethods: {
          tarjeta: true,
          yape: true,
          bancaMovil: false,
          agente: false,
          billetera: false,
          cuotealo: false
        },
        style: {
          logo: '/images/logo.png',
          bannerColor: '#3d2314',
          buttonBackground: '#c53030',
          buttonText: 'Pagar',
          buttonTextColor: '#ffffff',
          priceColor: '#3d2314'
        }
      });

      // Handler para cuando Culqi genera el token
      window.culpiCallback = async (token) => {
        await procesarPagoCulqi(token);
      };
    }
  }, [total]);

  // Listener para el token de Culqi
  useEffect(() => {
    const handleCulqiToken = async () => {
      if (window.Culqi?.token) {
        await procesarPagoCulqi(window.Culqi.token.id);
      } else if (window.Culqi?.error) {
        alert(window.Culqi.error.user_message || 'Error en el pago');
        setProcesando(false);
      }
    };

    window.culqi = handleCulqiToken;

    return () => {
      window.culqi = null;
    };
  }, [email, total, items, cliente, usarPuntos]);

  const procesarPagoCulqi = async (tokenId) => {
    try {
      // 1. Procesar pago con Culqi
      const pagoRes = await fetch('/api/pagos/culqi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tokenId,
          amount: total,
          email: email || 'cliente@elchalan.pe',
          description: `Pedido El Chalán - ${tienda?.nombre || 'Tienda'}`,
          metadata: {
            cliente_id: cliente?.id,
            tienda_id: tienda?.id
          }
        })
      });

      const pagoData = await pagoRes.json();

      if (!pagoRes.ok) {
        throw new Error(pagoData.error || 'Error al procesar el pago');
      }

      // 2. Registrar la venta
      const ventaRes = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: cliente?.id || null,
          items,
          total: subtotal,
          usar_puntos: usarPuntos,
          metodo_pago: metodoPago,
          culqi_charge_id: pagoData.charge_id
        })
      });

      if (ventaRes.ok) {
        const resultado = await ventaRes.json();
        onCompletado({
          ...resultado,
          pago_online: true,
          metodo: metodoPago === 'tarjeta' ? 'Tarjeta Visa' : 'Yape'
        });
      } else {
        const error = await ventaRes.json();
        alert(error.error || 'Error al registrar la venta');
      }
    } catch (error) {
      alert(error.message || 'Error al procesar el pago');
    } finally {
      setProcesando(false);
    }
  };

  const abrirCulqi = () => {
    if (!email && !cliente) {
      alert('Por favor ingresa tu email para continuar');
      return;
    }

    if (typeof window !== 'undefined' && window.Culqi) {
      setProcesando(true);
      window.Culqi.open();
    } else {
      alert('El sistema de pagos no está disponible. Intenta de nuevo.');
    }
  };

  const procesarPagoTienda = async () => {
    setProcesando(true);

    try {
      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: cliente?.id || null,
          items,
          total: subtotal,
          usar_puntos: usarPuntos,
          metodo_pago: 'tienda'
        })
      });

      if (res.ok) {
        const resultado = await res.json();
        onCompletado({
          ...resultado,
          pago_online: false,
          metodo: 'Pago en tienda'
        });
      } else {
        const error = await res.json();
        alert(error.error || 'Error al procesar el pedido');
      }
    } catch (e) {
      alert('Error de conexión');
    }

    setProcesando(false);
  };

  const handlePagar = () => {
    if (metodoPago === 'tienda') {
      procesarPagoTienda();
    } else if (metodoPago === 'tarjeta' || metodoPago === 'yape') {
      abrirCulqi();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-4">
          <img src="/images/logo.png" alt="El Chalán" className="h-16 mx-auto" />
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
          <div className="border-t border-[#3d2314]/20 mt-2 pt-2 flex justify-between font-bold text-[#3d2314]">
            <span>Subtotal:</span>
            <span>S/{subtotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Usar puntos */}
        {cliente && cliente.puntos > 0 && (
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

        {/* Total */}
        <div className="bg-[#3d2314] rounded-xl p-4 mb-4 text-white">
          <div className="flex justify-between text-2xl font-bold">
            <span>Total:</span>
            <span>S/{total.toFixed(2)}</span>
          </div>
          {cliente && (
            <p className="text-sm text-[#4a9b8c] mt-1">
              +{puntosGanar} puntos a ganar
            </p>
          )}
          {!cliente && (
            <p className="text-xs text-yellow-300 mt-2">
              Inicia sesión para acumular puntos
            </p>
          )}
        </div>

        {/* Método de pago */}
        <div className="mb-4">
          <h3 className="font-semibold text-[#3d2314] mb-3">Método de pago</h3>
          <div className="grid grid-cols-3 gap-2">
            {/* Tarjeta Visa */}
            <button
              onClick={() => setMetodoPago('tarjeta')}
              className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                metodoPago === 'tarjeta'
                  ? 'border-[#1a1f71] bg-[#1a1f71]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <svg className="w-8 h-8" viewBox="0 0 50 50" fill="none">
                <rect width="50" height="50" rx="8" fill="#1a1f71"/>
                <path d="M19.5 31L21.5 19H25L23 31H19.5Z" fill="#ffffff"/>
                <path d="M32.5 19.2C31.7 18.9 30.5 18.5 29 18.5C25.5 18.5 23 20.3 23 22.8C23 24.7 24.7 25.7 26 26.3C27.3 27 27.8 27.4 27.8 28C27.8 28.9 26.7 29.3 25.7 29.3C24.3 29.3 23.5 29.1 22.3 28.5L21.8 28.3L21.3 31.3C22.3 31.7 23.9 32.1 25.6 32.1C29.3 32.1 31.7 30.3 31.7 27.6C31.7 26.1 30.8 25 28.9 24.1C27.7 23.5 27 23.1 27 22.5C27 21.9 27.7 21.4 29.1 21.4C30.3 21.4 31.1 21.6 31.8 21.9L32.1 22L32.5 19.2Z" fill="#ffffff"/>
                <path d="M37.3 19H34.5C33.6 19 33 19.2 32.6 20.1L27.5 31H31.2L31.9 29H36.4L36.8 31H40L37.3 19ZM32.9 26.3C33.2 25.5 34.5 22.2 34.5 22.2C34.5 22.2 34.8 21.4 35 20.9L35.2 22.1C35.2 22.1 36 25.5 36.2 26.3H32.9Z" fill="#ffffff"/>
                <path d="M17.1 19L13.5 27.4L13.1 25.5C12.4 23.4 10.4 21.1 8.2 20L11.4 31H15.1L21 19H17.1Z" fill="#ffffff"/>
                <path d="M11.5 19H6.1L6 19.3C10.4 20.4 13.3 23.1 14.2 26.4L13.2 20.2C13 19.3 12.4 19 11.5 19Z" fill="#f7b600"/>
              </svg>
              <span className="text-xs font-medium text-[#3d2314]">Tarjeta</span>
            </button>

            {/* Yape */}
            <button
              onClick={() => setMetodoPago('yape')}
              className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                metodoPago === 'yape'
                  ? 'border-[#6f2c91] bg-[#6f2c91]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <svg className="w-8 h-8" viewBox="0 0 50 50" fill="none">
                <rect width="50" height="50" rx="8" fill="#6f2c91"/>
                <circle cx="25" cy="25" r="12" fill="#ffffff"/>
                <path d="M20 25L23 28L30 21" stroke="#6f2c91" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xs font-medium text-[#3d2314]">Yape</span>
            </button>

            {/* Pago en tienda */}
            <button
              onClick={() => setMetodoPago('tienda')}
              className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                metodoPago === 'tienda'
                  ? 'border-[#4a9b8c] bg-[#4a9b8c]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <svg className="w-8 h-8" viewBox="0 0 50 50" fill="none">
                <rect width="50" height="50" rx="8" fill="#4a9b8c"/>
                <path d="M15 35V23H35V35H15Z" fill="#ffffff"/>
                <path d="M13 23L25 13L37 23H13Z" fill="#ffffff"/>
                <rect x="22" y="27" width="6" height="8" fill="#4a9b8c"/>
              </svg>
              <span className="text-xs font-medium text-[#3d2314]">En tienda</span>
            </button>
          </div>
        </div>

        {/* Email para pago online */}
        {(metodoPago === 'tarjeta' || metodoPago === 'yape') && !cliente && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#3d2314] mb-1">
              Email para el comprobante
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4a9b8c]"
            />
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={onCancelar}
            disabled={procesando}
            className="flex-1 py-3 bg-gray-200 text-[#3d2314] rounded-xl font-bold hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handlePagar}
            disabled={procesando || !metodoPago}
            className="flex-1 py-3 bg-[#c53030] text-white rounded-xl font-bold hover:bg-[#9b2c2c] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {procesando ? 'Procesando...' : metodoPago ? 'Pagar' : 'Selecciona método'}
          </button>
        </div>

        {/* Info de seguridad */}
        {(metodoPago === 'tarjeta' || metodoPago === 'yape') && (
          <p className="text-xs text-gray-500 text-center mt-3">
            Pago seguro procesado por Culqi
          </p>
        )}
      </div>
    </div>
  );
}
