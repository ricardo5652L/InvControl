import { getPool } from '../../database.js';

/**
 * Repositorio MySQL para movimientos de inventario (inventory_movements).
 * Interfaz equivalente al repositorio en memoria.
 * Se activará en etapas posteriores cuando DATA_SOURCE=mysql.
 */

/**
 * Mapea resultados de MySQL a camelCase
 * @param {Object} row - Fila de MySQL
 * @returns {Object} Objeto con propiedades en camelCase
 */
function mapInventoryMovementRow(row) {
  return {
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    type: row.type,
    quantity: row.quantity,
    reason: row.reason || null,
    createdAt: row.created_at
  };
}

/**
 * Obtiene todos los movimientos de inventario
 * @returns {Promise<Array>} Lista de movimientos
 */
export async function findAll() {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM inventory_movements ORDER BY id');
  return rows.map(mapInventoryMovementRow);
}

/**
 * Obtiene un movimiento por ID
 * @param {number} id - ID del movimiento
 * @returns {Promise<Object|null>} El movimiento o null si no existe
 */
export async function findById(id) {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM inventory_movements WHERE id = ?', [id]);
  return rows.length ? mapInventoryMovementRow(rows[0]) : null;
}

/**
 * Obtiene movimientos por producto
 * @param {number} productId - ID del producto
 * @returns {Promise<Array>} Lista de movimientos del producto
 */
export async function findByProductId(productId) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM inventory_movements WHERE product_id = ? ORDER BY id',
    [productId]
  );
  return rows.map(mapInventoryMovementRow);
}

/**
 * Obtiene movimientos por usuario
 * @param {number} userId - ID del usuario
 * @returns {Promise<Array>} Lista de movimientos del usuario
 */
export async function findByUserId(userId) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM inventory_movements WHERE user_id = ? ORDER BY id',
    [userId]
  );
  return rows.map(mapInventoryMovementRow);
}

/**
 * Obtiene movimientos por tipo
 * @param {string} type - Tipo de movimiento (IN, OUT, ADJUSTMENT)
 * @returns {Promise<Array>} Lista de movimientos del tipo
 */
export async function findByType(type) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM inventory_movements WHERE type = ? ORDER BY id',
    [type]
  );
  return rows.map(mapInventoryMovementRow);
}

/**
 * Obtiene movimientos recientes (últimos N)
 * @param {number} limit - Cantidad de movimientos a devolver
 * @returns {Promise<Array>} Lista de movimientos recientes
 */
export async function findRecent(limit = 10) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM inventory_movements ORDER BY created_at DESC LIMIT ?',
    [limit]
  );
  return rows.map(mapInventoryMovementRow);
}

/**
 * Crea un nuevo movimiento de inventario
 * @param {Object} data - Datos del movimiento
 * @returns {Promise<Object>} El movimiento creado con ID
 */
export async function create(data) {
  const pool = getPool();
  const [result] = await pool.query(
    'INSERT INTO inventory_movements (product_id, user_id, type, quantity, reason) VALUES (?, ?, ?, ?, ?)',
    [
      Number(data.productId),
      Number(data.userId),
      data.type,
      Number(data.quantity),
      data.reason || null
    ]
  );

  return findById(result.insertId);
}

export const inventoryMysqlRepository = {
  findAll,
  findById,
  findByProductId,
  findByUserId,
  findByType,
  findRecent,
  create
};
