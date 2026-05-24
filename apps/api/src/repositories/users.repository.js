import { db } from '../store.js';

/**
 * Repositorio para usuarios (users).
 * Actúa como adaptador en memoria sobre db.users.
 * Prepara la futura migración a MySQL.
 */

/**
 * Obtiene todos los usuarios.
 * @returns {Array} Lista de usuarios
 */
export function findAll() {
  return [...db.users];
}

/**
 * Obtiene un usuario por ID.
 * @param {number} id - ID del usuario
 * @returns {Object|undefined} El usuario o undefined si no existe
 */
export function findById(id) {
  return db.users.find((user) => user.id === Number(id));
}

/**
 * Obtiene un usuario activo por ID.
 * @param {number} id - ID del usuario
 * @returns {Object|undefined} El usuario o undefined si no existe
 */
export function findActiveById(id) {
  return db.users.find((user) => user.id === Number(id) && user.isActive);
}

/**
 * Obtiene un usuario por email (case-insensitive).
 * @param {string} email - Email del usuario
 * @returns {Object|undefined} El usuario o undefined si no existe
 */
export function findByEmail(email) {
  return db.users.find((user) => user.email.toLowerCase() === String(email).toLowerCase());
}

/**
 * Obtiene un usuario activo por email.
 * @param {string} email - Email del usuario
 * @returns {Object|undefined} El usuario o undefined si no existe
 */
export function findActiveByEmail(email) {
  return db.users.find((user) => user.email === email && user.isActive);
}

/**
 * Obtiene solo usuarios activos.
 * @returns {Array} Lista de usuarios activos
 */
export function findActive() {
  return db.users.filter((user) => user.isActive);
}

/**
 * Obtiene usuarios por tienda.
 * @param {number} storeId - ID de la tienda
 * @returns {Array} Lista de usuarios de la tienda
 */
export function findByStoreId(storeId) {
  return db.users.filter((user) => user.storeId === Number(storeId));
}

/**
 * Verifica si un email ya está registrado (excluyendo un usuario específico).
 * @param {string} email - Email a verificar
 * @param {number} excludeUserId - ID del usuario a excluir
 * @returns {boolean} True si el email ya está registrado
 */
export function emailExists(email, excludeUserId = null) {
  return db.users.some((user) => 
    user.email.toLowerCase() === String(email).toLowerCase() && 
    user.id !== excludeUserId
  );
}

/**
 * Crea un nuevo usuario.
 * @param {Object} data - Datos del usuario
 * @returns {Object} El usuario creado
 */
export function create(data) {
  const newUser = {
    id: nextId(),
    storeId: Number(data.storeId),
    name: String(data.name).trim(),
    email: String(data.email).trim().toLowerCase(),
    passwordHash: data.passwordHash,
    role: data.role || 'employee',
    photoUrl: data.photoUrl || null,
    isActive: true,
    createdAt: new Date().toISOString()
  };
  db.users.push(newUser);
  return newUser;
}

/**
 * Actualiza un usuario existente.
 * @param {number} id - ID del usuario
 * @param {Object} data - Datos a actualizar
 * @returns {Object|undefined} El usuario actualizado o undefined si no existe
 */
export function update(id, data) {
  const user = findById(id);
  if (!user) return undefined;

  if (data.name !== undefined) user.name = String(data.name).trim();
  if (data.email !== undefined) user.email = String(data.email).trim().toLowerCase();
  if (data.passwordHash !== undefined) user.passwordHash = data.passwordHash;
  if (data.role !== undefined) user.role = data.role;
  if (data.photoUrl !== undefined) user.photoUrl = data.photoUrl;
  if (data.storeId !== undefined) user.storeId = Number(data.storeId);
  if (data.isActive !== undefined) user.isActive = Boolean(data.isActive);

  return user;
}

/**
 * Elimina lógicamente un usuario (is_active = false).
 * @param {number} id - ID del usuario
 * @returns {boolean} True si se eliminó, false si no existe
 */
export function softDelete(id) {
  const user = findById(id);
  if (!user) return false;
  user.isActive = false;
  return true;
}

/**
 * Obtiene el siguiente ID disponible.
 * @returns {number} El siguiente ID
 */
export function nextId() {
  return db.users.length ? Math.max(...db.users.map((item) => item.id)) + 1 : 1;
}

export const usersRepository = {
  findAll,
  findById,
  findActiveById,
  findByEmail,
  findActiveByEmail,
  findActive,
  findByStoreId,
  emailExists,
  create,
  update,
  softDelete,
  nextId
};