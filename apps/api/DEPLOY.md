# API Deployment Guide

## Current Status

The API currently uses **in-memory data storage** (`DATA_SOURCE=memory`). This is the default and stable configuration.

### Data Source: Memory (Current)

- All data is stored in `src/store.js`
- No external database connection required
- Perfect for development and testing
- Data is reset on server restart

```bash
DATA_SOURCE=memory
```

### Future: MySQL Integration

In a future stage, the API will be configured to use **MySQL** as the primary data source. MySQL support is already prepared:

- `mysql2` package is installed
- `src/database.js` provides connection pool and utilities
- `src/config.js` exports all database configuration variables
- Repositories are designed to support MySQL migration

### When DATA_SOURCE=mysql

The following environment variables will be required:

```
DATA_SOURCE=mysql
DB_HOST=localhost          # MySQL host
DB_PORT=3306               # MySQL port
DB_USER=root               # MySQL user
DB_PASSWORD=               # MySQL password
DB_NAME=invcontrol         # Database name
```

### Database Connection (For Future Use)

The `src/database.js` module provides:

- `getPool()` - Returns MySQL connection pool (only when DATA_SOURCE=mysql)
- `testConnection()` - Tests database connectivity (returns false for memory mode)
- `closePool()` - Cleanly closes all connections on server shutdown

**Important**: The pool is NOT created automatically when `DATA_SOURCE=memory`. It's only instantiated if explicitly called and `DATA_SOURCE=mysql`.

## Environment Configuration

### Development (.env)

```
NODE_ENV=development
PORT=3000
JWT_SECRET=dev_secret_change_me
JWT_EXPIRES_IN=1h
CORS_ORIGIN=http://localhost:5173
DATA_SOURCE=memory
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=invcontrol
```

### Production

In production, ensure:
- `JWT_SECRET` is set to a secure value
- `CORS_ORIGIN` is restricted to your frontend domain
- `DATA_SOURCE` can be `memory` or `mysql` depending on your deployment
- If using MySQL, provide secure credentials for `DB_USER` and `DB_PASSWORD`

## Current API Behavior

- ✅ All endpoints work with in-memory storage
- ✅ No database initialization required
- ✅ Tests run without MySQL
- ✅ Development is fast and no setup needed
- ✅ MySQL integration is ready for future stages

## Demo Data (MySQL Seeds - Future)

For MySQL demo data, you can use the seed script:
- `database/migrations/001_init.sql`
- `database/seeds/001_demo.sql`

Recommended order:
1) Run migrations from `database/migrations/001_init.sql`
2) Run seeds from `database/seeds/001_demo.sql`

> Importante: la API **no activa MySQL automáticamente**. El modo por defecto sigue siendo `DATA_SOURCE=memory`.

## System Endpoints

### GET /api/system/data-source

Returns the current data source configuration without connecting to MySQL.

**Authentication**: None required (public endpoint)

**Response**:

When `DATA_SOURCE=memory`:
```json
{
  "dataSource": "memory",
  "usingMysql": false
}
```

When `DATA_SOURCE=mysql`:
```json
{
  "dataSource": "mysql",
  "usingMysql": true
}
```

**Note**: This endpoint only reads the configuration. It does not connect to MySQL, ping the database, or execute any queries.

### GET /api/system/mysql-ping

Tests MySQL connection only when `DATA_SOURCE=mysql`. Returns status without executing business logic.

**Authentication**: None required (public endpoint)

**Response when DATA_SOURCE=memory** (HTTP 200):
```json
{
  "ok": true,
  "enabled": false,
  "message": "MySQL no esta activo. DATA_SOURCE=memory"
}
```

**Response when DATA_SOURCE=mysql and connection succeeds** (HTTP 200):
```json
{
  "ok": true,
  "enabled": true,
  "connected": true
}
```

**Response when DATA_SOURCE=mysql and connection fails** (HTTP 500):
```json
{
  "ok": false,
  "enabled": true,
  "connected": false,
  "message": "No se pudo conectar a MySQL"
}
```

**Note**: This endpoint only connects to MySQL if `DATA_SOURCE=mysql`. It does not expose sensitive data (passwords, stack traces, or internal errors).

## Migration Path (Future)

When ready to migrate to MySQL:

### Para usar MySQL en el futuro (solo en entorno controlado)

1) Crear la base y el esquema:
- `database/migrations/001_init.sql`

2) Cargar datos demo:
- `database/seeds/001_demo.sql`

3) Configurar variables `DB_*`

4) Cambiar `DATA_SOURCE=mysql` **solo en entorno controlado**

> En esta etapa NO se activa MySQL automáticamente: la configuración por defecto sigue siendo `DATA_SOURCE=memory`.



**Note**: The repositories currently use the memory store. MySQL migration will happen in a separate, dedicated stage.

