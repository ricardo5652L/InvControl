import { db } from '../store.js';

/**
 * Repositorio para tiendas (stores).
 * Actúa como adaptador en memoria sobre db.stores.
 * Prepara la futura migración a MySQL.
 */

/**
 * Obtiene todos las tiendas.
 * @returns {Array} Lista de tiendas
 */
export function findAll() {
  return [...db.stores];
}

/**
 * Obtiene una tienda por ID.
 * @param {number} id - ID de la tienda
 * @returns {Object|undefined} La tienda o undefined si no existe
 */
export function findById(id) {
  return db.stores.find((store) => store.id === Number(id));
}

/**
 * Obtiene solo tiendas activas.
 * @returns {Array} Lista de tiendas activas
 */
export function findActive() {
  return db.stores.filter((store) => store.isActive);
}

/**
 * Obtiene una tienda por código (case-insensitive).
 * @param {string} code - Código de la tienda
 * @returns {Object|undefined} La tienda o undefined si no existe
 */
export function findByCode(code) {
  return db.stores.find((store) => store.code.toLowerCase() === String(code).toLowerCase());
}

/**
 * Crea una nueva tienda.
 * @param {Object} data - Datos de la tienda
 * @returns {Object} La tienda creada
 */
export function create(data) {
  const newStore = {
    id: nextId(),
    name: String(data.name).trim(),
    code: String(data.code).trim().toUpperCase(),
    address: data.address || '',
    phone: data.phone || '',
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
    isActive: true,
    createdAt: new Date().toISOString()
  };
  db.stores.push(newStore);
  return newStore;
}

/**
 * Actualiza una tienda existente.
 * @param {number} id - ID de la tienda
 * @param {Object} data - Datos a actualizar
 * @returns {Object|undefined} La tienda actualizada o undefined si no existe
 */
export function update(id, data) {
  const store = findById(id);
  if (!store) return undefined;

  if (data.name !== undefined) store.name = String(data.name).trim();
  if (data.code !== undefined) store.code = String(data.code).trim().toUpperCase();
  if (data.address !== undefined) store.address = data.address;
  if (data.phone !== undefined) store.phone = data.phone;
  if (data.latitude !== undefined) store.latitude = Number(data.latitude);
  if (data.longitude !== undefined) store.longitude = Number(data.longitude);
  if (data.isActive !== undefined) store.isActive = Boolean(data.isActive);

  return store;
}

/**
 * Obtiene el siguiente ID disponible.
 * @returns {number} El siguiente ID
 */
export function nextId() {
  return db.stores.length ? Math.max(...db.stores.map((item) => item.id)) + 1 : 1;
}

export const storesRepository = {
  findAll,
  findById,
  findActive,
  findByCode,
  create,
  update,
  nextId
};