'use client';

export default function Carrito({ items, onActualizar, onEliminar, onCheckout }) {
  // Usar precioFinal si existe (incluye toppings), sino precio base
  const total = items.reduce((sum, item) => sum + ((item.precioFinal || item.precio) * item.cantidad), 0);
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
        {items.map((item) => (
          <div key={item.id} className="p-3 bg-[#f5f0e8] rounded-xl">
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
                <p className="text-sm text-[#4a9b8c] font-bold mt-1">S/{(item.precioFinal || item.precio).toFixed(2)}</p>
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
        ))}
      </div>

      <div className="border-t-2 border-[#4a9b8c] pt-4">
        <div className="flex justify-between text-lg mb-2">
          <span className="text-[#3d2314]">Subtotal:</span>
          <span className="font-bold text-[#3d2314]">S/{total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-[#4a9b8c] mb-4">
          <span>Puntos a ganar:</span>
          <span className="font-bold">+{puntosGanar} pts</span>
        </div>
        <button
          onClick={onCheckout}
          className="w-full py-4 bg-[#c53030] text-white rounded-xl font-bold text-lg hover:bg-[#9b2c2c] hover:scale-[1.02] transition-all"
        >
          Pagar S/{total.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
