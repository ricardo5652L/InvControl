# database (migrations & seeds)

Este proyecto usa **MySQL** con migraciones y semillas (seeds) SQL.

> Importante: en la API el modo por defecto es **in-memory** (`DATA_SOURCE=memory`).

## Estado actual de la API

- La API sigue funcionando con memoria.
- **MySQL no se activa automáticamente**.
- Para que MySQL se use, debe configurarse `DATA_SOURCE=mysql` y tener credenciales válidas.

Verifique también:
- `GET /api/system/data-source`
- `GET /api/system/mysql-ping`

## Flujo recomendado

1. **Migraciones primero**
2. **Seeds después**

La estructura esperada es:
- `database/migrations/001_init.sql`
- `database/seeds/001_demo.sql`

## Cómo ejecutar `001_init.sql` (migración)

1) Crear/usar el schema:
- El script `001_init.sql` ya incluye `CREATE DATABASE IF NOT EXISTS` y `USE invcontrol;`

2) Ejecutar el script contra MySQL.

Ejemplo (ajuste usuario/host/puerto según tu entorno):

```bash
mysql -u <DB_USER> -p -h <DB_HOST> -P <DB_PORT> <  database/migrations/001_init.sql
```

## Cómo ejecutar `001_demo.sql` (seed demo)

Una vez creada la estructura de tablas con la migración:

```bash
mysql -u <DB_USER> -p -h <DB_HOST> -P <DB_PORT> <  database/seeds/001_demo.sql
```

## Notas sobre idempotencia

- El seed 001_demo.sql utiliza `INSERT IGNORE` cuando aplica (por ejemplo en `stores`, `users`, `categories` y `products`).
- Para `inventory_movements` no existe una constraint única, por lo que se aplica un `WHERE NOT EXISTS` por `id` para evitar duplicados al re-ejecutar.

## Referencias

- Migración SQL: `database/migrations/001_init.sql`
- Seed demo: `database/seeds/001_demo.sql`

