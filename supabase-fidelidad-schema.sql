-- ============================================
-- SISTEMA DE FIDELIZACIÓN - ESQUEMA ADICIONAL
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. Agregar campos al cliente para fidelización
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS miembro_fidelidad BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS fecha_union_fidelidad TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ultimo_bonus_cumpleanos INTEGER; -- Año del último bonus

-- 2. Tabla de recompensas (catálogo)
CREATE TABLE IF NOT EXISTS recompensas (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('producto_gratis', 'descuento_porcentaje', 'descuento_monto')),
  puntos_requeridos INTEGER NOT NULL,
  valor DECIMAL(10,2), -- Para descuentos: porcentaje o monto
  producto_id BIGINT REFERENCES productos(id), -- Para producto gratis
  imagen TEXT,
  activo BOOLEAN DEFAULT true,
  stock INTEGER, -- NULL = ilimitado
  fecha_inicio DATE,
  fecha_fin DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de canjes de recompensas
CREATE TABLE IF NOT EXISTS canjes_recompensas (
  id BIGSERIAL PRIMARY KEY,
  cliente_id BIGINT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  recompensa_id BIGINT NOT NULL REFERENCES recompensas(id),
  puntos_usados INTEGER NOT NULL,
  codigo_canje TEXT UNIQUE NOT NULL, -- Código único para usar
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'usado', 'expirado')),
  fecha_canje TIMESTAMPTZ DEFAULT NOW(),
  fecha_uso TIMESTAMPTZ,
  fecha_expiracion DATE
);

-- 4. Configuración del programa de fidelidad
CREATE TABLE IF NOT EXISTS config_fidelidad (
  id BIGSERIAL PRIMARY KEY,
  clave TEXT UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  descripcion TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar configuraciones por defecto
INSERT INTO config_fidelidad (clave, valor, descripcion) VALUES
  ('puntos_por_sol', '1', 'Puntos ganados por cada sol gastado'),
  ('bonus_bienvenida', '50', 'Puntos de bonus al unirse al programa'),
  ('bonus_cumpleanos', '100', 'Puntos de bonus por cumpleaños'),
  ('dias_expiracion_canje', '30', 'Días para usar una recompensa canjeada'),
  ('puntos_para_cupon_auto', '75', 'Puntos necesarios para cupón automático'),
  ('valor_cupon_auto', '15', 'Valor en soles del cupón automático')
ON CONFLICT (clave) DO NOTHING;

-- 5. Actualizar tipos permitidos en transacciones
-- Primero eliminar el constraint existente si existe
ALTER TABLE transacciones DROP CONSTRAINT IF EXISTS transacciones_tipo_check;

-- Agregar el nuevo constraint con más tipos
ALTER TABLE transacciones
ADD CONSTRAINT transacciones_tipo_check
CHECK (tipo IN ('GANADO', 'CANJEADO', 'BONUS_BIENVENIDA', 'BONUS_CUMPLEANOS', 'RECOMPENSA', 'AJUSTE', 'EXPIRADO'));

-- Agregar columna de referencia opcional
ALTER TABLE transacciones
ADD COLUMN IF NOT EXISTS referencia_id BIGINT,
ADD COLUMN IF NOT EXISTS referencia_tipo TEXT;

-- 6. Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_recompensas_activo ON recompensas(activo) WHERE activo = true;
CREATE INDEX IF NOT EXISTS idx_canjes_cliente ON canjes_recompensas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_canjes_estado ON canjes_recompensas(estado);
CREATE INDEX IF NOT EXISTS idx_clientes_cumpleanos ON clientes(fecha_nacimiento);
CREATE INDEX IF NOT EXISTS idx_clientes_fidelidad ON clientes(miembro_fidelidad) WHERE miembro_fidelidad = true;

-- 7. Row Level Security
ALTER TABLE recompensas ENABLE ROW LEVEL SECURITY;
ALTER TABLE canjes_recompensas ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_fidelidad ENABLE ROW LEVEL SECURITY;

-- Políticas: recompensas son públicas para lectura
CREATE POLICY "Lectura publica recompensas" ON recompensas
  FOR SELECT USING (true);

CREATE POLICY "Admin recompensas" ON recompensas
  FOR ALL USING (true) WITH CHECK (true);

-- Políticas: cada cliente ve solo sus canjes
CREATE POLICY "Cliente ve sus canjes" ON canjes_recompensas
  FOR SELECT USING (true);

CREATE POLICY "Cliente crea canjes" ON canjes_recompensas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin canjes" ON canjes_recompensas
  FOR ALL USING (true) WITH CHECK (true);

-- Config solo lectura pública
CREATE POLICY "Lectura config" ON config_fidelidad
  FOR SELECT USING (true);

-- 8. Función para generar código de canje único
CREATE OR REPLACE FUNCTION generar_codigo_canje()
RETURNS TEXT AS $$
DECLARE
  codigo TEXT;
  existe BOOLEAN;
BEGIN
  LOOP
    -- Generar código alfanumérico de 8 caracteres
    codigo := upper(substring(md5(random()::text) from 1 for 8));
    -- Verificar que no existe
    SELECT EXISTS(SELECT 1 FROM canjes_recompensas WHERE codigo_canje = codigo) INTO existe;
    IF NOT existe THEN
      RETURN codigo;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger para establecer código y fecha de expiración al crear canje
CREATE OR REPLACE FUNCTION set_canje_defaults()
RETURNS TRIGGER AS $$
DECLARE
  dias_exp INTEGER;
BEGIN
  -- Obtener días de expiración de la config
  SELECT COALESCE(valor::INTEGER, 30) INTO dias_exp
  FROM config_fidelidad WHERE clave = 'dias_expiracion_canje';

  -- Establecer código único si no viene
  IF NEW.codigo_canje IS NULL THEN
    NEW.codigo_canje := generar_codigo_canje();
  END IF;

  -- Establecer fecha de expiración si no viene
  IF NEW.fecha_expiracion IS NULL THEN
    NEW.fecha_expiracion := CURRENT_DATE + dias_exp;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_canje_defaults
  BEFORE INSERT ON canjes_recompensas
  FOR EACH ROW
  EXECUTE FUNCTION set_canje_defaults();

-- 10. Insertar recompensas de ejemplo
INSERT INTO recompensas (nombre, descripcion, tipo, puntos_requeridos, valor, imagen) VALUES
  ('Helado Simple Gratis', 'Canjea por un helado de 1 bola', 'producto_gratis', 100, NULL, '🍦'),
  ('10% de Descuento', 'Descuento del 10% en tu próxima compra', 'descuento_porcentaje', 150, 10, '🎫'),
  ('S/20 de Descuento', 'Descuento de S/20 en compras mayores a S/50', 'descuento_monto', 200, 20, '💰'),
  ('Helado Doble Gratis', 'Canjea por un helado de 2 bolas', 'producto_gratis', 180, NULL, '🍨'),
  ('Sundae Especial Gratis', 'Canjea por un sundae especial', 'producto_gratis', 300, NULL, '🍨'),
  ('15% de Descuento', 'Descuento del 15% en tu próxima compra', 'descuento_porcentaje', 250, 15, '🎫'),
  ('Topping Gratis', 'Canjea por un topping extra', 'producto_gratis', 50, NULL, '🍫')
ON CONFLICT DO NOTHING;

-- 11. Vista para obtener puntos totales del cliente (global + por tienda)
CREATE OR REPLACE VIEW vista_puntos_cliente AS
SELECT
  c.id as cliente_id,
  c.nombre,
  c.puntos as puntos_globales,
  c.miembro_fidelidad,
  c.fecha_union_fidelidad,
  COALESCE(SUM(pt.puntos), 0) as puntos_tiendas_total,
  COUNT(DISTINCT pt.tienda_id) as tiendas_activas
FROM clientes c
LEFT JOIN puntos_tienda pt ON c.id = pt.cliente_id
GROUP BY c.id, c.nombre, c.puntos, c.miembro_fidelidad, c.fecha_union_fidelidad;

-- 12. Función para verificar y otorgar bonus de cumpleaños
CREATE OR REPLACE FUNCTION verificar_bonus_cumpleanos(p_cliente_id BIGINT)
RETURNS TABLE(bonus_otorgado BOOLEAN, puntos_bonus INTEGER, mensaje TEXT) AS $$
DECLARE
  v_fecha_nac DATE;
  v_ultimo_bonus INTEGER;
  v_bonus_puntos INTEGER;
  v_anio_actual INTEGER;
BEGIN
  -- Obtener datos del cliente
  SELECT fecha_nacimiento, ultimo_bonus_cumpleanos
  INTO v_fecha_nac, v_ultimo_bonus
  FROM clientes WHERE id = p_cliente_id;

  -- Si no tiene fecha de nacimiento
  IF v_fecha_nac IS NULL THEN
    RETURN QUERY SELECT false, 0, 'No tienes fecha de nacimiento registrada';
    RETURN;
  END IF;

  v_anio_actual := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;

  -- Si ya recibió bonus este año
  IF v_ultimo_bonus = v_anio_actual THEN
    RETURN QUERY SELECT false, 0, 'Ya recibiste tu bonus de cumpleaños este año';
    RETURN;
  END IF;

  -- Verificar si es su cumpleaños (mismo día y mes)
  IF EXTRACT(MONTH FROM v_fecha_nac) = EXTRACT(MONTH FROM CURRENT_DATE)
     AND EXTRACT(DAY FROM v_fecha_nac) = EXTRACT(DAY FROM CURRENT_DATE) THEN

    -- Obtener puntos de bonus de la config
    SELECT COALESCE(valor::INTEGER, 100) INTO v_bonus_puntos
    FROM config_fidelidad WHERE clave = 'bonus_cumpleanos';

    -- Otorgar bonus
    UPDATE clientes
    SET puntos = puntos + v_bonus_puntos,
        ultimo_bonus_cumpleanos = v_anio_actual
    WHERE id = p_cliente_id;

    -- Registrar transacción
    INSERT INTO transacciones (cliente_id, tipo, puntos, descripcion)
    VALUES (p_cliente_id, 'BONUS_CUMPLEANOS', v_bonus_puntos, 'Bonus de cumpleaños ' || v_anio_actual);

    RETURN QUERY SELECT true, v_bonus_puntos, '¡Feliz cumpleaños! Has recibido ' || v_bonus_puntos || ' puntos de regalo';
    RETURN;
  END IF;

  RETURN QUERY SELECT false, 0, 'Hoy no es tu cumpleaños';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- NOTAS DE USO:
-- ============================================
--
-- Para unir cliente al programa de fidelidad:
-- UPDATE clientes SET miembro_fidelidad = true, fecha_union_fidelidad = NOW() WHERE id = X;
-- INSERT INTO transacciones (cliente_id, tipo, puntos, descripcion)
-- VALUES (X, 'BONUS_BIENVENIDA', 50, 'Bonus de bienvenida al programa');
--
-- Para canjear recompensa:
-- INSERT INTO canjes_recompensas (cliente_id, recompensa_id, puntos_usados)
-- VALUES (cliente_id, recompensa_id, puntos);
--
-- Para verificar cumpleaños:
-- SELECT * FROM verificar_bonus_cumpleanos(cliente_id);
-- ============================================
