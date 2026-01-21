-- Ejecutar este SQL para agregar más productos
-- Solo ejecutar si ya tienes la tabla productos creada

-- Limpiar productos existentes (opcional)
-- DELETE FROM productos;

-- HELADOS
INSERT INTO productos (nombre, descripcion, precio, categoria, imagen) VALUES
('Helado Simple', '1 bola del sabor que prefieras', 8.00, 'helados', '🍦'),
('Helado Doble', '2 bolas de helado a elección', 12.00, 'helados', '🍦'),
('Helado Triple', '3 bolas de helado a elección', 16.00, 'helados', '🍦'),
('Litro de Helado', 'Helado para llevar, sabor a elegir', 35.00, 'helados', '🍨'),
('Medio Litro', 'Helado para llevar, sabor a elegir', 20.00, 'helados', '🍨');

-- CREMOLADAS
INSERT INTO productos (nombre, descripcion, precio, categoria, imagen) VALUES
('Cremolada Maracuyá', 'Refrescante cremolada de maracuyá', 10.00, 'cremoladas', '🥤'),
('Cremolada Fresa', 'Cremolada cremosa de fresa', 10.00, 'cremoladas', '🥤'),
('Cremolada Mango', 'Cremolada tropical de mango', 10.00, 'cremoladas', '🥤'),
('Cremolada Lúcuma', 'Cremolada de lúcuma peruana', 12.00, 'cremoladas', '🥤'),
('Cremolada Chicha', 'Cremolada de chicha morada', 10.00, 'cremoladas', '🥤');

-- POSTRES
INSERT INTO productos (nombre, descripcion, precio, categoria, imagen) VALUES
('Tres Leches Vainilla', 'Delicioso tres leches tradicional', 12.00, 'postres', '🍰'),
('Tres Leches Chocolate', 'Tres leches con chocolate', 14.00, 'postres', '🍰'),
('Torta Helada', 'Porción de torta helada', 10.00, 'postres', '🎂'),
('Brownie con Helado', 'Brownie caliente con helado', 18.00, 'postres', '🍫'),
('Cheesecake', 'Porción de cheesecake', 14.00, 'postres', '🍰');

-- TORTAS ENTERAS
INSERT INTO productos (nombre, descripcion, precio, categoria, imagen) VALUES
('Torta Tres Leches (12 porc)', 'Torta completa de tres leches', 85.00, 'tortas', '🎂'),
('Torta Helada (12 porc)', 'Torta helada para 12 personas', 95.00, 'tortas', '🎂'),
('Torta Selva Negra', 'Torta de chocolate con cerezas', 90.00, 'tortas', '🎂'),
('Torta de Chocolate', 'Torta clásica de chocolate', 85.00, 'tortas', '🎂');

-- HAMBURGUESAS
INSERT INTO productos (nombre, descripcion, precio, categoria, imagen) VALUES
('Hamburguesa Clásica', 'Carne, lechuga, tomate, papas', 18.00, 'hamburguesas', '🍔'),
('Hamburguesa Doble', 'Doble carne, queso, papas', 25.00, 'hamburguesas', '🍔'),
('Hamburguesa BBQ', 'Con salsa BBQ y cebolla crispy', 22.00, 'hamburguesas', '🍔'),
('Sandwich Club', 'Triple piso con pollo, jamón y huevo', 20.00, 'hamburguesas', '🥪'),
('Hot Dog', 'Hot dog con papas', 12.00, 'hamburguesas', '🌭');

-- JUGOS Y BEBIDAS
INSERT INTO productos (nombre, descripcion, precio, categoria, imagen) VALUES
('Jugo de Naranja', 'Jugo natural de naranja', 8.00, 'jugos', '🍊'),
('Jugo de Papaya', 'Jugo natural de papaya', 8.00, 'jugos', '🧃'),
('Jugo de Piña', 'Jugo natural de piña', 8.00, 'jugos', '🍍'),
('Jugo Surtido', 'Mix de frutas de temporada', 10.00, 'jugos', '🥤'),
('Limonada Frozen', 'Limonada helada refrescante', 10.00, 'jugos', '🍋'),
('Chicha Morada', 'Bebida tradicional peruana', 6.00, 'jugos', '🍇');
