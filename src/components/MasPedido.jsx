'use client';

import { useState, useEffect } from 'react';

export default function MasPedido({ tiendaId, onSeleccionar }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarMasPedidos();
  }, [tiendaId]);

  const cargarMasPedidos = async () => {
    try {
      const params = new URLSearchParams();
      if (tiendaId) params.append('tienda_id', tiendaId);

      const res = await fetch(`/api/mas-pedidos?${params}`);
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error cargando más pedidos');
      setProductos([]);
    }
    setCargando(false);
  };

  if (cargando) {
    return (
      <section className="mb-10">
        <h2 className="text-center text-[#c53030] text-xl font-bold">LO MÁS PEDIDO</h2>
        <p className="text-center text-[#4a9b8c] mb-6">Favoritos de los piuranos</p>
        <div className="text-center py-8 text-gray-400">Cargando...</div>
      </section>
    );
  }

  if (productos.length === 0) {
    return null; // No mostrar sección si no hay productos destacados
  }

  return (
    <section className="mb-10">
      <h2 className="text-center text-[#c53030] text-xl font-bold">LO MÁS PEDIDO</h2>
      <p className="text-center text-[#4a9b8c] mb-6">Favoritos de los piuranos</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {productos.map((producto) => (
          <div
            key={producto.id}
            className="relative rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:scale-105 h-48"
            onClick={() => onSeleccionar && onSeleccionar(producto)}
          >
            {producto.imagen_url ? (
              <img
                src={producto.imagen_url}
                alt={producto.nombre}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-full h-full bg-gradient-to-br from-pink-100 to-pink-200 flex-col items-center justify-center ${producto.imagen_url ? 'hidden' : 'flex'}`}>
              <span className="text-5xl mb-2">{producto.imagen || producto.categorias?.emoji || '🍦'}</span>
            </div>
            <div className="absolute bottom-3 left-3 right-3">
              <span className="bg-[#c53030] text-white text-xs font-bold px-3 py-1 rounded shadow-lg line-clamp-1">
                {producto.nombre}
              </span>
            </div>
            {producto.precio && (
              <div className="absolute top-3 right-3">
                <span className="bg-white/90 text-[#3d2314] text-sm font-bold px-2 py-1 rounded shadow">
                  S/{producto.precio}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
