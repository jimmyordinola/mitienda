'use client';

import { useState, useEffect } from 'react';

export default function Promociones({ tiendaId, onSeleccionarCategoria }) {
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

  return (
    <section className="mb-10">
      <h2 className="text-center text-[#c53030] text-xl font-bold mb-6">PROMOCIONES</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promociones.map((promo) => (
          <div
            key={promo.id}
            className="relative rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-shadow h-64 bg-gradient-to-br from-gray-100 to-gray-200"
            onClick={() => {
              if (promo.categorias && onSeleccionarCategoria) {
                onSeleccionarCategoria(promo.categorias);
              }
            }}
          >
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
                {promo.tipo === '2x1' ? '🎉' : promo.tipo === 'descuento' ? '💰' : '🎁'}
              </span>
              <h3 className="text-2xl font-bold text-center">{promo.titulo}</h3>
              <p className="text-lg text-center">{promo.descripcion}</p>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <span className="bg-[#c53030] text-white text-xs font-bold px-4 py-2 rounded shadow-lg">
                {promo.categorias?.nombre || promo.tipo?.toUpperCase() || 'PROMOCIÓN'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
