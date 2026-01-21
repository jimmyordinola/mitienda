-- Ejecutar este SQL en el editor SQL de Supabase
-- https://supabase.com/dashboard/project/_/sql

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT UNIQUE NOT NULL,
  pin TEXT DEFAULT '1234',
  puntos INTEGER DEFAULT 0,
  fecha_registro TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de productos (helados)
CREATE TABLE IF NOT EXISTS productos (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  categoria TEXT NOT NULL,
  imagen TEXT,
  disponible BOOLEAN DEFAULT true
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
  id BIGSERIAL PRIMARY KEY,
  cliente_id BIGINT REFERENCES clientes(id),
  total DECIMAL(10,2) NOT NULL,
  puntos_ganados INTEGER DEFAULT 0,
  fecha TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de detalle de ventas
CREATE TABLE IF NOT EXISTS venta_detalle (
  id BIGSERIAL PRIMARY KEY,
  venta_id BIGINT NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id BIGINT NOT NULL REFERENCES productos(id),
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL
);

-- Tabla de transacciones de puntos
CREATE TABLE IF NOT EXISTS transacciones (
  id BIGSERIAL PRIMARY KEY,
  cliente_id BIGINT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('GANADO', 'CANJEADO')),
  puntos INTEGER NOT NULL,
  descripcion TEXT,
  fecha TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(telefono);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_ventas_cliente ON ventas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_cliente ON transacciones(cliente_id);

-- Row Level Security
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público
CREATE POLICY "Acceso clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso productos" ON productos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso ventas" ON ventas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso venta_detalle" ON venta_detalle FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso transacciones" ON transacciones FOR ALL USING (true) WITH CHECK (true);

-- Insertar productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, categoria, imagen) VALUES
('Helado Simple', '1 bola de helado a elección', 25.00, 'helados', '🍦'),
('Helado Doble', '2 bolas de helado a elección', 40.00, 'helados', '🍦'),
('Helado Triple', '3 bolas de helado a elección', 55.00, 'helados', '🍦'),
('Sundae Clásico', 'Helado con chocolate, crema y cereza', 65.00, 'sundaes', '🍨'),
('Sundae Especial', 'Helado premium con toppings variados', 85.00, 'sundaes', '🍨'),
('Banana Split', 'Plátano con 3 bolas, crema y salsas', 95.00, 'sundaes', '🍌'),
('Malteada Chocolate', 'Malteada cremosa de chocolate', 45.00, 'bebidas', '🥤'),
('Malteada Fresa', 'Malteada cremosa de fresa', 45.00, 'bebidas', '🥤'),
('Malteada Vainilla', 'Malteada cremosa de vainilla', 45.00, 'bebidas', '🥤'),
('Cono Sencillo', 'Cono con 1 bola de helado', 20.00, 'conos', '🍦'),
('Cono Doble', 'Cono con 2 bolas de helado', 35.00, 'conos', '🍦'),
('Topping Extra', 'Chispas, frutas, salsas', 10.00, 'extras', '🍫'),
('Crema Batida', 'Porción extra de crema', 8.00, 'extras', '🍰');
