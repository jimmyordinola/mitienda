'use client';

import { useState, useEffect } from 'react';
import Promociones from './Promociones';
import MasPedido from './MasPedido';
import Categorias from './Categorias';
import ModalPersonalizacion from './ModalPersonalizacion';

export default function Catalogo({ onAgregarCarrito, tiendaId }) {
  const [productos, setProductos] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [categoriaInfo, setCategoriaInfo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [productoPersonalizar, setProductoPersonalizar] = useState(null);

  useEffect(() => {
    if (categoriaActiva) {
      cargarProductosPorCategoria();
    }
  }, [categoriaActiva, tiendaId]);

  const cargarProductosPorCategoria = async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams();
      if (tiendaId) params.append('tienda_id', tiendaId);
      if (categoriaActiva) params.append('categoria_id', categoriaActiva);

      const res = await fetch(`/api/productos?${params}`);
      const data = await res.json();
      setProductos(data);
    } catch (e) {
      console.error('Error cargando productos');
    }
    setCargando(false);
  };

  const handleSeleccionarCategoria = (categoria) => {
    setCategoriaActiva(categoria.id);
    setCategoriaInfo(categoria);
  };

  const volverACategorias = () => {
    setCategoriaActiva(null);
    setCategoriaInfo(null);
    setProductos([]);
  };

  const handleAgregar = (producto) => {
    // Si el producto es personalizable, abrir modal
    if (producto.personalizable) {
      setProductoPersonalizar(producto);
    } else {
      onAgregarCarrito(producto);
    }
  };

  const handleAgregarPersonalizado = (productoPersonalizado) => {
    onAgregarCarrito(productoPersonalizado);
    setProductoPersonalizar(null);
  };

  // Si hay categoría seleccionada, mostrar productos
  if (categoriaActiva) {
    return (
      <>
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          {/* Botón volver */}
          <button
            onClick={volverACategorias}
            className="flex items-center gap-2 text-[#4a9b8c] font-semibold mb-4 hover:text-[#3d8577]"
          >
            ← Volver a categorías
          </button>

          <h2 className="text-2xl font-bold text-[#3d2314] mb-6 flex items-center gap-3">
            <span className="text-3xl">{categoriaInfo?.emoji || '🍦'}</span>
            {categoriaInfo?.nombre || 'Productos'}
          </h2>

          {cargando ? (
            <div className="text-center py-8">
              <div className="text-6xl animate-bounce">🍦</div>
              <p className="text-[#3d2314] mt-4 font-medium">Cargando...</p>
            </div>
          ) : productos.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay productos en esta categoría</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {productos.map((producto) => (
                <div
                  key={producto.id}
                  className="border-2 border-gray-100 rounded-xl p-4 hover:border-[#4a9b8c] hover:shadow-lg transition-all bg-gradient-to-br from-white to-gray-50"
                >
                  <div className="flex items-start gap-4">
                    {producto.imagen_url ? (
                      <img
                        src={producto.imagen_url}
                        alt={producto.nombre}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`text-5xl ${producto.imagen_url ? 'hidden' : ''} w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center`}>
                      {producto.imagen || producto.categorias?.emoji || '🍦'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-[#3d2314] text-lg">{producto.nombre}</h4>
                      <p className="text-sm text-gray-500 mb-2">{producto.descripcion}</p>

                      {/* Indicador de producto personalizable */}
                      {producto.personalizable && (
                        <div className="flex items-center gap-1 text-xs text-[#4a9b8c] mb-2">
                          <span>✨</span>
                          <span>Personalizable - hasta {producto.max_sabores || 4} sabores</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-[#4a9b8c]">
                          S/{producto.precio}
                        </span>
                        <button
                          onClick={() => handleAgregar(producto)}
                          className="px-4 py-2 bg-[#c53030] text-white rounded-lg text-sm font-bold hover:bg-[#9b2c2c] hover:scale-105 transition-all"
                        >
                          {producto.personalizable ? '✨ Personalizar' : '+ Agregar'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de personalización */}
        {productoPersonalizar && (
          <ModalPersonalizacion
            producto={productoPersonalizar}
            tiendaId={tiendaId}
            onAgregar={handleAgregarPersonalizado}
            onCerrar={() => setProductoPersonalizar(null)}
          />
        )}
      </>
    );
  }

  // Vista principal: Promociones, Más pedido, Categorías
  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <Promociones
        tiendaId={tiendaId}
        onSeleccionarCategoria={handleSeleccionarCategoria}
      />
      <MasPedido
        tiendaId={tiendaId}
        onSeleccionar={(producto) => handleAgregar(producto)}
      />
      <Categorias
        tiendaId={tiendaId}
        onSeleccionar={handleSeleccionarCategoria}
      />
    </div>
  );
}
