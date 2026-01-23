'use client';

import { useState } from 'react';

export default function Checkout({ items, cliente, onCompletado, onCancelar }) {
  const [usarPuntos, setUsarPuntos] = useState(0);
  const [procesando, setProcesando] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + ((item.precioFinal || item.precio) * item.cantidad), 0);
  const descuentoPuntos = usarPuntos;
  const total = Math.max(0, subtotal - descuentoPuntos);
  const puntosGanar = Math.floor(total / 10);
  const maxPuntosUsar = cliente ? Math.min(cliente.puntos, subtotal) : 0;

  const procesarPago = async () => {
    setProcesando(true);

    try {
      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: cliente?.id || null,
          items,
          total: subtotal,
          usar_puntos: usarPuntos
        })
      });

      if (res.ok) {
        const resultado = await res.json();
        onCompletado(resultado);
      } else {
        const error = await res.json();
        alert(error.error || 'Error al procesar el pago');
      }
    } catch (e) {
      alert('Error de conexión');
    }

    setProcesando(false);
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
            <div key={item.id} className="flex justify-between text-sm py-1 text-[#3d2314]">
              <span>{item.cantidad}x {item.nombre}</span>
              <span>S/{((item.precioFinal || item.precio) * item.cantidad).toFixed(2)}</span>
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
              🎁 Usar puntos ({cliente.puntos} disponibles)
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
              ⚠️ Inicia sesión para acumular puntos
            </p>
          )}
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
            onClick={procesarPago}
            disabled={procesando}
            className="flex-1 py-3 bg-[#c53030] text-white rounded-xl font-bold hover:bg-[#9b2c2c] hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {procesando ? 'Procesando...' : 'Pagar'}
          </button>
        </div>
      </div>
    </div>
  );
}
