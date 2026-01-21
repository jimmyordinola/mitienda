-- =====================================================
-- SCHEMA COMPLETO PARA EL SISTEMA DE ADMINISTRACIÓN
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- TABLA DE TIENDAS
CREATE TABLE IF NOT EXISTS tiendas (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  direccion TEXT NOT NULL,
  imagen TEXT,
  disponible BOOLEAN DEFAULT true,
  horario TEXT,
  telefono TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA DE CATEGORÍAS
CREATE TABLE IF NOT EXISTS categorias (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  imagen TEXT,
  emoji TEXT DEFAULT '🍦',
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA INTERMEDIA: CATEGORIAS POR TIENDA
CREATE TABLE IF NOT EXISTS tiendas_categorias (
  id BIGSERIAL PRIMARY KEY,
  tienda_id BIGINT NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,
  categoria_id BIGINT NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
  activo BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tienda_id, categoria_id)
);

CREATE INDEX IF NOT EXISTS idx_tiendas_categorias_tienda ON tiendas_categorias(tienda_id);
CREATE INDEX IF NOT EXISTS idx_tiendas_categorias_categoria ON tiendas_categorias(categoria_id);

-- ACTUALIZAR TABLA PRODUCTOS (agregar tienda_id y categoria_id)
ALTER TABLE productos ADD COLUMN IF NOT EXISTS tienda_id BIGINT REFERENCES tiendas(id);
ALTER TABLE productos ADD COLUMN IF NOT EXISTS categoria_id BIGINT REFERENCES categorias(id);
ALTER TABLE productos ADD COLUMN IF NOT EXISTS imagen_url TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS destacado BOOLEAN DEFAULT false;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS orden INTEGER DEFAULT 0;

-- TABLA DE PROMOCIONES
CREATE TABLE IF NOT EXISTS promociones (
  id BIGSERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('2x1', 'descuento', 'combo', 'puntos_extra')),
  valor DECIMAL(10,2),
  imagen TEXT,
  categoria_id BIGINT REFERENCES categorias(id),
  tienda_id BIGINT REFERENCES tiendas(id),
  fecha_inicio DATE,
  fecha_fin DATE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA DE CUPONES
CREATE TABLE IF NOT EXISTS cupones (
  id BIGSERIAL PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  descripcion TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('porcentaje', 'monto_fijo', 'envio_gratis', 'puntos_extra')),
  valor DECIMAL(10,2) NOT NULL,
  minimo_compra DECIMAL(10,2) DEFAULT 0,
  max_usos INTEGER,
  usos_actuales INTEGER DEFAULT 0,
  tienda_id BIGINT REFERENCES tiendas(id),
  fecha_inicio DATE,
  fecha_fin DATE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA DE USUARIOS ADMIN
CREATE TABLE IF NOT EXISTS admins (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT DEFAULT 'admin' CHECK (rol IN ('super_admin', 'admin', 'tienda')),
  tienda_id BIGINT REFERENCES tiendas(id),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACTUALIZAR TABLA VENTAS (agregar tienda_id y cupon_id)
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS tienda_id BIGINT REFERENCES tiendas(id);
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS cupon_id BIGINT REFERENCES cupones(id);
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS descuento DECIMAL(10,2) DEFAULT 0;

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_productos_tienda ON productos(tienda_id);
CREATE INDEX IF NOT EXISTS idx_productos_categoria_id ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_promociones_tienda ON promociones(tienda_id);
CREATE INDEX IF NOT EXISTS idx_cupones_codigo ON cupones(codigo);
CREATE INDEX IF NOT EXISTS idx_ventas_tienda ON ventas(tienda_id);

-- ROW LEVEL SECURITY
ALTER TABLE tiendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiendas_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE promociones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cupones ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE ACCESO (DROP IF EXISTS para evitar errores)
DROP POLICY IF EXISTS "Acceso tiendas" ON tiendas;
DROP POLICY IF EXISTS "Acceso categorias" ON categorias;
DROP POLICY IF EXISTS "Acceso tiendas_categorias" ON tiendas_categorias;
DROP POLICY IF EXISTS "Acceso promociones" ON promociones;
DROP POLICY IF EXISTS "Acceso cupones" ON cupones;
DROP POLICY IF EXISTS "Acceso admins" ON admins;

CREATE POLICY "Acceso tiendas" ON tiendas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso categorias" ON categorias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso tiendas_categorias" ON tiendas_categorias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso promociones" ON promociones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso cupones" ON cupones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso admins" ON admins FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- DATOS INICIALES (solo insertar si no existen)
-- =====================================================

-- Insertar tiendas (solo si la tabla esta vacia)
INSERT INTO tiendas (nombre, direccion, imagen, disponible)
SELECT * FROM (VALUES
  ('Real Plaza', 'Av. Sanchez Cerro Nro. 234 Interior LC-119, Piura', '/images/realplaza.jpeg', true),
  ('Avenida Grau', 'Av. Grau 452, Piura, Piura', '/images/grau.jpeg', true),
  ('Plaza de Armas', 'Calle Tacna N 520 - 526, Piura', NULL, false),
  ('Paseo Mega', 'Av. Caceres N 296 - Urb. El Chipe, Piura', '/images/mega.png', true),
  ('Mancora', 'Av. Piura # 300 - Mancora', '/images/mancora.png', true),
  ('Mall Plaza', 'Av. Mariscal Caceres N 147 Int. 16 Urb. Miraflores - Castilla, Piura', NULL, false)
) AS t(nombre, direccion, imagen, disponible)
WHERE NOT EXISTS (SELECT 1 FROM tiendas LIMIT 1);

-- Insertar categorias (solo si la tabla esta vacia)
INSERT INTO categorias (nombre, descripcion, emoji, orden)
SELECT * FROM (VALUES
  ('Helados', 'Helados artesanales', '🍨', 1),
  ('Cremoladas', 'Cremoladas refrescantes', '🥤', 2),
  ('Postres', 'Postres y dulces', '🍰', 3),
  ('Tortas Enteras', 'Tortas para llevar', '🎂', 4),
  ('Hamburguesas', 'Hamburguesas y sandwiches', '🍔', 5),
  ('Jugos', 'Jugos naturales', '🧃', 6)
) AS t(nombre, descripcion, emoji, orden)
WHERE NOT EXISTS (SELECT 1 FROM categorias LIMIT 1);

-- Insertar admin por defecto (solo si no existe)
INSERT INTO admins (email, password_hash, nombre, rol)
SELECT 'admin@elchalan.com', 'admin123', 'Administrador', 'super_admin'
WHERE NOT EXISTS (SELECT 1 FROM admins WHERE email = 'admin@elchalan.com');

-- Insertar promociones de ejemplo (solo si la tabla esta vacia)
INSERT INTO promociones (titulo, descripcion, tipo, imagen, activo)
SELECT * FROM (VALUES
  ('Promo 2x1 en Helados', 'Lleva 2 helados simples por el precio de 1', '2x1', '/images/promo-helados.jpg', true),
  ('Promo 2x1 en Cremoladas', 'Lleva 2 cremoladas por el precio de 1', '2x1', '/images/promo-cremoladas.jpg', true)
) AS t(titulo, descripcion, tipo, imagen, activo)
WHERE NOT EXISTS (SELECT 1 FROM promociones LIMIT 1);

-- Insertar cupones de ejemplo (solo si no existen)
INSERT INTO cupones (codigo, descripcion, tipo, valor, minimo_compra, activo)
SELECT 'BIENVENIDO', 'Descuento de bienvenida', 'porcentaje', 10, 20, true
WHERE NOT EXISTS (SELECT 1 FROM cupones WHERE codigo = 'BIENVENIDO');

INSERT INTO cupones (codigo, descripcion, tipo, valor, minimo_compra, activo)
SELECT 'HELADO10', '10 soles de descuento', 'monto_fijo', 10, 50, true
WHERE NOT EXISTS (SELECT 1 FROM cupones WHERE codigo = 'HELADO10');
