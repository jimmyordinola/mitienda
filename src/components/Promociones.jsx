'use client';

import { useState, useEffect } from 'react';

export default function Promociones({ tiendaId, onSeleccionarCategoria, promoAplicada, onActivarPromo }) {
  const [promociones, setPromociones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPromociones();
  }, [tiendaId]);

  const cargarPromociones = async () => {
    try {
      const params = new URLSearchParams();
      if (tiendaId) params.append('tienda_id', tiendaId);

      const res = await fetch(`/api/promociones?${params}`);
      const data = await res.json();
      setPromociones(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error cargando promociones');
      setPromociones([]);
    }
    setCargando(false);
  };

  if (cargando) {
    return (
      <section className="mb-10">
        <h2 className="text-center text-[#c53030] text-xl font-bold mb-6">PROMOCIONES</h2>
        <div className="text-center py-8 text-gray-400">Cargando promociones...</div>
      </section>
    );
  }

  if (promociones.length === 0) {
    return null; // No mostrar sección si no hay promociones
  }

  const estaActiva = (promo) => promoAplicada?.id === promo.id;

  return (
    <section className="mb-10">
      <h2 className="text-center text-[#c53030] text-xl font-bold mb-6">PROMOCIONES</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promociones.map((promo) => (
          <div
            key={promo.id}
            className={`relative rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-shadow h-64 bg-gradient-to-br from-gray-100 to-gray-200 ${estaActiva(promo) ? 'ring-4 ring-green-500' : ''}`}
            onClick={() => {
              if (promo.categorias && onSeleccionarCategoria) {
                onSeleccionarCategoria(promo.categorias);
              }
            }}
          >
            {/* Badge de activa */}
            {estaActiva(promo) && (
              <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10 animate-pulse">
                ✓ ACTIVA
              </div>
            )}

            {promo.imagen ? (
              <img
                src={promo.imagen}
                alt={promo.titulo}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-full h-full flex-col items-center justify-center text-[#3d2314] p-6 ${promo.imagen ? 'hidden' : 'flex'}`}>
              <span className="text-6xl mb-2">
                {promo.tipo === '2x1' ? '🎉' : promo.tipo === 'descuento' ? '💰' : promo.tipo === 'puntos_extra' ? '⭐' : '🎁'}
              </span>
              <h3 className="text-2xl font-bold text-center">{promo.titulo}</h3>
              <p className="text-lg text-center">{promo.descripcion}</p>
              {promo.tipo === 'descuento' && promo.valor && (
                <p className="text-3xl font-bold text-[#c53030] mt-2">-{promo.valor}%</p>
              )}
            </div>

            {/* Botón Activar para descuentos */}
            {promo.tipo === 'descuento' && onActivarPromo && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onActivarPromo(promo);
                }}
                className={`absolute bottom-4 right-4 px-4 py-2 rounded-lg font-bold text-sm shadow-lg transition-all z-10 ${
                  estaActiva(promo)
                    ? 'bg-gray-500 text-white hover:bg-gray-600'
                    : 'bg-green-500 text-white hover:bg-green-600 hover:scale-105'
                }`}
              >
                {estaActiva(promo) ? 'Desactivar' : 'Activar'}
              </button>
            )}

            {/* Info de 2x1 */}
            {promo.tipo === '2x1' && (
              <div className="absolute bottom-4 right-4 bg-[#c53030] text-white text-xs font-bold px-3 py-2 rounded-lg z-10">
                Automático
              </div>
            )}

            <div className="absolute bottom-4 left-4">
              <span className="bg-[#3d2314] text-white text-xs font-bold px-4 py-2 rounded shadow-lg">
                {promo.categorias?.nombre || promo.tipo?.toUpperCase() || 'PROMOCIÓN'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
