CREATE DATABASE IF NOT EXISTS invcontrol CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE invcontrol;

CREATE TABLE stores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  code VARCHAR(30) NOT NULL UNIQUE,
  address VARCHAR(255),
  phone VARCHAR(30),
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_stores_code (code),
  INDEX idx_stores_active (is_active)
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  store_id INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','employee') NOT NULL DEFAULT 'employee',
  photo_url TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_store FOREIGN KEY (store_id) REFERENCES stores(id),
  INDEX idx_users_store (store_id),
  INDEX idx_users_role (role)
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  store_id INT NOT NULL,
  category_id INT NULL,
  name VARCHAR(150) NOT NULL,
  sku VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  stock INT NOT NULL DEFAULT 0,
  stock_min INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_store FOREIGN KEY (store_id) REFERENCES stores(id),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id),
  UNIQUE KEY uq_products_store_sku (store_id, sku),
  INDEX idx_products_store (store_id),
  INDEX idx_products_category (category_id),
  INDEX idx_products_stock (stock)
);

CREATE TABLE inventory_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  type ENUM('IN','OUT','ADJUSTMENT') NOT NULL,
  quantity INT NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mov_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT fk_mov_user FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_mov_product (product_id),
  INDEX idx_mov_type (type),
  INDEX idx_mov_created (created_at)
);

CREATE TABLE sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  store_id INT NOT NULL,
  user_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  payment_method ENUM('cash','card','transfer') NOT NULL DEFAULT 'cash',
  status ENUM('completed','cancelled') NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sales_store FOREIGN KEY (store_id) REFERENCES stores(id),
  CONSTRAINT fk_sales_user FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_sales_store (store_id),
  INDEX idx_sales_user (user_id),
  INDEX idx_sales_created (created_at)
);

CREATE TABLE sale_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_items_sale FOREIGN KEY (sale_id) REFERENCES sales(id),
  CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id),
  INDEX idx_items_sale (sale_id),
  INDEX idx_items_product (product_id)
);
