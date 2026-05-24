import { db } from '../store.js';

/**
 * Repositorio para ventas (sales) y elementos de venta (sale_items).
 * Actúa como adaptador en memoria sobre db.sales y db.saleItems.
 * Prepara la futura migración a MySQL.
 */

/**
 * Obtiene todas las ventas.
 * @returns {Array} Lista de ventas
 */
export function findAllSales() {
  return [...db.sales];
}

/**
 * Obtiene una venta por ID.
 * @param {number} id - ID de la venta
 * @returns {Object|undefined} La venta o undefined si no existe
 */
export function findSaleById(id) {
  return db.sales.find((sale) => sale.id === Number(id));
}

/**
 * Obtiene ventas por tienda.
 * @param {number} storeId - ID de la tienda
 * @returns {Array} Lista de ventas de la tienda
 */
export function findSalesByStoreId(storeId) {
  return db.sales.filter((sale) => sale.storeId === Number(storeId));
}

/**
 * Obtiene ventas por usuario.
 * @param {number} userId - ID del usuario
 * @returns {Array} Lista de ventas del usuario
 */
export function findSalesByUserId(userId) {
  return db.sales.filter((sale) => sale.userId === Number(userId));
}

/**
 * Obtiene ventas por método de pago.
 * @param {string} paymentMethod - Método de pago
 * @returns {Array} Lista de ventas con ese método
 */
export function findSalesByPaymentMethod(paymentMethod) {
  return db.sales.filter((sale) => sale.paymentMethod === paymentMethod);
}

/**
 * Obtiene ventas entre fechas.
 * @param {Date} fromDate - Fecha de inicio
 * @param {Date} toDate - Fecha de fin
 * @returns {Array} Lista de ventas en el rango
 */
export function findSalesByDateRange(fromDate, toDate) {
  return db.sales.filter((sale) => {
    const date = new Date(sale.createdAt);
    return (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
  });
}

/**
 * Obtiene el total de ventas.
 * @param {number} storeId - ID de la tienda (opcional)
 * @returns {number} Total de ventas
 */
export function calculateTotalSales(storeId = null) {
  return db.sales
    .filter((sale) => storeId === null || sale.storeId === Number(storeId))
    .reduce((sum, sale) => sum + sale.total, 0);
}

/**
 * Obtiene el total de ventas de hoy.
 * @param {number} storeId - ID de la tienda (opcional)
 * @returns {number} Total de ventas de hoy
 */
export function calculateTodaySales(storeId = null) {
  const today = new Date().toISOString().slice(0, 10);
  return db.sales
    .filter((sale) => 
      sale.createdAt.slice(0, 10) === today &&
      (storeId === null || sale.storeId === Number(storeId))
    )
    .reduce((sum, sale) => sum + sale.total, 0);
}

/**
 * Obtiene la cantidad de ventas de hoy.
 * @param {number} storeId - ID de la tienda (opcional)
 * @returns {number} Cantidad de ventas de hoy
 */
export function countTodaySales(storeId = null) {
  const today = new Date().toISOString().slice(0, 10);
  return db.sales.filter((sale) => 
    sale.createdAt.slice(0, 10) === today &&
    (storeId === null || sale.storeId === Number(storeId))
  ).length;
}

/**
 * Obtiene todos los elementos de venta.
 * @returns {Array} Lista de elementos de venta
 */
export function findAllSaleItems() {
  return [...db.saleItems];
}

/**
 * Obtiene elementos de una venta específica.
 * @param {number} saleId - ID de la venta
 * @returns {Array} Lista de elementos de la venta
 */
export function findSaleItemsBySaleId(saleId) {
  return db.saleItems.filter((item) => item.saleId === Number(saleId));
}

/**
 * Obtiene elementos por producto.
 * @param {number} productId - ID del producto
 * @returns {Array} Lista de elementos del producto
 */
export function findSaleItemsByProductId(productId) {
  return db.saleItems.filter((item) => item.productId === Number(productId));
}

/**
 * Obtiene el total de items vendidos.
 * @param {Array} saleIds - Lista de IDs de ventas a considerar
 * @returns {number} Total de items vendidos
 */
export function countItemsSold(saleIds = null) {
  return db.saleItems
    .filter((item) => saleIds === null || saleIds.includes(item.saleId))
    .reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Crea una nueva venta.
 * @param {Object} data - Datos de la venta
 * @returns {Object} La venta creada
 */
export function createSale(data) {
  const newSale = {
    id: nextSaleId(),
    storeId: Number(data.storeId),
    userId: Number(data.userId),
    total: Number(data.total),
    paymentMethod: data.paymentMethod || 'cash',
    status: data.status || 'completed',
    createdAt: data.createdAt || new Date().toISOString()
  };
  db.sales.push(newSale);
  return newSale;
}

/**
 * Crea un nuevo elemento de venta.
 * @param {Object} data - Datos del elemento
 * @returns {Object} El elemento creado
 */
export function createSaleItem(data) {
  const newItem = {
    id: nextSaleItemId(),
    saleId: Number(data.saleId),
    productId: Number(data.productId),
    quantity: Number(data.quantity),
    unitPrice: Number(data.unitPrice),
    subtotal: Number(data.subtotal)
  };
  db.saleItems.push(newItem);
  return newItem;
}

/**
 * Obtiene el siguiente ID disponible para ventas.
 * @returns {number} El siguiente ID
 */
export function nextSaleId() {
  return db.sales.length ? Math.max(...db.sales.map((item) => item.id)) + 1 : 1;
}

/**
 * Obtiene el siguiente ID disponible para elementos de venta.
 * @returns {number} El siguiente ID
 */
export function nextSaleItemId() {
  return db.saleItems.length ? Math.max(...db.saleItems.map((item) => item.id)) + 1 : 1;
}

export const salesRepository = {
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
  nextSaleId,
  nextSaleItemId
};