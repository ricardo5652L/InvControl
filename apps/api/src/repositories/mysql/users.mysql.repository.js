import { getPool } from '../../database.js';

/**
 * Repositorio MySQL para usuarios (users).
 * Interfaz equivalente al repositorio en memoria.
 * Se activará en etapas posteriores cuando DATA_SOURCE=mysql.
 */

/**
 * Mapea resultados de MySQL a camelCase
 * @param {Object} row - Fila de MySQL
 * @returns {Object} Objeto con propiedades en camelCase
 */
function mapUserRow(row) {
  return {
    id: row.id,
    storeId: row.store_id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    photoUrl: row.photo_url || null,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at
  };
}

/**
 * Obtiene todos los usuarios
 * @returns {Promise<Array>} Lista de usuarios
 */
export async function findAll() {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM users ORDER BY id');
  return rows.map(mapUserRow);
}

/**
 * Obtiene un usuario por ID
 * @param {number} id - ID del usuario
 * @returns {Promise<Object|null>} El usuario o null si no existe
 */
export async function findById(id) {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows.length ? mapUserRow(rows[0]) : null;
}

/**
 * Obtiene un usuario activo por ID
 * @param {number} id - ID del usuario
 * @returns {Promise<Object|null>} El usuario o null si no existe o no está activo
 */
export async function findActiveById(id) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE id = ? AND is_active = TRUE',
    [id]
  );
  return rows.length ? mapUserRow(rows[0]) : null;
}

/**
 * Obtiene un usuario por email (case-insensitive)
 * @param {string} email - Email del usuario
 * @returns {Promise<Object|null>} El usuario o null si no existe
 */
export async function findByEmail(email) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE LOWER(email) = LOWER(?)',
    [email]
  );
  return rows.length ? mapUserRow(rows[0]) : null;
}

/**
 * Obtiene un usuario activo por email
 * @param {string} email - Email del usuario
 * @returns {Promise<Object|null>} El usuario o null si no existe o no está activo
 */
export async function findActiveByEmail(email) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND is_active = TRUE',
    [email]
  );
  return rows.length ? mapUserRow(rows[0]) : null;
}

/**
 * Obtiene solo usuarios activos
 * @returns {Promise<Array>} Lista de usuarios activos
 */
export async function findActive() {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE is_active = TRUE ORDER BY id'
  );
  return rows.map(mapUserRow);
}

/**
 * Obtiene usuarios por tienda
 * @param {number} storeId - ID de la tienda
 * @returns {Promise<Array>} Lista de usuarios de la tienda
 */
export async function findByStoreId(storeId) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE store_id = ? ORDER BY id',
    [storeId]
  );
  return rows.map(mapUserRow);
}

/**
 * Verifica si un email ya está registrado (excluyendo un usuario específico)
 * @param {string} email - Email a verificar
 * @param {number} excludeUserId - ID del usuario a excluir
 * @returns {Promise<boolean>} True si el email ya está registrado
 */
export async function emailExists(email, excludeUserId = null) {
  const pool = getPool();
  let query = 'SELECT 1 FROM users WHERE LOWER(email) = LOWER(?)';
  const values = [email];

  if (excludeUserId !== null) {
    query += ' AND id != ?';
    values.push(excludeUserId);
  }

  const [rows] = await pool.query(query, values);
  return rows.length > 0;
}

/**
 * Crea un nuevo usuario
 * @param {Object} data - Datos del usuario
 * @returns {Promise<Object>} El usuario creado con ID
 */
export async function create(data) {
  const pool = getPool();
  const [result] = await pool.query(
    'INSERT INTO users (store_id, name, email, password_hash, role, photo_url) VALUES (?, ?, ?, ?, ?, ?)',
    [
      Number(data.storeId),
      String(data.name).trim(),
      String(data.email).trim().toLowerCase(),
      data.passwordHash,
      data.role || 'employee',
      data.photoUrl || null
    ]
  );

  return findById(result.insertId);
}

/**
 * Actualiza un usuario existente
 * @param {number} id - ID del usuario
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object|null>} El usuario actualizado o null si no existe
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
  if (data.email !== undefined) {
    updates.push('email = ?');
    values.push(String(data.email).trim().toLowerCase());
  }
  if (data.passwordHash !== undefined) {
    updates.push('password_hash = ?');
    values.push(data.passwordHash);
  }
  if (data.role !== undefined) {
    updates.push('role = ?');
    values.push(data.role);
  }
  if (data.photoUrl !== undefined) {
    updates.push('photo_url = ?');
    values.push(data.photoUrl || null);
  }
  if (data.storeId !== undefined) {
    updates.push('store_id = ?');
    values.push(Number(data.storeId));
  }
  if (data.isActive !== undefined) {
    updates.push('is_active = ?');
    values.push(Boolean(data.isActive));
  }

  if (updates.length === 0) return existing;

  values.push(id);
  const pool = getPool();
  await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

  return findById(id);
}

/**
 * Elimina lógicamente un usuario (is_active = false)
 * @param {number} id - ID del usuario
 * @returns {Promise<boolean>} True si se eliminó, false si no existe
 */
export async function softDelete(id) {
  const existing = await findById(id);
  if (!existing) return false;

  const pool = getPool();
  await pool.query('UPDATE users SET is_active = FALSE WHERE id = ?', [id]);
  return true;
}

export const usersMysqlRepository = {
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
  softDelete
};
