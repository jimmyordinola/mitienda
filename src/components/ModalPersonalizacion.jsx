'use client';

import { useState, useEffect } from 'react';

export default function ModalPersonalizacion({
  producto,
  tiendaId,
  onAgregar,
  onCerrar
}) {
  const [sabores, setSabores] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [saboresSeleccionados, setSaboresSeleccionados] = useState([]);
  const [toppingsSeleccionados, setToppingsSeleccionados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [paso, setPaso] = useState(1);

  const maxSabores = producto.max_sabores || 4;
  const maxToppings = producto.max_toppings || 10;
  const permiteToppings = producto.permite_toppings;

  useEffect(() => {
    cargarOpciones();
  }, []);

  const cargarOpciones = async () => {
    setCargando(true);
    try {
      // Cargar sabores
      const resSabores = await fetch(
        `/api/sabores?tienda_id=${tiendaId}${producto.categoria_id ? `&categoria_id=${producto.categoria_id}` : ''}`
      );
      const dataSabores = await resSabores.json();
      setSabores(Array.isArray(dataSabores) ? dataSabores : []);

      // Cargar toppings si el producto los permite
      if (permiteToppings) {
        const resToppings = await fetch(
          `/api/toppings?tienda_id=${tiendaId}${producto.categoria_id ? `&categoria_id=${producto.categoria_id}` : ''}`
        );
        const dataToppings = await resToppings.json();
        setToppings(Array.isArray(dataToppings) ? dataToppings : []);
      }
    } catch (error) {
      console.error('Error cargando opciones:', error);
    }
    setCargando(false);
  };

  const toggleSabor = (sabor) => {
    const yaSeleccionado = saboresSeleccionados.find(s => s.id === sabor.id);
    if (yaSeleccionado) {
      setSaboresSeleccionados(saboresSeleccionados.filter(s => s.id !== sabor.id));
    } else if (saboresSeleccionados.length < maxSabores) {
      setSaboresSeleccionados([...saboresSeleccionados, sabor]);
    }
  };

  const toggleTopping = (topping) => {
    const yaSeleccionado = toppingsSeleccionados.find(t => t.id === topping.id);
    if (yaSeleccionado) {
      setToppingsSeleccionados(toppingsSeleccionados.filter(t => t.id !== topping.id));
    } else if (toppingsSeleccionados.length < maxToppings) {
      setToppingsSeleccionados([...toppingsSeleccionados, topping]);
    }
  };

  const calcularTotal = () => {
    const precioBase = producto.precio || 0;
    const precioToppings = toppingsSeleccionados.reduce((sum, t) => sum + (t.precio || 0), 0);
    return precioBase + precioToppings;
  };

  const handleAgregar = () => {
    const productoPersonalizado = {
      ...producto,
      personalizacion: {
        sabores: saboresSeleccionados,
        toppings: toppingsSeleccionados
      },
      precioFinal: calcularTotal(),
      descripcionPersonalizada: generarDescripcion()
    };
    onAgregar(productoPersonalizado);
  };

  const generarDescripcion = () => {
    const partes = [];
    if (saboresSeleccionados.length > 0) {
      partes.push(`Sabores: ${saboresSeleccionados.map(s => s.nombre).join(', ')}`);
    }
    if (toppingsSeleccionados.length > 0) {
      partes.push(`Toppings: ${toppingsSeleccionados.map(t => t.nombre).join(', ')}`);
    }
    return partes.join(' | ');
  };

  const totalPasos = permiteToppings ? 3 : 2;

  if (cargando) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <div className="text-4xl animate-bounce mb-4 text-center">🍦</div>
          <p>Cargando opciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#4a9b8c] text-white p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{producto.nombre}</h2>
            <p className="text-sm opacity-80">Personaliza tu pedido</p>
          </div>
          <button
            onClick={onCerrar}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
          >
            ✕
          </button>
        </div>

        {/* Imagen del producto */}
        <div className="flex justify-center py-4 bg-gray-50">
          {producto.imagen_url || producto.imagen ? (
            <img
              src={producto.imagen_url || producto.imagen}
              alt={producto.nombre}
              className="h-40 w-40 object-cover rounded-xl shadow-lg"
            />
          ) : (
            <div className="h-40 w-40 bg-[#4a9b8c]/20 rounded-xl flex items-center justify-center text-6xl">
              {producto.imagen || '🍦'}
            </div>
          )}
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Paso 1: Sabores */}
          {paso === 1 && (
            <div>
              <h3 className="text-[#4a9b8c] font-bold text-lg mb-2">
                Paso 1: Agrega hasta {maxSabores} sabores distintos.
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Seleccionados: {saboresSeleccionados.length}/{maxSabores}
              </p>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {sabores.map((sabor) => {
                  const seleccionado = saboresSeleccionados.find(s => s.id === sabor.id);
                  const indice = saboresSeleccionados.findIndex(s => s.id === sabor.id);
                  const colores = ['#fecaca', '#fed7aa', '#fef08a', '#bbf7d0'];

                  return (
                    <div
                      key={sabor.id}
                      onClick={() => toggleSabor(sabor)}
                      className={`cursor-pointer rounded-xl p-2 transition-all ${
                        seleccionado
                          ? 'ring-4 shadow-lg'
                          : 'hover:shadow-md'
                      } ${saboresSeleccionados.length >= maxSabores && !seleccionado ? 'opacity-50' : ''}`}
                      style={{
                        backgroundColor: seleccionado ? colores[indice % colores.length] : '#f3f4f6',
                        ringColor: seleccionado ? colores[indice % colores.length] : undefined
                      }}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-white mb-1">
                        {sabor.imagen ? (
                          <img
                            src={sabor.imagen}
                            alt={sabor.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl bg-gray-100">
                            🍨
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-center font-medium truncate">{sabor.nombre}</p>
                    </div>
                  );
                })}
              </div>

              {sabores.length === 0 && (
                <p className="text-center text-gray-500 py-8">No hay sabores disponibles</p>
              )}
            </div>
          )}

          {/* Paso 2: Toppings (si aplica) */}
          {paso === 2 && permiteToppings && (
            <div>
              <h3 className="text-[#4a9b8c] font-bold text-lg mb-2">
                Paso 2: Personalízalo con tus toppings favoritos
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Opcional - Seleccionados: {toppingsSeleccionados.length}
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {toppings.map((topping) => {
                  const seleccionado = toppingsSeleccionados.find(t => t.id === topping.id);

                  return (
                    <div
                      key={topping.id}
                      onClick={() => toggleTopping(topping)}
                      className={`cursor-pointer rounded-xl p-3 transition-all ${
                        seleccionado
                          ? 'ring-2 ring-[#4a9b8c] bg-[#4a9b8c]/10'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-white mb-2">
                        {topping.imagen ? (
                          <img
                            src={topping.imagen}
                            alt={topping.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl bg-gray-100">
                            🍫
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-center font-medium">{topping.nombre}</p>
                      {topping.precio > 0 && (
                        <p className="text-xs text-center text-[#c53030]">+S/ {topping.precio.toFixed(2)}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {toppings.length === 0 && (
                <p className="text-center text-gray-500 py-8">No hay toppings disponibles</p>
              )}
            </div>
          )}

          {/* Paso final: Resumen */}
          {((paso === 2 && !permiteToppings) || (paso === 3 && permiteToppings)) && (
            <div>
              <h3 className="text-[#4a9b8c] font-bold text-lg mb-4">
                Paso {totalPasos}: Agrega el producto a tu carrito
              </h3>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {/* Imagen del producto */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-white shadow">
                    {producto.imagen_url || producto.imagen ? (
                      <img
                        src={producto.imagen_url || producto.imagen}
                        alt={producto.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl bg-gray-100">
                        {producto.imagen || '🍦'}
                      </div>
                    )}
                    <p className="text-xs text-center mt-1">Presentación</p>
                    <p className="text-xs text-center text-[#c53030]">+S/ {producto.precio?.toFixed(2)}</p>
                  </div>

                  {/* Sabores seleccionados */}
                  {saboresSeleccionados.map((sabor) => (
                    <div key={sabor.id} className="w-20">
                      <div className="h-20 rounded-lg overflow-hidden bg-white shadow">
                        {sabor.imagen ? (
                          <img
                            src={sabor.imagen}
                            alt={sabor.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl bg-gray-100">
                            🍨
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-center mt-1 truncate">{sabor.nombre}</p>
                    </div>
                  ))}

                  {/* Toppings seleccionados */}
                  {toppingsSeleccionados.map((topping) => (
                    <div key={topping.id} className="w-20">
                      <div className="h-20 rounded-lg overflow-hidden bg-white shadow">
                        {topping.imagen ? (
                          <img
                            src={topping.imagen}
                            alt={topping.nombre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl bg-gray-100">
                            🍫
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-center mt-1 truncate">{topping.nombre}</p>
                      {topping.precio > 0 && (
                        <p className="text-xs text-center text-[#c53030]">+S/ {topping.precio.toFixed(2)}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-[#c53030]">
                    Total: S/ {calcularTotal().toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer con navegación */}
        <div className="border-t p-4 flex items-center justify-between bg-white">
          <div>
            {paso > 1 && (
              <button
                onClick={() => setPaso(paso - 1)}
                className="px-6 py-2 text-[#4a9b8c] font-medium hover:bg-gray-100 rounded-lg"
              >
                ← Anterior
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPasos }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  paso === i + 1 ? 'bg-[#4a9b8c]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div>
            {((paso === 2 && !permiteToppings) || (paso === 3 && permiteToppings)) ? (
              <button
                onClick={handleAgregar}
                disabled={saboresSeleccionados.length === 0}
                className={`px-6 py-2 rounded-lg font-bold ${
                  saboresSeleccionados.length > 0
                    ? 'bg-[#c53030] text-white hover:bg-[#9b2c2c]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Agregar al Carrito
              </button>
            ) : (
              <button
                onClick={() => setPaso(paso + 1)}
                disabled={paso === 1 && saboresSeleccionados.length === 0}
                className={`px-6 py-2 rounded-lg font-bold ${
                  (paso === 1 && saboresSeleccionados.length > 0) || paso > 1
                    ? 'bg-[#4a9b8c] text-white hover:bg-[#3d8577]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Siguiente →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
