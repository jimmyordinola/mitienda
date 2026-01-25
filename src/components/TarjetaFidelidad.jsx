'use client';

import { useState, useEffect } from 'react';

export default function TarjetaFidelidad({ cliente, tienda, onClose }) {
  const [fidelidad, setFidelidad] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [tabActiva, setTabActiva] = useState('vigentes');

  useEffect(() => {
    cargarFidelidad();
  }, [cliente?.id, tienda?.id]);

  const cargarFidelidad = async () => {
    if (!cliente?.id) return;

    setCargando(true);
    try {
      const params = new URLSearchParams({
        cliente_id: cliente.id,
        ...(tienda?.id && { tienda_id: tienda.id })
      });

      const res = await fetch(`/api/fidelidad?${params}`);
      const data = await res.json();
      setFidelidad(data);
    } catch (e) {
      console.error('Error cargando fidelidad:', e);
    }
    setCargando(false);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!cliente) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3d2314] to-[#5d3324] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <img src="/images/logo.png" alt="El Chalan" className="w-12 h-12 object-contain" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Tarjeta de Fidelidad</h2>
              <p className="text-white/80 text-sm">{cliente.nombre}</p>
            </div>
          </div>

          {cargando ? (
            <div className="animate-pulse">
              <div className="h-4 bg-white/20 rounded w-32 mb-2"></div>
              <div className="h-8 bg-white/20 rounded w-48"></div>
            </div>
          ) : (
            <>
              <div className="mb-2">
                <p className="text-sm text-white/80">Puntos en {tienda?.nombre || 'esta tienda'}</p>
                <p className="text-3xl font-bold">{fidelidad?.puntos_tienda_actual || 0} puntos</p>
              </div>

              {/* Barra de progreso */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progreso hacia tu cupon</span>
                  <span>{fidelidad?.puntos_tienda_actual || 0}/75</span>
                </div>
                <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-[#4a9b8c] h-full rounded-full transition-all duration-500"
                    style={{ width: `${fidelidad?.progreso_porcentaje || 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-white/60 mt-1">
                  {fidelidad?.puntos_para_cupon > 0
                    ? `Te faltan ${fidelidad.puntos_para_cupon} puntos para tu cupon de S/15`
                    : '¡Ya puedes reclamar tu cupon!'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setTabActiva('vigentes')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tabActiva === 'vigentes'
                ? 'text-[#4a9b8c] border-b-2 border-[#4a9b8c]'
                : 'text-gray-500'
            }`}
          >
            Vigentes ({fidelidad?.cupones?.vigentes?.length || 0})
          </button>
          <button
            onClick={() => setTabActiva('canjeados')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tabActiva === 'canjeados'
                ? 'text-[#4a9b8c] border-b-2 border-[#4a9b8c]'
                : 'text-gray-500'
            }`}
          >
            Canjeados
          </button>
          <button
            onClick={() => setTabActiva('vencidos')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tabActiva === 'vencidos'
                ? 'text-[#4a9b8c] border-b-2 border-[#4a9b8c]'
                : 'text-gray-500'
            }`}
          >
            Vencidos
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 max-h-[40vh] overflow-y-auto">
          {cargando ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-xl p-4">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Cupones Vigentes */}
              {tabActiva === 'vigentes' && (
                <div className="space-y-3">
                  {fidelidad?.cupones?.vigentes?.length > 0 ? (
                    fidelidad.cupones.vigentes.map(cupon => (
                      <div
                        key={cupon.id}
                        className="bg-gradient-to-r from-[#4a9b8c] to-[#3d8b7c] rounded-xl p-4 text-white"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs opacity-80">Cupon de descuento</p>
                            <p className="text-2xl font-bold">S/ {cupon.valor}</p>
                          </div>
                          <div className="bg-white/20 px-2 py-1 rounded text-xs">
                            {cupon.codigo}
                          </div>
                        </div>
                        <p className="text-xs mt-2 opacity-80">
                          Vence: {formatearFecha(cupon.fecha_fin)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">🎫</div>
                      <p>No tienes cupones vigentes</p>
                      <p className="text-sm">Acumula 75 puntos para obtener uno</p>
                    </div>
                  )}
                </div>
              )}

              {/* Cupones Canjeados */}
              {tabActiva === 'canjeados' && (
                <div className="space-y-3">
                  {fidelidad?.cupones?.canjeados?.length > 0 ? (
                    fidelidad.cupones.canjeados.map(cupon => (
                      <div
                        key={cupon.id}
                        className="bg-gray-100 rounded-xl p-4 opacity-70"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs text-gray-500">Cupon canjeado</p>
                            <p className="text-xl font-bold text-gray-600">S/ {cupon.valor}</p>
                          </div>
                          <div className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
                            Usado
                          </div>
                        </div>
                        <p className="text-xs mt-2 text-gray-500">
                          Canjeado: {formatearFecha(cupon.fecha_canje)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">✅</div>
                      <p>No has canjeado cupones aun</p>
                    </div>
                  )}
                </div>
              )}

              {/* Cupones Vencidos */}
              {tabActiva === 'vencidos' && (
                <div className="space-y-3">
                  {fidelidad?.cupones?.vencidos?.length > 0 ? (
                    fidelidad.cupones.vencidos.map(cupon => (
                      <div
                        key={cupon.id}
                        className="bg-gray-100 rounded-xl p-4 opacity-50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs text-gray-500">Cupon vencido</p>
                            <p className="text-xl font-bold text-gray-400 line-through">S/ {cupon.valor}</p>
                          </div>
                          <div className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs">
                            Vencido
                          </div>
                        </div>
                        <p className="text-xs mt-2 text-gray-500">
                          Vencio: {formatearFecha(cupon.fecha_fin)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📅</div>
                      <p>No tienes cupones vencidos</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Info */}
        <div className="p-4 bg-[#f5f0e8] border-t">
          <p className="text-xs text-center text-[#3d2314]/70">
            Gana 1 punto por cada S/1 de compra. Al llegar a 75 puntos recibiras automaticamente un cupon de S/15.
          </p>
        </div>
      </div>
    </div>
  );
}
