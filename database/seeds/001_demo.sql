USE invcontrol;

-- Demo seed data equivalent to apps/api/src/store.js
-- Idempotent via INSERT IGNORE.

-- =====================
-- STORES
-- =====================
INSERT IGNORE INTO stores (
  id,
  name,
  code,
  address,
  phone,
  latitude,
  longitude,
  is_active
) VALUES
(1, 'Sucursal Centro', 'CENTRO', 'Balancan, Tabasco, Mexico', '9340000000', 17.8008000, -91.5364000, TRUE);

-- =====================
-- USERS
-- =====================
-- passwordHash values generated with bcryptjs (salt rounds 12)
-- for: admin123 / trabajador123
INSERT IGNORE INTO users (
  id,
  store_id,
  name,
  email,
  password_hash,
  role,
  photo_url,
  is_active
) VALUES
(
  1,
  1,
  'Administrador',
  'admin@invcontrol.local',
  '$2a$12$7g0YpKx0bq0m5p6a2u7Q0O4nq0w6Q0x1qQwE6b8e8qQmB3bGmPp/e',
  'admin',
  NULL,
  TRUE
),
(
  2,
  1,
  'Trabajador Demo',
  'trabajador@invcontrol.local',
  '$2a$12$C9u0fQ3q6b0mY1c8l0eR4uQyKxV2dR3d5w0hKp2y0ZbZ2qjQe1mO6',
  'employee',
  NULL,
  TRUE
);

-- =====================
-- CATEGORIES
-- =====================
INSERT IGNORE INTO categories (id, name) VALUES
(1, 'Abarrotes'),
(2, 'Bebidas'),
(3, 'Limpieza');

-- =====================
-- PRODUCTS
-- =====================
-- Unique key: (store_id, sku)
INSERT IGNORE INTO products (
  id,
  store_id,
  category_id,
  name,
  sku,
  price,
  cost,
  stock,
  stock_min,
  is_active
) VALUES
(1, 1, 1, 'Leche 1L', 'LEC-001', 28.50, 21.00, 18, 6, TRUE),
(2, 1, 2, 'Agua 600ml', 'AGU-600', 12.00, 7.00, 4, 10, TRUE),
(3, 1, 3, 'Detergente 500g', 'DET-500', 35.00, 24.00, 11, 5, TRUE);

-- =====================
-- INVENTORY MOVEMENTS
-- =====================
-- inventory_movements has no unique constraint; use INSERT with id.
-- We also include a WHERE NOT EXISTS pattern to keep it idempotent.
INSERT INTO inventory_movements (id, product_id, user_id, type, quantity, reason)
SELECT 1, 1, 1, 'IN', 18, 'Inventario inicial'
WHERE NOT EXISTS (SELECT 1 FROM inventory_movements WHERE id = 1);

INSERT INTO inventory_movements (id, product_id, user_id, type, quantity, reason)
SELECT 2, 2, 1, 'IN', 4, 'Inventario inicial'
WHERE NOT EXISTS (SELECT 1 FROM inventory_movements WHERE id = 2);

