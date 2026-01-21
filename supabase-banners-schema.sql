-- Tabla para los banners del slider
CREATE TABLE IF NOT EXISTS banners (
  id BIGSERIAL PRIMARY KEY,
  titulo TEXT,
  subtitulo TEXT,
  imagen TEXT NOT NULL,
  url_destino TEXT,
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deshabilitar RLS para simplificar
ALTER TABLE banners DISABLE ROW LEVEL SECURITY;

-- Insertar banners de ejemplo
INSERT INTO banners (titulo, subtitulo, imagen, orden, activo) VALUES
('50 Años de Tradición', 'Helados artesanales desde 1975', 'https://jfxmovtppqilxrsmmnw.supabase.co/storage/v1/object/public/imagenes/slider/slide1.jpg', 1, true),
('Los Mejores Sabores', 'Más de 40 sabores para elegir', 'https://jfxmovtppqilxrsmmnw.supabase.co/storage/v1/object/public/imagenes/slider/slide2.jpg', 2, true),
('Cremoladas Únicas', 'Refréscate con nuestras cremoladas', 'https://jfxmovtppqilxrsmmnw.supabase.co/storage/v1/object/public/imagenes/slider/slide3.jpg', 3, true);
