'use client';

export default function Footer() {
  return (
    <footer className="bg-[#3d2314] text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div>
            <img
              src="/images/logo.png"
              alt="El Chalán"
              className="h-20 w-auto mb-4"
            />
            <p className="text-white/70 text-sm">
              Heladería de dulce tradición desde 1975.
            </p>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-bold mb-4 text-[#4a9b8c]">CONTACTO</h3>
            <div className="space-y-2 text-sm text-white/70">
              <p>📞 DELIVERY: +51 987 343 632</p>
              <p>📧 ventas@elchalan.com.pe</p>
            </div>
          </div>

          {/* Tiendas */}
          <div>
            <h3 className="font-bold mb-4 text-[#4a9b8c]">TIENDAS</h3>
            <div className="space-y-2 text-sm text-white/70">
              <p>📍 Real Plaza</p>
              <p>📍 Avenida Grau</p>
              <p>📍 Plaza de Armas</p>
              <p>📍 Paseo Mega</p>
              <p>📍 Mancora</p>
            </div>
          </div>

          {/* Redes sociales */}
          <div>
            <h3 className="font-bold mb-4 text-[#4a9b8c]">SÍGUENOS</h3>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#4a9b8c] transition-colors">
                f
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#4a9b8c] transition-colors">
                📷
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#4a9b8c] transition-colors">
                🎵
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-4 text-center text-white/50 text-sm">
          <p>© 2024 El Chalán Heladería. Sistema de Fidelización.</p>
          <p className="mt-1">1 punto por cada S/10 de compra</p>
        </div>
      </div>
    </footer>
  );
}
