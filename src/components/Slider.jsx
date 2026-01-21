'use client';

import { useState, useEffect } from 'react';

export default function Slider({ imagenes, autoPlay = true, intervalo = 4000 }) {
  const [indiceActual, setIndiceActual] = useState(0);

  // Imágenes por defecto si no se proporcionan
  const slides = imagenes || [
    {
      imagen: '/images/slider/slide1.jpg',
      titulo: '50 Años de Tradición',
      subtitulo: 'Helados artesanales desde 1975'
    },
    {
      imagen: '/images/slider/slide2.jpg',
      titulo: 'Los Mejores Sabores',
      subtitulo: 'Más de 40 sabores para elegir'
    },
    {
      imagen: '/images/slider/slide3.jpg',
      titulo: 'Cremoladas Únicas',
      subtitulo: 'Refréscate con nuestras cremoladas'
    }
  ];

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setIndiceActual((prev) => (prev + 1) % slides.length);
    }, intervalo);

    return () => clearInterval(timer);
  }, [autoPlay, intervalo, slides.length]);

  const irAnterior = () => {
    setIndiceActual((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const irSiguiente = () => {
    setIndiceActual((prev) => (prev + 1) % slides.length);
  };

  const irA = (indice) => {
    setIndiceActual(indice);
  };

  return (
    <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden rounded-2xl shadow-2xl">
      {/* Slides */}
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${indiceActual * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className="min-w-full h-full relative"
          >
            {/* Imagen de fondo */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${slide.imagen})`,
                backgroundColor: '#3d2314'
              }}
            >
              {/* Overlay gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* Contenido del slide */}
            {(slide.titulo || slide.subtitulo) && (
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                {slide.titulo && (
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {slide.titulo}
                  </h2>
                )}
                {slide.subtitulo && (
                  <p className="text-lg md:text-xl text-white/90">
                    {slide.subtitulo}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Botón Anterior */}
      <button
        onClick={irAnterior}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white text-2xl transition-all backdrop-blur-sm"
        aria-label="Anterior"
      >
        ‹
      </button>

      {/* Botón Siguiente */}
      <button
        onClick={irSiguiente}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white text-2xl transition-all backdrop-blur-sm"
        aria-label="Siguiente"
      >
        ›
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => irA(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === indiceActual
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
