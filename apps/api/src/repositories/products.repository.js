import { db } from '../store.js';

/**
 * Repositorio para productos (products).
 * Actúa como adaptador en memoria sobre db.products.
 * Prepara la futura migración a MySQL.
 */

/**
 * Obtiene todos los productos.
 * @returns {Array} Lista de productos
 */
export function findAll() {
  return [...db.products];
}

/**
 * Obtiene un producto por ID.
 * @param {number} id - ID del producto
 * @returns {Object|undefined} El producto o undefined si no existe
 */
export function findById(id) {
  return db.products.find((product) => product.id === Number(id));
}

/**
 * Obtiene un producto activo por ID.
 * @param {number} id - ID del producto
 * @returns {Object|undefined} El producto o undefined si no existe
 */
export function findActiveById(id) {
  return db.products.find((product) => product.id === Number(id) && product.isActive);
}

/**
 * Obtiene solo productos activos.
 * @returns {Array} Lista de productos activos
 */
export function findActive() {
  return db.products.filter((product) => product.isActive);
}

/**
 * Obtiene productos por tienda.
 * @param {number} storeId - ID de la tienda
 * @returns {Array} Lista de productos de la tienda
 */
export function findByStoreId(storeId) {
  return db.products.filter((product) => product.storeId === Number(storeId));
}

/**
 * Obtiene productos activos por tienda.
 * @param {number} storeId - ID de la tienda
 * @returns {Array} Lista de productos activos de la tienda
 */
export function findActiveByStoreId(storeId) {
  return db.products.filter((product) => 
    product.storeId === Number(storeId) && product.isActive
  );
}

/**
 * Obtiene productos con stock bajo.
 * @param {number} storeId - ID de la tienda (opcional)
 * @returns {Array} Lista de productos con stock bajo
 */
export function findLowStock(storeId = null) {
  return db.products.filter((product) => 
    product.isActive && 
    product.stock <= product.stockMin &&
    (storeId === null || product.storeId === Number(storeId))
  );
}

/**
 * Busca productos por nombre o SKU.
 * @param {string} query - Término de búsqueda
 * @returns {Array} Lista de productos que coinciden
 */
export function search(query) {
  const q = String(query || '').toLowerCase();
  return db.products.filter((product) => 
    product.isActive && 
    (product.name.toLowerCase().includes(q) || product.sku.toLowerCase().includes(q))
  );
}

/**
 * Verifica si un SKU ya existe en una tienda.
 * @param {string} sku - SKU a verificar
 * @param {number} storeId - ID de la tienda
 * @returns {boolean} True si el SKU ya existe
 */
export function skuExists(sku, storeId) {
  return db.products.some((product) => 
    product.storeId === Number(storeId) && 
    product.sku.toLowerCase() === String(sku).toLowerCase()
  );
}

/**
 * Calcula el valor total del inventario.
 * @param {number} storeId - ID de la tienda (opcional)
 * @returns {number} Valor total del inventario
 */
export function calculateInventoryValue(storeId = null) {
  return db.products
    .filter((product) => storeId === null || product.storeId === Number(storeId))
    .reduce((sum, product) => sum + product.stock * product.cost, 0);
}

/**
 * Crea un nuevo producto.
 * @param {Object} data - Datos del producto
 * @returns {Object} El producto creado
 */
export function create(data) {
  const newProduct = {
    id: nextId(),
    storeId: Number(data.storeId),
    categoryId: data.categoryId ? Number(data.categoryId) : null,
    name: String(data.name).trim(),
    sku: String(data.sku).trim(),
    price: Number(data.price),
    cost: Number(data.cost),
    stock: 0,
    stockMin: Number(data.stockMin),
    isActive: true,
    createdAt: new Date().toISOString()
  };
  db.products.push(newProduct);
  return newProduct;
}

/**
 * Actualiza un producto existente.
 * @param {number} id - ID del producto
 * @param {Object} data - Datos a actualizar
 * @returns {Object|undefined} El producto actualizado o undefined si no existe
 */
export function update(id, data) {
  const product = findById(id);
  if (!product) return undefined;

  if (data.name !== undefined) product.name = String(data.name).trim();
  if (data.sku !== undefined) product.sku = String(data.sku).trim();
  if (data.categoryId !== undefined) product.categoryId = data.categoryId ? Number(data.categoryId) : null;
  if (data.price !== undefined) product.price = Number(data.price);
  if (data.cost !== undefined) product.cost = Number(data.cost);
  if (data.stock !== undefined) product.stock = Number(data.stock);
  if (data.stockMin !== undefined) product.stockMin = Number(data.stockMin);
  if (data.isActive !== undefined) product.isActive = Boolean(data.isActive);

  return product;
}

/**
 * Elimina lógicamente un producto (is_active = false).
 * @param {number} id - ID del producto
 * @returns {boolean} True si se eliminó, false si no existe
 */
export function softDelete(id) {
  const product = findById(id);
  if (!product) return false;
  product.isActive = false;
  return true;
}

/**
 * Actualiza el stock de un producto.
 * @param {number} id - ID del producto
 * @param {number} quantity - Cantidad a sumar (positiva) o restar (negativa)
 * @returns {Object|undefined} El producto actualizado o undefined si no existe
 */
export function updateStock(id, quantity) {
  const product = findById(id);
  if (!product) return undefined;
  product.stock = product.stock + Number(quantity);
  return product;
}

/**
 * Obtiene el siguiente ID disponible.
 * @returns {number} El siguiente ID
 */
export function nextId() {
  return db.products.length ? Math.max(...db.products.map((item) => item.id)) + 1 : 1;
}

export const productsRepository = {
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
  update,
  softDelete,
  updateStock,
  nextId
};