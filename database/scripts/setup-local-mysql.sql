-- setup-local-mysql.sql
--
-- Script de ayuda para preparar MySQL local (solo del lado cliente).
--
-- IMPORTANTE:
-- 1) Algunos entornos/clientes MySQL no soportan incluir archivos con SOURCE
--    de forma idéntica. Este script está pensado para ejecutarse desde el
--    cliente local 'mysql' (CLI).
--
-- 2) La API NO se conecta a MySQL automáticamente en esta etapa.
--    La configuración por defecto sigue siendo DATA_SOURCE=memory.
--
-- Uso recomendado (ejemplo):
--   mysql -u <DB_USER> -p -h <DB_HOST> -P <DB_PORT>
--
--    Luego, dentro del cliente MySQL:
--      SOURCE database/scripts/setup-local-mysql.sql;
--
-- Alternativa equivalente (desde shell):
--   mysql -u <DB_USER> -p -h <DB_HOST> -P <DB_PORT> < database/scripts/setup-local-mysql.sql
--
-- Recomendación: en caso de problemas con SOURCE, ejecuta manualmente
-- los scripts en el orden indicado (más abajo).

-- =====================
-- 1) Migración
-- =====================
-- Crea la base de datos invcontrol si no existe y define el esquema.
SOURCE database/migrations/001_init.sql;

-- =====================
-- 2) Seed demo
-- =====================
-- Inserta datos demo de forma idempotente (evita duplicados).
SOURCE database/seeds/001_demo.sql;

