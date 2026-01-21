'use client';

export default function Footer() {
  return (
    <footer className="bg-[#3d2314] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div>
            <img
              src="/images/logo.png"
              alt="El Chalán"
              className="h-24 w-auto mb-4"
            />
            <p className="text-white/70 text-sm leading-relaxed">
              La Heladería El Chalán es una empresa de dulce tradición con más de cuatro décadas de actividad. Nació el 23 de diciembre de 1975 con seis trabajadores con un solo local de atención al público.
            </p>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-bold mb-6 text-lg tracking-wider">CONTÁCTO</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-[#4a9b8c] text-lg">📱</span>
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wider">Delivery</p>
                  <p className="text-white">+51 987 343 632</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-[#4a9b8c] text-lg">📞</span>
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wider">Eventos & Emprende con El Chalán</p>
                  <p className="text-[#4a9b8c]">+51 972 741 259</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-[#4a9b8c] text-lg">✉️</span>
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wider">Correo Electrónico</p>
                  <p className="text-white">ventas@elchalan.com.pe</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-bold mb-3 text-sm tracking-wider">TE ESCUCHAMOS</h4>
              <div className="bg-white/10 rounded-lg p-3 inline-block">
                <p className="text-xs text-white/70">LIBRO DE RECLAMACIONES</p>
              </div>
            </div>
          </div>

          {/* Tiendas */}
          <div>
            <h3 className="font-bold mb-6 text-lg tracking-wider">TIENDAS EL CHALÁN</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-[#4a9b8c]">📍</span>
                <div>
                  <p className="font-semibold text-white/90">TIENDA PLAZA DE ARMAS</p>
                  <p className="text-white/60 text-xs">Calle Tacna Nro. 520, Piura, Piura</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-[#4a9b8c]">📍</span>
                <div>
                  <p className="font-semibold text-white/90">TIENDA AV. GRAU</p>
                  <p className="text-white/60 text-xs">Av. Grau Nro. 452, Piura, Piura</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-[#4a9b8c]">📍</span>
                <div>
                  <p className="font-semibold text-white/90">TIENDA PASEO MEGA</p>
                  <p className="text-white/60 text-xs">Av. Andrés Avelino Cáceres Nro. 293 Int. 01 Urb. El Chipe, Piura</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-[#4a9b8c]">📍</span>
                <div>
                  <p className="font-semibold text-white/90">TIENDA C.C. REAL PLAZA</p>
                  <p className="text-white/60 text-xs">Av. Sanchez Cerro Nro. 234 Z.I. Interior LC - 119, Piura</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-[#4a9b8c]">📍</span>
                <div>
                  <p className="font-semibold text-white/90">TIENDA C.C. MALL PLAZA PIURA</p>
                  <p className="text-white/60 text-xs">Av. Mariscal Cáceres Nro. 147 Int. 16 Urb. Miraflores - Castilla, Piura</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-[#4a9b8c]">📍</span>
                <div>
                  <p className="font-semibold text-white/90">TIENDA MÁNCORA</p>
                  <p className="text-white/60 text-xs">Av. Panamericana Nro. 300, Máncora - Piura</p>
                </div>
              </div>
            </div>
          </div>

          {/* Redes sociales */}
          <div>
            <h3 className="font-bold mb-6 text-lg tracking-wider">ENCUÉNTRANOS EN</h3>
            <div className="space-y-4">
              <a
                href="https://facebook.com/ElChalanHeladeria"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/80 hover:text-white transition-colors"
              >
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span>/ElChalánHeladería</span>
              </a>

              <a
                href="https://instagram.com/HeladeriaElChalan"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/80 hover:text-white transition-colors"
              >
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <span>@HeladeríaElChalán</span>
              </a>

              <a
                href="https://tiktok.com/@heladeriaelchalan"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-white/80 hover:text-white transition-colors"
              >
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                </div>
                <span>@heladeriaelchalan</span>
              </a>
            </div>

            {/* Botón WhatsApp */}
            <a
              href="https://wa.me/51987343632"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full font-medium hover:bg-[#128C7E] transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Atención vía WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10 py-4">
        <div className="container mx-auto px-4 text-center text-white/50 text-sm">
          <p>© 2024 El Chalán Heladería. Todos los derechos reservados.</p>
          <p className="mt-1">Sistema de Fidelización - 1 punto por cada S/10 de compra</p>
        </div>
      </div>
    </footer>
  );
}
