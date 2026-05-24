import { getPool } from '../../database.js';

/**
 * Repositorio MySQL para ventas (sales) y elementos de venta (sale_items).
 * Interfaz equivalente al repositorio en memoria.
 * Se activará en etapas posteriores cuando DATA_SOURCE=mysql.
 */

/**
 * Mapea resultados de MySQL para sales a camelCase
 * @param {Object} row - Fila de MySQL
 * @returns {Object} Objeto con propiedades en camelCase
 */
function mapSaleRow(row) {
  return {
    id: row.id,
    storeId: row.store_id,
    userId: row.user_id,
    total: Number(row.total),
    paymentMethod: row.payment_method,
    status: row.status,
    createdAt: row.created_at
  };
}

/**
 * Mapea resultados de MySQL para sale_items a camelCase
 * @param {Object} row - Fila de MySQL
 * @returns {Object} Objeto con propiedades en camelCase
 */
function mapSaleItemRow(row) {
  return {
    id: row.id,
    saleId: row.sale_id,
    productId: row.product_id,
    quantity: row.quantity,
    unitPrice: Number(row.unit_price),
    subtotal: Number(row.subtotal)
  };
}

/**
 * Obtiene todas las ventas
 * @returns {Promise<Array>} Lista de ventas
 */
export async function findAllSales() {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM sales ORDER BY id');
  return rows.map(mapSaleRow);
}

/**
 * Obtiene una venta por ID
 * @param {number} id - ID de la venta
 * @returns {Promise<Object|null>} La venta o null si no existe
 */
export async function findSaleById(id) {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM sales WHERE id = ?', [id]);
  return rows.length ? mapSaleRow(rows[0]) : null;
}

/**
 * Obtiene ventas por tienda
 * @param {number} storeId - ID de la tienda
 * @returns {Promise<Array>} Lista de ventas de la tienda
 */
export async function findSalesByStoreId(storeId) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM sales WHERE store_id = ? ORDER BY id',
    [storeId]
  );
  return rows.map(mapSaleRow);
}

/**
 * Obtiene ventas por usuario
 * @param {number} userId - ID del usuario
 * @returns {Promise<Array>} Lista de ventas del usuario
 */
export async function findSalesByUserId(userId) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM sales WHERE user_id = ? ORDER BY id',
    [userId]
  );
  return rows.map(mapSaleRow);
}

/**
 * Obtiene ventas por método de pago
 * @param {string} paymentMethod - Método de pago
 * @returns {Promise<Array>} Lista de ventas con ese método
 */
export async function findSalesByPaymentMethod(paymentMethod) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM sales WHERE payment_method = ? ORDER BY id',
    [paymentMethod]
  );
  return rows.map(mapSaleRow);
}

/**
 * Obtiene ventas entre fechas
 * @param {Date} fromDate - Fecha de inicio
 * @param {Date} toDate - Fecha de fin
 * @returns {Promise<Array>} Lista de ventas en el rango
 */
export async function findSalesByDateRange(fromDate, toDate) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM sales WHERE created_at BETWEEN ? AND ? ORDER BY id',
    [fromDate, toDate]
  );
  return rows.map(mapSaleRow);
}

/**
 * Obtiene el total de ventas
 * @param {number} storeId - ID de la tienda (opcional)
 * @returns {Promise<number>} Total de ventas
 */
export async function calculateTotalSales(storeId = null) {
  const pool = getPool();
  let query = 'SELECT SUM(total) as total FROM sales';
  const values = [];

  if (storeId !== null) {
    query += ' WHERE store_id = ?';
    values.push(storeId);
  }

  const [rows] = await pool.query(query, values);
  return Number(rows[0]?.total || 0);
}

/**
 * Obtiene el total de ventas de hoy
 * @param {number} storeId - ID de la tienda (opcional)
 * @returns {Promise<number>} Total de ventas de hoy
 */
export async function calculateTodaySales(storeId = null) {
  const pool = getPool();
  let query = 'SELECT SUM(total) as total FROM sales WHERE DATE(created_at) = CURDATE()';
  const values = [];

  if (storeId !== null) {
    query += ' AND store_id = ?';
    values.push(storeId);
  }

  const [rows] = await pool.query(query, values);
  return Number(rows[0]?.total || 0);
}

/**
 * Obtiene la cantidad de ventas de hoy
 * @param {number} storeId - ID de la tienda (opcional)
 * @returns {Promise<number>} Cantidad de ventas de hoy
 */
export async function countTodaySales(storeId = null) {
  const pool = getPool();
  let query = 'SELECT COUNT(*) as count FROM sales WHERE DATE(created_at) = CURDATE()';
  const values = [];

  if (storeId !== null) {
    query += ' AND store_id = ?';
    values.push(storeId);
  }

  const [rows] = await pool.query(query, values);
  return rows[0]?.count || 0;
}

/**
 * Obtiene todos los elementos de venta
 * @returns {Promise<Array>} Lista de elementos de venta
 */
export async function findAllSaleItems() {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM sale_items ORDER BY id');
  return rows.map(mapSaleItemRow);
}

/**
 * Obtiene elementos de una venta específica
 * @param {number} saleId - ID de la venta
 * @returns {Promise<Array>} Lista de elementos de la venta
 */
export async function findSaleItemsBySaleId(saleId) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM sale_items WHERE sale_id = ? ORDER BY id',
    [saleId]
  );
  return rows.map(mapSaleItemRow);
}

/**
 * Obtiene elementos por producto
 * @param {number} productId - ID del producto
 * @returns {Promise<Array>} Lista de elementos del producto
 */
export async function findSaleItemsByProductId(productId) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM sale_items WHERE product_id = ? ORDER BY id',
    [productId]
  );
  return rows.map(mapSaleItemRow);
}

/**
 * Obtiene el total de items vendidos
 * @param {Array} saleIds - Lista de IDs de ventas a considerar
 * @returns {Promise<number>} Total de items vendidos
 */
export async function countItemsSold(saleIds = null) {
  const pool = getPool();
  let query = 'SELECT SUM(quantity) as total FROM sale_items';
  const values = [];

  if (saleIds !== null && saleIds.length > 0) {
    const placeholders = saleIds.map(() => '?').join(',');
    query += ` WHERE sale_id IN (${placeholders})`;
    values.push(...saleIds);
  }

  const [rows] = await pool.query(query, values);
  return Number(rows[0]?.total || 0);
}

/**
 * Crea una nueva venta
 * @param {Object} data - Datos de la venta
 * @returns {Promise<Object>} La venta creada con ID
 */
export async function createSale(data) {
  const pool = getPool();
  const [result] = await pool.query(
    'INSERT INTO sales (store_id, user_id, total, payment_method, status) VALUES (?, ?, ?, ?, ?)',
    [
      Number(data.storeId),
      Number(data.userId),
      Number(data.total),
      data.paymentMethod || 'cash',
      data.status || 'completed'
    ]
  );

  return findSaleById(result.insertId);
}

/**
 * Crea un nuevo elemento de venta
 * @param {Object} data - Datos del elemento
 * @returns {Promise<Object>} El elemento creado con ID
 */
export async function createSaleItem(data) {
  const pool = getPool();
  const [result] = await pool.query(
    'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
    [
      Number(data.saleId),
      Number(data.productId),
      Number(data.quantity),
      Number(data.unitPrice),
      Number(data.subtotal)
    ]
  );

  return findSaleItemById(result.insertId);
}

/**
 * Obtiene un elemento de venta por ID
 * @param {number} id - ID del elemento
 * @returns {Promise<Object|null>} El elemento o null si no existe
 */
export async function findSaleItemById(id) {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM sale_items WHERE id = ?', [id]);
  return rows.length ? mapSaleItemRow(rows[0]) : null;
}

export const salesMysqlRepository = {
  findAllSales,
  findSaleById,
  findSalesByStoreId,
  findSalesByUserId,
  findSalesByPaymentMethod,
  findSalesByDateRange,
  calculateTotalSales,
  calculateTodaySales,
  countTodaySales,
  findAllSaleItems,
  findSaleItemsBySaleId,
  findSaleItemsByProductId,
  countItemsSold,
  createSale,
  createSaleItem,
  findSaleItemById
};
