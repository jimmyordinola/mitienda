'use client';

import { useState, useEffect } from 'react';

const COLORES = [
  'from-pink-200 to-pink-300',
  'from-teal-300 to-teal-400',
  'from-amber-100 to-amber-200',
  'from-gray-100 to-gray-200',
  'from-red-200 to-red-300',
  'from-orange-200 to-yellow-200',
  'from-purple-200 to-purple-300',
  'from-blue-200 to-blue-300'
];

export default function Categorias({ tiendaId, onSeleccionar }) {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarCategorias();
  }, [tiendaId]);

  const cargarCategorias = async () => {
    try {
      const params = new URLSearchParams();
      if (tiendaId) params.append('tienda_id', tiendaId);

      const res = await fetch(`/api/categorias?${params}`);
      const data = await res.json();
      setCategorias(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error cargando categorías');
      setCategorias([]);
    }
    setCargando(false);
  };

  if (cargando) {
    return (
      <section className="mb-10">
        <h2 className="text-center text-[#c53030] text-xl font-bold mb-6">CATEGORÍAS</h2>
        <div className="text-center py-8 text-gray-400">Cargando categorías...</div>
      </section>
    );
  }

  if (categorias.length === 0) {
    return (
      <section className="mb-10">
        <h2 className="text-center text-[#c53030] text-xl font-bold mb-6">CATEGORÍAS</h2>
        <p className="text-center text-gray-500">No hay categorías disponibles</p>
      </section>
    );
  }

  return (
    <section className="mb-10">
      <h2 className="text-center text-[#c53030] text-xl font-bold mb-6">CATEGORÍAS</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categorias.map((categoria, index) => (
          <div
            key={categoria.id}
            className="relative rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:scale-105 h-48"
            onClick={() => onSeleccionar(categoria)}
          >
            {categoria.imagen ? (
              <img
                src={categoria.imagen}
                alt={categoria.nombre}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${COLORES[index % COLORES.length]} flex-col items-center justify-center ${categoria.imagen ? 'hidden' : 'flex'}`}
            >
              <span className="text-6xl mb-2">{categoria.emoji || '🍦'}</span>
            </div>
            <div className="absolute bottom-3 left-3">
              <span className="bg-[#c53030] text-white text-xs font-bold px-3 py-1 rounded shadow-lg">
                {categoria.nombre}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
