import { getPool } from '../../database.js';

/**
 * Repositorio MySQL para productos (products).
 * Interfaz equivalente al repositorio en memoria.
 * Se activará en etapas posteriores cuando DATA_SOURCE=mysql.
 */

/**
 * Mapea resultados de MySQL a camelCase
 * @param {Object} row - Fila de MySQL
 * @returns {Object} Objeto con propiedades en camelCase
 */
function mapProductRow(row) {
  return {
    id: row.id,
    storeId: row.store_id,
    categoryId: row.category_id || null,
    name: row.name,
    sku: row.sku,
    price: Number(row.price),
    cost: Number(row.cost),
    stock: row.stock,
    stockMin: row.stock_min,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at
  };
}

/**
 * Obtiene todos los productos
 * @returns {Promise<Array>} Lista de productos
 */
export async function findAll() {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM products ORDER BY id');
  return rows.map(mapProductRow);
}

/**
 * Obtiene un producto por ID
 * @param {number} id - ID del producto
 * @returns {Promise<Object|null>} El producto o null si no existe
 */
export async function findById(id) {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
  return rows.length ? mapProductRow(rows[0]) : null;
}

/**
 * Obtiene un producto activo por ID
 * @param {number} id - ID del producto
 * @returns {Promise<Object|null>} El producto o null si no existe o no está activo
 */
export async function findActiveById(id) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM products WHERE id = ? AND is_active = TRUE',
    [id]
  );
  return rows.length ? mapProductRow(rows[0]) : null;
}

/**
 * Obtiene solo productos activos
 * @returns {Promise<Array>} Lista de productos activos
 */
export async function findActive() {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM products WHERE is_active = TRUE ORDER BY id'
  );
  return rows.map(mapProductRow);
}

/**
 * Obtiene productos por tienda
 * @param {number} storeId - ID de la tienda
 * @returns {Promise<Array>} Lista de productos de la tienda
 */
export async function findByStoreId(storeId) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM products WHERE store_id = ? ORDER BY id',
    [storeId]
  );
  return rows.map(mapProductRow);
}

/**
 * Obtiene productos activos por tienda
 * @param {number} storeId - ID de la tienda
 * @returns {Promise<Array>} Lista de productos activos de la tienda
 */
export async function findActiveByStoreId(storeId) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM products WHERE store_id = ? AND is_active = TRUE ORDER BY id',
    [storeId]
  );
  return rows.map(mapProductRow);
}

/**
 * Obtiene productos con stock bajo
 * @param {number} storeId - ID de la tienda (opcional)
 * @returns {Promise<Array>} Lista de productos con stock bajo
 */
export async function findLowStock(storeId = null) {
  const pool = getPool();
  let query = 'SELECT * FROM products WHERE is_active = TRUE AND stock <= stock_min';
  const values = [];

  if (storeId !== null) {
    query += ' AND store_id = ?';
    values.push(storeId);
  }

  query += ' ORDER BY id';
  const [rows] = await pool.query(query, values);
  return rows.map(mapProductRow);
}

/**
 * Busca productos por nombre o SKU
 * @param {string} query - Término de búsqueda
 * @returns {Promise<Array>} Lista de productos que coinciden
 */
export async function search(query) {
  const pool = getPool();
  const searchTerm = `%${query}%`;
  const [rows] = await pool.query(
    'SELECT * FROM products WHERE is_active = TRUE AND (LOWER(name) LIKE LOWER(?) OR LOWER(sku) LIKE LOWER(?)) ORDER BY id',
    [searchTerm, searchTerm]
  );
  return rows.map(mapProductRow);
}

/**
 * Verifica si un SKU ya existe en una tienda
 * @param {string} sku - SKU a verificar
 * @param {number} storeId - ID de la tienda
 * @returns {Promise<boolean>} True si el SKU ya existe
 */
export async function skuExists(sku, storeId) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT 1 FROM products WHERE store_id = ? AND LOWER(sku) = LOWER(?)',
    [storeId, sku]
  );
  return rows.length > 0;
}

/**
 * Calcula el valor total del inventario
 * @param {number} storeId - ID de la tienda (opcional)
 * @returns {Promise<number>} Valor total del inventario
 */
export async function calculateInventoryValue(storeId = null) {
  const pool = getPool();
  let query = 'SELECT SUM(stock * cost) as total FROM products';
  const values = [];

  if (storeId !== null) {
    query += ' WHERE store_id = ?';
    values.push(storeId);
  }

  const [rows] = await pool.query(query, values);
  return Number(rows[0]?.total || 0);
}

/**
 * Crea un nuevo producto
 * @param {Object} data - Datos del producto
 * @returns {Promise<Object>} El producto creado con ID
 */
export async function create(data) {
  const pool = getPool();
  const [result] = await pool.query(
    'INSERT INTO products (store_id, category_id, name, sku, price, cost, stock_min) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      Number(data.storeId),
      data.categoryId ? Number(data.categoryId) : null,
      String(data.name).trim(),
      String(data.sku).trim(),
      Number(data.price),
      Number(data.cost),
      Number(data.stockMin)
    ]
  );

  return findById(result.insertId);
}

/**
 * Actualiza un producto existente
 * @param {number} id - ID del producto
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object|null>} El producto actualizado o null si no existe
 */
export async function update(id, data) {
  const existing = await findById(id);
  if (!existing) return null;

  const updates = [];
  const values = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(String(data.name).trim());
  }
  if (data.sku !== undefined) {
    updates.push('sku = ?');
    values.push(String(data.sku).trim());
  }
  if (data.categoryId !== undefined) {
    updates.push('category_id = ?');
    values.push(data.categoryId ? Number(data.categoryId) : null);
  }
  if (data.price !== undefined) {
    updates.push('price = ?');
    values.push(Number(data.price));
  }
  if (data.cost !== undefined) {
    updates.push('cost = ?');
    values.push(Number(data.cost));
  }
  if (data.stock !== undefined) {
    updates.push('stock = ?');
    values.push(Number(data.stock));
  }
  if (data.stockMin !== undefined) {
    updates.push('stock_min = ?');
    values.push(Number(data.stockMin));
  }
  if (data.isActive !== undefined) {
    updates.push('is_active = ?');
    values.push(Boolean(data.isActive));
  }

  if (updates.length === 0) return existing;

  values.push(id);
  const pool = getPool();
  await pool.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, values);

  return findById(id);
}

export const productsMysqlRepository = {
  findAll,
  findById,
  findActiveById,
  findActive,
  findByStoreId,
  findActiveByStoreId,
  findLowStock,
  search,
  skuExists,
  calculateInventoryValue,
  create,
  update
};
