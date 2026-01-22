-- Tabla intermedia para relación muchos-a-muchos entre sabores y tiendas
CREATE TABLE IF NOT EXISTS sabores_tiendas (
  id BIGSERIAL PRIMARY KEY,
  sabor_id BIGINT NOT NULL REFERENCES sabores(id) ON DELETE CASCADE,
  tienda_id BIGINT NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,
  disponible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sabor_id, tienda_id)
);

-- Tabla intermedia para relación muchos-a-muchos entre toppings y tiendas
CREATE TABLE IF NOT EXISTS toppings_tiendas (
  id BIGSERIAL PRIMARY KEY,
  topping_id BIGINT NOT NULL REFERENCES toppings(id) ON DELETE CASCADE,
  tienda_id BIGINT NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,
  disponible BOOLEAN DEFAULT true,
  precio_especial DECIMAL(10,2), -- Precio opcional diferente por tienda
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(topping_id, tienda_id)
);

-- Deshabilitar RLS para simplificar
ALTER TABLE sabores_tiendas DISABLE ROW LEVEL SECURITY;
ALTER TABLE toppings_tiendas DISABLE ROW LEVEL SECURITY;

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_sabores_tiendas_sabor ON sabores_tiendas(sabor_id);
CREATE INDEX IF NOT EXISTS idx_sabores_tiendas_tienda ON sabores_tiendas(tienda_id);
CREATE INDEX IF NOT EXISTS idx_toppings_tiendas_topping ON toppings_tiendas(topping_id);
CREATE INDEX IF NOT EXISTS idx_toppings_tiendas_tienda ON toppings_tiendas(tienda_id);
