# Despliegue del frontend en Vercel (InvControl)

Este documento describe cómo desplegar **solo** `apps/web` en Vercel. La API Express (`apps/api`) debe hospedarse por separado (Railway, Render, VPS, etc.).

## Configuración del proyecto en Vercel

| Campo | Valor |
|-------|--------|
| **Root Directory** | `apps/web` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` (desde la raíz del monorepo, si Vercel detecta workspaces; si el build falla por dependencias, configura el root del repo y el directorio `apps/web` según la guía de monorepos de Vercel) |

## Variable de entorno

En **Project → Settings → Environment Variables**, define:

```env
VITE_API_URL=https://URL-DE-TU-API/api
```

Sustituye `https://URL-DE-TU-API` por la URL pública donde esté desplegada la API Express (sin barra final después de `/api`).

Ejemplo:

```env
VITE_API_URL=https://invcontrol-api.ejemplo.com/api
```

Vite inyecta variables que empiezan por `VITE_` en tiempo de **build**. Si cambias `VITE_API_URL`, vuelve a desplegar para que el bundle se regenere.

## Desarrollo local

1. Copia el ejemplo de entorno (opcional):

   ```bash
   cp .env.example .env
   ```

2. Sin `.env`, el cliente usa `/api/` y Vite redirige las peticiones al backend según `vite.config.js`:

   ```js
   proxy: { '/api': 'http://localhost:3000' }
   ```

3. Con `.env` y `VITE_API_URL=http://localhost:3000/api`, las peticiones van directo al backend en el puerto 3000.

4. Arranca API y web desde la raíz del monorepo:

   ```bash
   npm run dev
   ```

## Backend por separado

- El frontend en Vercel **no** incluye Express ni MySQL.
- Despliega `apps/api` en otro servicio y configura CORS en el backend para permitir el origen de tu sitio en Vercel.
- Usa la misma URL base en `VITE_API_URL` (terminada en `/api`).

## Comprobación antes de desplegar

Desde la raíz del repositorio:

```bash
npm run build
npm run test
```

## Dominio

No es necesario configurar un dominio personalizado para la primera prueba; Vercel asigna una URL `*.vercel.app` automáticamente.
