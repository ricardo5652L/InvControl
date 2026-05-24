# database (migrations & seeds)

Este proyecto usa **MySQL** con migraciones y semillas (seeds) SQL.

> Importante: en la API el modo por defecto es **in-memory** (`DATA_SOURCE=memory`).

## Estado actual de la API

- La API sigue funcionando con **DATA_SOURCE=memory** (in-memory).
- **MySQL NO se activa automáticamente** en la API.
- Para usar MySQL en el futuro, debe configurarse `DATA_SOURCE=mysql` y tener credenciales válidas.


Verifique también:
- `GET /api/system/data-source`
- `GET /api/system/mysql-ping`

## Flujo recomendado (MySQL local)

### Requisitos

- **MySQL 8**
- Un usuario con permisos para:
  - Crear la base de datos (`CREATE DATABASE`) y
  - Crear/alterar tablas.

La estructura esperada es:
- `database/migrations/001_init.sql` (migración: crea schema)
- `database/seeds/001_demo.sql` (seed: carga datos demo)

### Paso 1: ejecutar migración

1) El script `database/migrations/001_init.sql` incluye:
- `CREATE DATABASE IF NOT EXISTS invcontrol`
- `USE invcontrol`
- creación de tablas

Ejecuta contra tu MySQL local (ajusta host/puerto/usuario):

```bash
mysql -u <DB_USER> -p -h <DB_HOST> -P <DB_PORT> < database/migrations/001_init.sql
```

### Paso 2: ejecutar seed demo

```bash
mysql -u <DB_USER> -p -h <DB_HOST> -P <DB_PORT> < database/seeds/001_demo.sql
```

### Opción alternativa: ejecutar setup-local-mysql.sql

Puedes ejecutar el script orquestador:
- `database/scripts/setup-local-mysql.sql`

Este script usa `SOURCE` para incluir archivos. **Si tu cliente/entorno no soporta `SOURCE` como se espera**, ejecuta manualmente los dos pasos anteriores.


## Verificación: confirmar que los datos existen

Después de ejecutar migración + seed, verifica con estas queries:

```sql
SELECT * FROM stores;

SELECT email, role FROM users;

SELECT name, sku FROM products;
```

## Credenciales demo (usuarios)

- `admin@invcontrol.local` / `admin123`
- `trabajador@invcontrol.local` / `trabajador123`

> Nota: en `users.password_hash` se guarda el **hash bcrypt** (no el password en texto plano). Los valores demo del seed ya fueron generados con bcrypt.



## Notas sobre idempotencia

- El seed 001_demo.sql utiliza `INSERT IGNORE` cuando aplica (por ejemplo en `stores`, `users`, `categories` y `products`).
- Para `inventory_movements` no existe una constraint única, por lo que se aplica un `WHERE NOT EXISTS` por `id` para evitar duplicados al re-ejecutar.

## Referencias

- Migración SQL: `database/migrations/001_init.sql`
- Seed demo: `database/seeds/001_demo.sql`

