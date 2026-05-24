import { getPool } from '../../database.js';

/**
 * Repositorio MySQL para tiendas (stores).
 * Interfaz equivalente al repositorio en memoria.
 * Se activará en etapas posteriores cuando DATA_SOURCE=mysql.
 */

/**
 * Mapea resultados de MySQL a camelCase
 * @param {Object} row - Fila de MySQL
 * @returns {Object} Objeto con propiedades en camelCase
 */
function mapStoreRow(row) {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    address: row.address || null,
    phone: row.phone || null,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at
  };
}

/**
 * Obtiene todas las tiendas
 * @returns {Promise<Array>} Lista de tiendas
 */
export async function findAll() {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM stores ORDER BY id');
  return rows.map(mapStoreRow);
}

/**
 * Obtiene una tienda por ID
 * @param {number} id - ID de la tienda
 * @returns {Promise<Object|null>} La tienda o null si no existe
 */
export async function findById(id) {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM stores WHERE id = ?', [id]);
  return rows.length ? mapStoreRow(rows[0]) : null;
}

/**
 * Obtiene solo tiendas activas
 * @returns {Promise<Array>} Lista de tiendas activas
 */
export async function findActive() {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM stores WHERE is_active = TRUE ORDER BY id'
  );
  return rows.map(mapStoreRow);
}

/**
 * Obtiene una tienda por código (case-insensitive)
 * @param {string} code - Código de la tienda
 * @returns {Promise<Object|null>} La tienda o null si no existe
 */
export async function findByCode(code) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM stores WHERE UPPER(code) = UPPER(?)',
    [code]
  );
  return rows.length ? mapStoreRow(rows[0]) : null;
}

/**
 * Crea una nueva tienda
 * @param {Object} data - Datos de la tienda
 * @returns {Promise<Object>} La tienda creada con ID
 */
export async function create(data) {
  const pool = getPool();
  const [result] = await pool.query(
    'INSERT INTO stores (name, code, address, phone, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)',
    [
      String(data.name).trim(),
      String(data.code).trim().toUpperCase(),
      data.address || null,
      data.phone || null,
      Number(data.latitude),
      Number(data.longitude)
    ]
  );

  return findById(result.insertId);
}

/**
 * Actualiza una tienda existente
 * @param {number} id - ID de la tienda
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object|null>} La tienda actualizada o null si no existe
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
  if (data.code !== undefined) {
    updates.push('code = ?');
    values.push(String(data.code).trim().toUpperCase());
  }
  if (data.address !== undefined) {
    updates.push('address = ?');
    values.push(data.address || null);
  }
  if (data.phone !== undefined) {
    updates.push('phone = ?');
    values.push(data.phone || null);
  }
  if (data.latitude !== undefined) {
    updates.push('latitude = ?');
    values.push(Number(data.latitude));
  }
  if (data.longitude !== undefined) {
    updates.push('longitude = ?');
    values.push(Number(data.longitude));
  }
  if (data.isActive !== undefined) {
    updates.push('is_active = ?');
    values.push(Boolean(data.isActive));
  }

  if (updates.length === 0) return existing;

  values.push(id);
  const pool = getPool();
  await pool.query(`UPDATE stores SET ${updates.join(', ')} WHERE id = ?`, values);

  return findById(id);
}

export const storesMysqlRepository = {
  findAll,
  findById,
  findActive,
  findByCode,
  create,
  update
};
