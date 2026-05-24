import { config } from '../config.js';
import {
  storesRepository as storesMemory,
  usersRepository as usersMemory,
  productsRepository as productsMemory,
  inventoryRepository as inventoryMemory,
  salesRepository as salesMemory,
  categoriesRepository as categoriesMemory
} from './index.js';

import {
  storesMysqlRepository,
  usersMysqlRepository,
  productsMysqlRepository,
  inventoryMysqlRepository,
  salesMysqlRepository,
  categoriesMysqlRepository
} from './mysql/index.js';

/**
 * Selector central de repositorios según DATA_SOURCE.
 * 
 * Permite elegir dinámicamente entre repositorios en memoria y MySQL
 * sin cambiar el resto de la aplicación.
 * 
 * @returns {Object} Objeto con todos los repositorios disponibles
 * 
 * @example
 * // En routes.js o middleware (cuando esté listo)
 * import { getRepositories } from './repositories/provider.js';
 * const repos = getRepositories();
 * const users = await repos.usersRepository.findAll();
 */
export function getRepositories() {
  if (config.DATA_SOURCE === 'mysql') {
    return {
      storesRepository: storesMysqlRepository,
      usersRepository: usersMysqlRepository,
      productsRepository: productsMysqlRepository,
      inventoryRepository: inventoryMysqlRepository,
      salesRepository: salesMysqlRepository,
      categoriesRepository: categoriesMysqlRepository
    };
  }

  // Por defecto, retorna repositorios en memoria
  return {
    storesRepository: storesMemory,
    usersRepository: usersMemory,
    productsRepository: productsMemory,
    inventoryRepository: inventoryMemory,
    salesRepository: salesMemory,
    categoriesRepository: categoriesMemory
  };
}

/**
 * Repositorios actuales según DATA_SOURCE en tiempo de importación.
 * 
 * NOTA: Esto se evalúa UNA SOLA VEZ cuando se importa el módulo.
 * Para cambios dinámicos en runtime (aunque no es recomendado),
 * usar getRepositories() en su lugar.
 * 
 * @type {Object}
 */
export const repositories = getRepositories();

/**
 * Retorna el DATA_SOURCE actual (para logging o debugging)
 * @returns {string} 'memory' o 'mysql'
 */
export function getActiveDataSource() {
  return config.DATA_SOURCE;
}
