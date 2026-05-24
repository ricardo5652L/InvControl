import { getPool } from '../../database.js';

/**
 * Repositorio MySQL para categorías (categories).
 * Interfaz equivalente al repositorio en memoria.
 * Se activará en etapas posteriores cuando DATA_SOURCE=mysql.
 */

/**
 * Mapea resultados de MySQL a camelCase
 * @param {Object} row - Fila de MySQL
 * @returns {Object} Objeto con propiedades en camelCase
 */
function mapCategoryRow(row) {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at
  };
}

/**
 * Obtiene todas las categorías
 * @returns {Promise<Array>} Lista de categorías
 */
export async function findAll() {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM categories ORDER BY id');
  return rows.map(mapCategoryRow);
}

/**
 * Obtiene una categoría por ID
 * @param {number} id - ID de la categoría
 * @returns {Promise<Object|null>} La categoría o null si no existe
 */
export async function findById(id) {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
  return rows.length ? mapCategoryRow(rows[0]) : null;
}

/**
 * Obtiene una categoría por nombre (case-insensitive)
 * @param {string} name - Nombre de la categoría
 * @returns {Promise<Object|null>} La categoría o null si no existe
 */
export async function findByName(name) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM categories WHERE LOWER(name) = LOWER(?)',
    [name]
  );
  return rows.length ? mapCategoryRow(rows[0]) : null;
}

/**
 * Crea una nueva categoría
 * @param {Object} data - Datos de la categoría
 * @returns {Promise<Object>} La categoría creada con ID
 */
export async function create(data) {
  const pool = getPool();
  const [result] = await pool.query(
    'INSERT INTO categories (name) VALUES (?)',
    [String(data.name).trim()]
  );

  return findById(result.insertId);
}

export const categoriesMysqlRepository = {
  findAll,
  findById,
  findByName,
  create
};
