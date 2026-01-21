-- =====================================================
-- SCHEMA PARA PRODUCTOS PERSONALIZABLES
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- TABLA DE SABORES
CREATE TABLE IF NOT EXISTS sabores (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  imagen TEXT,
  color TEXT,
  tienda_id BIGINT REFERENCES tiendas(id),
  categoria_id BIGINT REFERENCES categorias(id),
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sabores_tienda ON sabores(tienda_id);
CREATE INDEX IF NOT EXISTS idx_sabores_categoria ON sabores(categoria_id);

-- TABLA DE TOPPINGS
CREATE TABLE IF NOT EXISTS toppings (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  imagen TEXT,
  precio DECIMAL(10,2) DEFAULT 0,
  tienda_id BIGINT REFERENCES tiendas(id),
  categoria_id BIGINT REFERENCES categorias(id),
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_toppings_tienda ON toppings(tienda_id);
CREATE INDEX IF NOT EXISTS idx_toppings_categoria ON toppings(categoria_id);

-- AGREGAR COLUMNAS A PRODUCTOS PARA PERSONALIZACION
ALTER TABLE productos ADD COLUMN IF NOT EXISTS personalizable BOOLEAN DEFAULT false;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS max_sabores INTEGER DEFAULT 1;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS max_toppings INTEGER DEFAULT 0;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS permite_toppings BOOLEAN DEFAULT false;

-- ROW LEVEL SECURITY
ALTER TABLE sabores ENABLE ROW LEVEL SECURITY;
ALTER TABLE toppings ENABLE ROW LEVEL SECURITY;

-- POLITICAS
DROP POLICY IF EXISTS "Acceso sabores" ON sabores;
DROP POLICY IF EXISTS "Acceso toppings" ON toppings;

CREATE POLICY "Acceso sabores" ON sabores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso toppings" ON toppings FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- DATOS DE EJEMPLO PARA SABORES (Helados)
-- =====================================================
INSERT INTO sabores (nombre, imagen, orden)
SELECT * FROM (VALUES
  ('Alfajor', '/images/sabores/alfajor.jpg', 1),
  ('Brownie', '/images/sabores/brownie.jpg', 2),
  ('Charada', '/images/sabores/charada.jpg', 3),
  ('Chocolate', '/images/sabores/chocolate.jpg', 4),
  ('Chocomenta', '/images/sabores/chocomenta.jpg', 5),
  ('Coco', '/images/sabores/coco.jpg', 6),
  ('Fresa', '/images/sabores/fresa.jpg', 7),
  ('Granizado', '/images/sabores/granizado.jpg', 8),
  ('Lucuma', '/images/sabores/lucuma.jpg', 9),
  ('Manjar Blanco', '/images/sabores/manjar-blanco.jpg', 10),
  ('Mani', '/images/sabores/mani.jpg', 11),
  ('Marshmellow', '/images/sabores/marshmellow.jpg', 12),
  ('Mentachips', '/images/sabores/mentachips.jpg', 13),
  ('Pie de Limon', '/images/sabores/pie-limon.jpg', 14),
  ('Pitufo', '/images/sabores/pitufo.jpg', 15),
  ('Ron pasas', '/images/sabores/ron-pasas.jpg', 16)
) AS t(nombre, imagen, orden)
WHERE NOT EXISTS (SELECT 1 FROM sabores LIMIT 1);

-- =====================================================
-- DATOS DE EJEMPLO PARA TOPPINGS
-- =====================================================
INSERT INTO toppings (nombre, imagen, precio, orden)
SELECT * FROM (VALUES
  ('Cobertura de Chocolate', '/images/toppings/chocolate.jpg', 1.50, 1),
  ('Fudge', '/images/toppings/fudge.jpg', 1.50, 2),
  ('Galletas Waffer', '/images/toppings/waffer.jpg', 1.50, 3),
  ('Gomitas de Oso', '/images/toppings/gomitas.jpg', 1.50, 4),
  ('Grageas', '/images/toppings/grageas.jpg', 1.50, 5),
  ('Marrosquinos', '/images/toppings/marrosquinos.jpg', 1.50, 6),
  ('Galleta Oreo', '/images/toppings/oreo.jpg', 1.50, 7),
  ('Chispas de Chocolate', '/images/toppings/chispas.jpg', 1.50, 8),
  ('Frutas Frescas', '/images/toppings/frutas.jpg', 2.00, 9),
  ('Crema Chantilly', '/images/toppings/chantilly.jpg', 1.50, 10)
) AS t(nombre, imagen, precio, orden)
WHERE NOT EXISTS (SELECT 1 FROM toppings LIMIT 1);
