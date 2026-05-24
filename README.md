# InvControl

Sistema web para gestion de inventarios en pequenas tiendas minoristas.

## Stack

- Frontend: React 18 + Vite
- Backend: Node.js 18 + Express
- Base de datos objetivo: MySQL 8
- Autenticacion preparada con JWT

## Ejecutar en desarrollo

```bash
npm install
npm run dev
```

- Web: `http://localhost:5173`
- API: `http://localhost:3000/api`

## Usuario demo

```txt
admin@invcontrol.local
admin123
```

## Trabajador demo

```txt
trabajador@invcontrol.local
trabajador123
```

## Roles

- Manager: administra usuarios, productos, inventario, ventas y reportes.
- Trabajador: puede iniciar sesion y operar el sistema con menos permisos; no puede administrar usuarios.
- Tienda afiliada: cada usuario pertenece a una tienda y sus productos, ventas e inventario se filtran por esa tienda.

Para crear cuentas de trabajadores, entra como manager y abre la seccion `Usuarios`.

## Modulos principales

- `Altas`: accesos rapidos para registrar productos, inventario, ventas, trabajadores y tiendas.
- `Productos`: alta y mantenimiento del catalogo.
- `Tiendas`: registro de tiendas afiliadas con ubicacion por Google Maps.
- `Usuarios`: cuentas de manager y trabajadores vinculadas a una tienda.

## Estructura

```txt
apps/
  api/
    src/
  web/
    src/
database/
  migrations/
```

## Pendiente para produccion

- Conectar repositorios de API a MySQL.
- Configurar JWT con secreto real.
- Agregar backups automaticos.
- Ejecutar pruebas E2E en CI/CD.
