/**
 * Índice de repositorios MySQL.
 * Estos repositorios se activarán en una etapa posterior cuando DATA_SOURCE=mysql.
 * Actualmente, la API usa los repositorios en memoria (../index.js).
 */

export { storesMysqlRepository } from './stores.mysql.repository.js';
export { usersMysqlRepository } from './users.mysql.repository.js';
export { productsMysqlRepository } from './products.mysql.repository.js';
export { inventoryMysqlRepository } from './inventory.mysql.repository.js';
export { salesMysqlRepository } from './sales.mysql.repository.js';
export { categoriesMysqlRepository } from './categories.mysql.repository.js';
