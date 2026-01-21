'use client';

import { useState, useEffect } from 'react';
import Slider from './Slider';
import Footer from './Footer';

export default function SeleccionTienda({ onSeleccionar }) {
  const [tiendas, setTiendas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Slides para el carrusel
  const slides = [
    {
      imagen: 'https://jfxmovtppqilxrsmmnw.supabase.co/storage/v1/object/public/imagenes/slider/slide1.jpg',
      titulo: '50 Años de Tradición',
      subtitulo: 'Helados artesanales desde 1975'
    },
    {
      imagen: 'https://jfxmovtppqilxrsmmnw.supabase.co/storage/v1/object/public/imagenes/slider/slide2.jpg',
      titulo: 'Los Mejores Sabores',
      subtitulo: 'Más de 40 sabores para elegir'
    },
    {
      imagen: 'https://jfxmovtppqilxrsmmnw.supabase.co/storage/v1/object/public/imagenes/slider/slide3.jpg',
      titulo: 'Cremoladas Únicas',
      subtitulo: 'Refréscate con nuestras cremoladas'
    }
  ];

  useEffect(() => {
    cargarTiendas();
  }, []);

  const cargarTiendas = async () => {
    try {
      const res = await fetch('/api/admin/tiendas');
      const data = await res.json();
      setTiendas(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error cargando tiendas');
      setTiendas([]);
    }
    setCargando(false);
  };

  return (
    <div className="min-h-screen bg-[#4a9b8c]">
      {/* Header */}
      <header className="bg-[#4a9b8c] py-4">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-center gap-8 text-white text-sm font-medium">
            <a href="#" className="hover:underline">INICIO</a>
            <a href="#" className="bg-[#c53030] px-4 py-2 rounded font-bold">COMPRA AQUI!</a>
            <a href="#" className="hover:underline">EMPRENDE</a>
            <img src="/images/logo.png" alt="El Chalan" className="h-20 mx-8" />
            <a href="#" className="hover:underline">LOCALES</a>
            <a href="#" className="hover:underline">EVENTOS</a>
            <a href="#" className="hover:underline">CONTACTENOS</a>
          </nav>
        </div>
      </header>

      {/* Slider */}
      <div className="container mx-auto px-4 py-6">
        <Slider imagenes={slides} autoPlay={true} intervalo={5000} />
      </div>

      {/* Titulo */}
      <div className="text-center py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          DONDE QUIERES
        </h1>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
          HACER TU PEDIDO?
        </h1>
        <p className="text-white/80">Haz tu pedido y retira directo, sin colas!</p>
        <button className="mt-4 bg-[#c53030] text-white px-6 py-2 rounded font-bold hover:bg-[#9b2c2c] transition-colors">
          Elegir tienda
        </button>
      </div>

      {/* Grid de tiendas */}
      <div className="container mx-auto px-4 pb-12">
        {cargando ? (
          <div className="text-center py-12">
            <div className="text-6xl animate-bounce">🍦</div>
            <p className="text-white mt-4 font-medium">Cargando tiendas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tiendas.map((tienda) => (
              <div
                key={tienda.id}
                className={`bg-white rounded-lg overflow-hidden shadow-lg ${
                  tienda.disponible ? 'hover:shadow-2xl transition-shadow' : 'opacity-70'
                }`}
              >
                {/* Imagen */}
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  {tienda.imagen ? (
                    <img
                      src={tienda.imagen}
                      alt={tienda.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                      <img src="/images/logo.png" alt="El Chalan" className="h-20 opacity-50" />
                    </div>
                  )}
                  {!tienda.disponible && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">Proximamente</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-[#3d2314] text-lg">{tienda.nombre}</h3>
                  <p className="text-[#c53030] text-sm mb-2">{tienda.direccion}</p>
                  {tienda.horario && (
                    <p className="text-gray-500 text-xs mb-2">{tienda.horario}</p>
                  )}
                  {tienda.telefono && (
                    <p className="text-gray-500 text-xs mb-4">{tienda.telefono}</p>
                  )}

                  {tienda.disponible ? (
                    <button
                      onClick={() => onSeleccionar(tienda)}
                      className="bg-[#c53030] text-white px-6 py-2 rounded font-bold hover:bg-[#9b2c2c] transition-colors w-full"
                    >
                      Seleccionar
                    </button>
                  ) : (
                    <button
                      disabled
                      className="bg-gray-400 text-white px-6 py-2 rounded font-bold w-full cursor-not-allowed"
                    >
                      Proximamente
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
