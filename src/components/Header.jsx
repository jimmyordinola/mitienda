'use client';

export default function Header({ cliente, carrito, tienda, onLoginClick, onLogout, onCambiarTienda }) {
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <header className="bg-[#4a9b8c] text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Navegación izquierda */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#" className="hover:underline">INICIO</a>
            <a href="#" className="bg-[#c53030] px-4 py-2 rounded font-bold hover:bg-[#9b2c2c] transition-colors">
              ¡COMPRA AQUÍ!
            </a>
            <a href="#" className="hover:underline">EMPRENDE</a>
          </nav>

          {/* Logo central */}
          <div className="flex-shrink-0">
            <img
              src="/images/logo.png"
              alt="El Chalán"
              className="h-16 w-auto"
            />
          </div>

          {/* Navegación derecha */}
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <a href="#" className="hover:underline">LOCALES</a>
              <a href="#" className="hover:underline">EVENTOS</a>
              <a href="#" className="hover:underline">CONTÁCTENOS</a>
            </nav>

            {/* Usuario */}
            {cliente ? (
              <div className="flex items-center gap-3">
                <a
                  href="/mi-cuenta/puntos"
                  className="flex items-center gap-2 bg-yellow-500 text-[#3d2314] px-3 py-1.5 rounded-lg hover:bg-yellow-400 transition-colors"
                  title="Ver mis puntos"
                >
                  <span>⭐</span>
                  <span className="font-bold">{cliente.puntos || 0}</span>
                </a>
                <div className="text-right hidden sm:block">
                  <p className="font-semibold text-sm">{cliente.nombre.split(' ')[0]}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="text-white/70 hover:text-red-300 text-sm"
                >
                  Salir
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors text-sm font-medium"
              >
                <span>👤</span>
                <span className="hidden sm:inline">Ingresar</span>
              </button>
            )}

            {/* Carrito */}
            <div className="relative">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                <span>🛒</span>
                {totalItems > 0 && (
                  <span className="bg-[#c53030] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {totalItems}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
