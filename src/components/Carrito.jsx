'use client';

export default function Carrito({ items, onActualizar, onEliminar, onCheckout, promociones = [], promoAplicada }) {
  // Calcular descuentos
  const calcularDescuentos = () => {
    let descuento2x1 = 0;
    let descuentoPorcentaje = 0;
    const itemsConPromo = {};

    // 2x1: Por cada 2 del mismo producto con promo 2x1, uno es gratis
    items.forEach(item => {
      const promo2x1 = promociones.find(p =>
        p.tipo === '2x1' && p.categoria_id === item.categoria_id && p.activo
      );
      if (promo2x1 && item.cantidad >= 2) {
        const unidadesGratis = Math.floor(item.cantidad / 2);
        const precioItem = item.precioFinal || item.precio;
        descuento2x1 += unidadesGratis * precioItem;
        itemsConPromo[item.id] = { tipo: '2x1', promo: promo2x1, unidadesGratis };
      }
    });

    // Descuento porcentaje: aplica a productos de la categoría de la promo activa
    if (promoAplicada && promoAplicada.tipo === 'descuento' && promoAplicada.valor) {
      items.forEach(item => {
        if (item.categoria_id === promoAplicada.categoria_id) {
          const precioItem = item.precioFinal || item.precio;
          const descuentoItem = (precioItem * item.cantidad) * (promoAplicada.valor / 100);
          descuentoPorcentaje += descuentoItem;
          itemsConPromo[item.id] = {
            tipo: 'descuento',
            promo: promoAplicada,
            descuento: descuentoItem,
            porcentaje: promoAplicada.valor
          };
        }
      });
    }

    return { descuento2x1, descuentoPorcentaje, itemsConPromo };
  };

  const { descuento2x1, descuentoPorcentaje, itemsConPromo } = calcularDescuentos();
  const descuentoTotal = descuento2x1 + descuentoPorcentaje;

  // Usar precioFinal si existe (incluye toppings), sino precio base
  const subtotal = items.reduce((sum, item) => sum + ((item.precioFinal || item.precio) * item.cantidad), 0);
  const total = subtotal - descuentoTotal;
  const puntosGanar = Math.floor(total / 10);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-[#3d2314] mb-4">🛒 Tu Pedido</h2>
        <div className="text-center py-8 text-gray-400">
          <div className="text-5xl mb-2">🛒</div>
          <p className="text-[#3d2314]">Tu carrito está vacío</p>
          <p className="text-sm">Agrega productos para comenzar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-bold text-[#3d2314] mb-4">🛒 Tu Pedido ({items.length})</h2>

      <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
        {items.map((item) => {
          const promoItem = itemsConPromo[item.id];
          return (
            <div key={item.id} className={`p-3 rounded-xl ${promoItem ? 'bg-green-50 border-2 border-green-200' : 'bg-[#f5f0e8]'}`}>
              <div className="flex items-start gap-3">
                {/* Imagen del producto */}
                {item.imagen_url ? (
                  <img src={item.imagen_url} alt={item.nombre} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <span className="text-3xl flex-shrink-0">{item.imagen || '🍦'}</span>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[#3d2314]">{item.nombre}</h4>
                  {/* Mostrar sabores si existen */}
                  {item.personalizacion?.sabores?.length > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="font-medium">Sabores:</span> {item.personalizacion.sabores.map(s => s.nombre).join(', ')}
                    </p>
                  )}
                  {/* Mostrar toppings si existen */}
                  {item.personalizacion?.toppings?.length > 0 && (
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Toppings:</span> {item.personalizacion.toppings.map(t => t.nombre).join(', ')}
                    </p>
                  )}

                  {/* Precio con descuento */}
                  <div className="mt-1">
                    {promoItem ? (
                      <div className="flex items-center gap-2">
                        {promoItem.tipo === '2x1' ? (
                          <>
                            <span className="text-sm text-gray-400 line-through">
                              S/{((item.precioFinal || item.precio) * item.cantidad).toFixed(2)}
                            </span>
                            <span className="text-sm text-[#4a9b8c] font-bold">
                              S/{((item.precioFinal || item.precio) * item.cantidad - (promoItem.unidadesGratis * (item.precioFinal || item.precio))).toFixed(2)}
                            </span>
                            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                              🎉 {promoItem.unidadesGratis} gratis
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-sm text-gray-400 line-through">
                              S/{((item.precioFinal || item.precio) * item.cantidad).toFixed(2)}
                            </span>
                            <span className="text-sm text-[#4a9b8c] font-bold">
                              S/{((item.precioFinal || item.precio) * item.cantidad - promoItem.descuento).toFixed(2)}
                            </span>
                            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                              -{promoItem.porcentaje}%
                            </span>
                          </>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-[#4a9b8c] font-bold">
                        S/{((item.precioFinal || item.precio) * item.cantidad).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {/* Controles de cantidad */}
              <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-gray-200">
                <button
                  onClick={() => onActualizar(item.id, item.cantidad - 1)}
                  className="w-7 h-7 rounded-full bg-[#3d2314] text-white font-bold hover:bg-[#5c3a2d] text-sm"
                >
                  -
                </button>
                <span className="w-6 text-center font-bold text-[#3d2314]">{item.cantidad}</span>
                <button
                  onClick={() => onActualizar(item.id, item.cantidad + 1)}
                  className="w-7 h-7 rounded-full bg-[#4a9b8c] text-white font-bold hover:bg-[#3d8577] text-sm"
                >
                  +
                </button>
                <button
                  onClick={() => onEliminar(item.id)}
                  className="w-7 h-7 rounded-full bg-red-100 text-red-500 hover:bg-red-200 ml-2 text-sm"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t-2 border-[#4a9b8c] pt-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Subtotal:</span>
          <span className="text-gray-600">S/{subtotal.toFixed(2)}</span>
        </div>

        {descuentoTotal > 0 && (
          <div className="flex justify-between text-sm mb-1 text-green-600">
            <span>🎉 Descuento promoción:</span>
            <span className="font-bold">-S/{descuentoTotal.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-lg mb-2 font-bold">
          <span className="text-[#3d2314]">Total:</span>
          <span className="text-[#3d2314]">S/{total.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm text-[#4a9b8c] mb-4">
          <span>Puntos a ganar:</span>
          <span className="font-bold">+{puntosGanar} pts</span>
        </div>

        <button
          onClick={() => onCheckout({ descuentoPromo: descuentoTotal })}
          className="w-full py-4 bg-[#c53030] text-white rounded-xl font-bold text-lg hover:bg-[#9b2c2c] hover:scale-[1.02] transition-all"
        >
          Pagar S/{total.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
