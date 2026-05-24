# Repositorios - Capa de Abstracción de Datos

## Descripción

Esta carpeta contiene los repositorios que actúan como una capa de abstracción sobre el almacenamiento de datos actual (en memoria). Estos repositorios están diseñados para facilitar una futura migración a MySQL sin cambiar la lógica de negocio ni las rutas de la API.

## Estado Actual

Los repositorios actuales son **adaptadores en memoria** que utilizan el objeto `db` de `store.js`. La aplicación sigue funcionando exactamente igual que antes, sin cambios en el comportamiento de la API.

## Repositorios Disponibles

- `stores.repository.js` - Operaciones CRUD para tiendas
- `users.repository.js` - Operaciones CRUD para usuarios
- `products.repository.js` - Operaciones CRUD para productos
- `inventory.repository.js` - Operaciones para movimientos de inventario
- `sales.repository.js` - Operaciones para ventas y elementos de venta
- `categories.repository.js` - Operaciones para categorías

## Futura Migración a MySQL

Cuando se realice la migración a MySQL:

1. Cada repositorio se reemplazará por una implementación que use MySQL
2. La interfaz de cada repositorio se mantendrá consistente
3. Las rutas (`routes.js`) no necesitarán cambios significativos
4. El comportamiento de la API permanecerá igual

## Diferencias entre store.js y 001_init.sql

### Usuarios (users)
- **store.js**: `photoUrl` (camelCase)
- **001_init.sql**: No existe la columna `photo_url` en la tabla users
- **Nota**: Se deberá agregar la columna `photo_url VARCHAR(500)` a la tabla users en la migración

### Convenciones de nombres
- **store.js**: camelCase (`storeId`, `categoryId`, `isActive`, `passwordHash`, `createdAt`, `stockMin`)
- **001_init.sql**: snake_case (`store_id`, `category_id`, `is_active`, `password_hash`, `created_at`, `stock_min`)
- **Nota**: Los repositorios manejan la conversión entre convenciones

### Ventas (sales)
- **store.js**: `paymentMethod` (camelCase)
- **001_init.sql**: `payment_method` (snake_case), ENUM('cash','card','transfer')
- **Nota**: Los repositorios manejan la conversión

## Uso

```javascript
import { storesRepository, usersRepository, productsRepository } from './repositories/index.js';

// Ejemplos de uso
const allStores = await storesRepository.findAll();
const store = await storesRepository.findById(1);
const newUser = await usersRepository.create({ name: 'Juan', email: 'juan@example.com', ... });
```

## Métodos Comunes

Cada repositorio implementa métodos estándar:

- `findAll()` - Obtiene todos los registros
- `findById(id)` - Obtiene un registro por ID
- `findActive()` - Obtiene solo registros activos
- `create(data)` - Crea un nuevo registro
- `update(id, data)` - Actualiza un registro existente
- `softDelete(id)` - Elimina lógicamente un registro (is_active = false)
- `findByStoreId(storeId)` - Obtiene registros por tienda (cuando aplica)
- `nextId()` - Obtiene el siguiente ID disponible