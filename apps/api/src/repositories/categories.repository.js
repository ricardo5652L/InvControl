import { db } from '../store.js';

/**
 * Repositorio para categorías (categories).
 * Actúa como adaptador en memoria sobre db.categories.
 * Prepara la futura migración a MySQL.
 */

/**
 * Obtiene todas las categorías.
 * @returns {Array} Lista de categorías
 */
export function findAll() {
  return [...db.categories];
}

/**
 * Obtiene una categoría por ID.
 * @param {number} id - ID de la categoría
 * @returns {Object|undefined} La categoría o undefined si no existe
 */
export function findById(id) {
  return db.categories.find((category) => category.id === Number(id));
}

/**
 * Obtiene una categoría por nombre (case-insensitive).
 * @param {string} name - Nombre de la categoría
 * @returns {Object|undefined} La categoría o undefined si no existe
 */
export function findByName(name) {
  return db.categories.find((category) => 
    category.name.toLowerCase() === String(name).toLowerCase()
  );
}

/**
 * Crea una nueva categoría.
 * @param {Object} data - Datos de la categoría
 * @returns {Object} La categoría creada
 */
export function create(data) {
  const newCategory = {
    id: nextId(),
    name: String(data.name).trim()
  };
  db.categories.push(newCategory);
  return newCategory;
}

/**
 * Obtiene el siguiente ID disponible.
 * @returns {number} El siguiente ID
 */
export function nextId() {
  return db.categories.length ? Math.max(...db.categories.map((item) => item.id)) + 1 : 1;
}

export const categoriesRepository = {
  findAll,
  findById,
  findByName,
  create,
  nextId
};