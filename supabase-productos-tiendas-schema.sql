-- Tabla intermedia para relación muchos-a-muchos entre productos y tiendas
CREATE TABLE IF NOT EXISTS productos_tiendas (
  id BIGSERIAL PRIMARY KEY,
  producto_id BIGINT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  tienda_id BIGINT NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,
  precio_especial DECIMAL(10,2), -- Precio opcional diferente por tienda
  disponible BOOLEAN DEFAULT true,
  destacado BOOLEAN DEFAULT false, -- Lo más pedido por tienda
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(producto_id, tienda_id)
);

-- Si la tabla ya existe, agregar la columna destacado
ALTER TABLE productos_tiendas ADD COLUMN IF NOT EXISTS destacado BOOLEAN DEFAULT false;

-- Deshabilitar RLS para simplificar
ALTER TABLE productos_tiendas DISABLE ROW LEVEL SECURITY;

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_tiendas_producto ON productos_tiendas(producto_id);
CREATE INDEX IF NOT EXISTS idx_productos_tiendas_tienda ON productos_tiendas(tienda_id);
