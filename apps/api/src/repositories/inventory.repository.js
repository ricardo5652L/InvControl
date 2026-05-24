import { db } from '../store.js';

/**
 * Repositorio para movimientos de inventario (inventory_movements).
 * Actúa como adaptador en memoria sobre db.inventoryMovements.
 * Prepara la futura migración a MySQL.
 */

/**
 * Obtiene todos los movimientos de inventario.
 * @returns {Array} Lista de movimientos
 */
export function findAll() {
  return [...db.inventoryMovements];
}

/**
 * Obtiene un movimiento por ID.
 * @param {number} id - ID del movimiento
 * @returns {Object|undefined} El movimiento o undefined si no existe
 */
export function findById(id) {
  return db.inventoryMovements.find((movement) => movement.id === Number(id));
}

/**
 * Obtiene movimientos por producto.
 * @param {number} productId - ID del producto
 * @returns {Array} Lista de movimientos del producto
 */
export function findByProductId(productId) {
  return db.inventoryMovements.filter((movement) => 
    movement.productId === Number(productId)
  );
}

/**
 * Obtiene movimientos por usuario.
 * @param {number} userId - ID del usuario
 * @returns {Array} Lista de movimientos del usuario
 */
export function findByUserId(userId) {
  return db.inventoryMovements.filter((movement) => 
    movement.userId === Number(userId)
  );
}

/**
 * Obtiene movimientos por tipo.
 * @param {string} type - Tipo de movimiento (IN, OUT, ADJUSTMENT)
 * @returns {Array} Lista de movimientos del tipo
 */
export function findByType(type) {
  return db.inventoryMovements.filter((movement) => movement.type === type);
}

/**
 * Obtiene movimientos recientes (últimos N).
 * @param {number} limit - Cantidad de movimientos a devolver
 * @returns {Array} Lista de movimientos recientes
 */
export function findRecent(limit = 10) {
  return [...db.inventoryMovements]
    .reverse()
    .slice(0, limit);
}

/**
 * Crea un nuevo movimiento de inventario.
 * @param {Object} data - Datos del movimiento
 * @returns {Object} El movimiento creado
 */
export function create(data) {
  const newMovement = {
    id: nextId(),
    productId: Number(data.productId),
    userId: Number(data.userId),
    type: data.type,
    quantity: Number(data.quantity),
    reason: data.reason || null,
    createdAt: data.createdAt || new Date().toISOString()
  };
  db.inventoryMovements.push(newMovement);
  return newMovement;
}

/**
 * Obtiene el siguiente ID disponible.
 * @returns {number} El siguiente ID
 */
export function nextId() {
  return db.inventoryMovements.length 
    ? Math.max(...db.inventoryMovements.map((item) => item.id)) + 1 
    : 1;
}

export const inventoryRepository = {
  findAll,
  findById,
  findByProductId,
  findByUserId,
  findByType,
  findRecent,
  create,
  nextId
};