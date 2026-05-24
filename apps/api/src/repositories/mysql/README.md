# Repositorios MySQL

## Estado Actual

Estos repositorios MySQL **NO están activos**. La API sigue usando los repositorios en memoria definidos en `../` (parent directory).

- ✅ Repositorios en memoria: **ACTIVOS**
- ❌ Repositorios MySQL: **PREPARADOS, pero INACTIVOS**

## Propósito

Estos repositorios están preparados como base para una futura migración a MySQL:

1. **Interfaz compatible**: Cada repositorio MySQL implementa las mismas funciones que su equivalente en memoria
2. **Mapeo de datos**: Convierten automáticamente snake_case de MySQL a camelCase para mantener compatibilidad con la API actual
3. **SQL parametrizado**: Todas las queries usan parámetros (`?`) para prevenir SQL injection
4. **Sin activación automática**: Requieren activación explícita mediante `DATA_SOURCE=mysql`

## Estructura

```
mysql/
├── index.js                          # Índice de exportaciones
├── stores.mysql.repository.js       # Repositorio para tiendas
├── users.mysql.repository.js        # Repositorio para usuarios
├── products.mysql.repository.js     # Repositorio para productos
├── categories.mysql.repository.js   # Repositorio para categorías
├── inventory.mysql.repository.js    # Repositorio para movimientos de inventario
├── sales.mysql.repository.js        # Repositorio para ventas y items
└── README.md                         # Este archivo
```

## Funcionalidad por Repositorio

### storesMysqlRepository
- `findAll()` - Obtiene todas las tiendas
- `findById(id)` - Obtiene una tienda por ID
- `findActive()` - Obtiene solo tiendas activas
- `findByCode(code)` - Obtiene tienda por código (case-insensitive)
- `create(data)` - Crea una nueva tienda
- `update(id, data)` - Actualiza una tienda existente

### usersMysqlRepository
- `findAll()` - Obtiene todos los usuarios
- `findById(id)` - Obtiene un usuario por ID
- `findActiveById(id)` - Obtiene usuario activo por ID
- `findByEmail(email)` - Obtiene usuario por email (case-insensitive)
- `findActiveByEmail(email)` - Obtiene usuario activo por email
- `findActive()` - Obtiene solo usuarios activos
- `findByStoreId(storeId)` - Obtiene usuarios de una tienda
- `emailExists(email, excludeUserId)` - Verifica si un email existe
- `create(data)` - Crea un nuevo usuario
- `update(id, data)` - Actualiza un usuario
- `softDelete(id)` - Elimina lógicamente un usuario (is_active = false)

### productsMysqlRepository
- `findAll()` - Obtiene todos los productos
- `findById(id)` - Obtiene un producto por ID
- `findActiveById(id)` - Obtiene producto activo por ID
- `findActive()` - Obtiene solo productos activos
- `findByStoreId(storeId)` - Obtiene productos de una tienda
- `findActiveByStoreId(storeId)` - Obtiene productos activos de una tienda
- `findLowStock(storeId)` - Obtiene productos con stock bajo
- `search(query)` - Busca productos por nombre o SKU
- `skuExists(sku, storeId)` - Verifica si un SKU existe en una tienda
- `calculateInventoryValue(storeId)` - Calcula valor total del inventario
- `create(data)` - Crea un nuevo producto
- `update(id, data)` - Actualiza un producto

### categoriesMysqlRepository
- `findAll()` - Obtiene todas las categorías
- `findById(id)` - Obtiene una categoría por ID
- `findByName(name)` - Obtiene categoría por nombre (case-insensitive)
- `create(data)` - Crea una nueva categoría

### inventoryMysqlRepository
- `findAll()` - Obtiene todos los movimientos
- `findById(id)` - Obtiene un movimiento por ID
- `findByProductId(productId)` - Obtiene movimientos de un producto
- `findByUserId(userId)` - Obtiene movimientos de un usuario
- `findByType(type)` - Obtiene movimientos por tipo (IN, OUT, ADJUSTMENT)
- `findRecent(limit)` - Obtiene últimos N movimientos
- `create(data)` - Crea un nuevo movimiento

### salesMysqlRepository
- `findAllSales()` - Obtiene todas las ventas
- `findSaleById(id)` - Obtiene una venta por ID
- `findSalesByStoreId(storeId)` - Obtiene ventas de una tienda
- `findSalesByUserId(userId)` - Obtiene ventas de un usuario
- `findSalesByPaymentMethod(paymentMethod)` - Obtiene ventas por método de pago
- `findSalesByDateRange(fromDate, toDate)` - Obtiene ventas en rango de fechas
- `calculateTotalSales(storeId)` - Calcula total de ventas
- `calculateTodaySales(storeId)` - Calcula ventas de hoy
- `countTodaySales(storeId)` - Cuenta ventas de hoy
- `findAllSaleItems()` - Obtiene todos los items de venta
- `findSaleItemsBySaleId(saleId)` - Obtiene items de una venta
- `findSaleItemsByProductId(productId)` - Obtiene items por producto
- `countItemsSold(saleIds)` - Cuenta items vendidos
- `createSale(data)` - Crea una nueva venta
- `createSaleItem(data)` - Crea un nuevo item de venta

## Mapeo de Datos

Los repositorios convierten automáticamente entre snake_case de MySQL y camelCase de la API:

| MySQL | API |
|-------|-----|
| `photo_url` | `photoUrl` |
| `password_hash` | `passwordHash` |
| `store_id` | `storeId` |
| `is_active` | `isActive` |
| `category_id` | `categoryId` |
| `stock_min` | `stockMin` |
| `created_at` | `createdAt` |
| `product_id` | `productId` |
| `user_id` | `userId` |
| `payment_method` | `paymentMethod` |
| `sale_id` | `saleId` |
| `unit_price` | `unitPrice` |

## Cómo se Activarán

En una etapa posterior dedicada a la migración a MySQL:

1. Se creará un **selector de repositorios** en `routes.js` o un middleware
2. Cuando `DATA_SOURCE=mysql`:
   - Las rutas usarán estos repositorios en lugar de los en memoria
   - `getPool()` en `database.js` iniciará la conexión automáticamente
3. Las migraciones de base de datos se ejecutarán previamente
4. Los datos se migrarán desde memoria a MySQL

## SQL y Transacciones

- ✅ SQL parametrizado para prevenir SQL injection
- ✅ Manejo básico de errores (promesas rechazadas)
- ⏸️ Transacciones: Se implementarán en etapa de migración
- ⏸️ Índices y optimizaciones: Incluidos en `database/migrations/001_init.sql`

## API Actual (SIN CAMBIOS)

**No importan cambios en la API actual porque estos repositorios NO están conectados.**

- ✅ `routes.js` sigue usando repositorios en memoria
- ✅ Endpoints responden igual
- ✅ Frontend funciona sin cambios
- ✅ Tests pasan sin modificaciones

## Próximas Etapas

### Etapa de Migración (Futura)
1. Crear estrategia de **selector dinámico de repositorios** basado en `DATA_SOURCE`
2. Conectar `routes.js` a los repositorios MySQL (con flag `DATA_SOURCE=mysql`)
3. Ejecutar migraciones de datos
4. Validar con tests e integración
5. Cambiar `DATA_SOURCE` por defecto a `mysql` (opcional)

## Referencias

- Esquema SQL: `database/migrations/001_init.sql`
- Configuración: `src/config.js`
- Pool de conexión: `src/database.js`
- Repositorios en memoria: `src/repositories/` (parent)
