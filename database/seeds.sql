USE invcontrol;

INSERT INTO stores (name, code, address, phone, latitude, longitude) VALUES
('Sucursal Centro', 'CENTRO', 'Balancan, Tabasco, Mexico', '9340000000', 17.8008000, -91.5364000);


INSERT INTO categories (name) VALUES ('Abarrotes'), ('Bebidas'), ('Limpieza');

INSERT INTO products (store_id, category_id, name, sku, price, cost, stock, stock_min) VALUES
(1, 1, 'Leche 1L', 'LEC-001', 28.50, 21.00, 18, 6),
(1, 2, 'Agua 600ml', 'AGU-600', 12.00, 7.00, 4, 10),
(1, 3, 'Detergente 500g', 'DET-500', 35.00, 24.00, 11, 5);
