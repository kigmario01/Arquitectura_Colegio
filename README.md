# Plataforma Estudiantil

Aplicación web fullstack para la administración integral de estudiantes, profesores, cursos, notas y asistencias. El proyecto está compuesto por un backend en Node.js + Express + SQLite3 y un frontend en React + Vite + TailwindCSS con animaciones de Framer Motion.

## Requisitos

- Node.js 18 o superior

## Estructura

```
backend/   # API REST con Express y SQLite
frontend/  # Interfaz web construida con React + Vite
```

## Puesta en marcha

### Backend

```bash
cd backend
npm install
node server.js
```

La API quedará disponible en `http://localhost:4000/api` y la base de datos SQLite se creará automáticamente como `plataforma_estudiantil.sqlite`.

### Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

La interfaz se expone por defecto en `http://localhost:5173` y consume la API local.

## Funcionalidades destacadas

- CRUD completo para estudiantes, profesores, cursos, notas y asistencias.
- Dashboard con métricas, tarjetas interactivas y gráficas dinámicas.
- Animaciones sutiles en navegación, tablas y formularios usando Framer Motion.
- Notificaciones contextuales con React Toastify.
- Diseño responsive con barra lateral, navbar y modo oscuro moderno.
- Base de datos SQLite autogenerada con relaciones y llaves foráneas.

## Variables de entorno

El frontend puede apuntar a otra URL de la API configurando `VITE_API_URL`. Por defecto usa `http://localhost:4000/api`.

## Scripts adicionales

- `npm run build` (frontend): genera la versión optimizada para producción.

## Despliegue

- Guía completa: ver `instrucciones.md` en la raíz del repositorio.
- Render (Backend): usa el `render.yaml` provisto (Node 18, `JWT_SECRET`, `DB_PATH`, `CORS_ORIGIN`, disco persistente en `/var/data`).
- Vercel (Frontend): `frontend/vercel.json` configura build y rewrites para SPA; define `VITE_API_URL` en el panel de Vercel apuntando al backend en Render.

### Variables para producción

- Backend:
  - `JWT_SECRET` o `SECRET_KEY` (alias)
  - `DB_PATH` o `DATABASE_URL` (alias; para SQLite usar `/var/data/plataforma_estudiantil.sqlite`)
  - `CORS_ORIGIN` (dominio de Vercel)
  - `NODE_ENV=production`
- Frontend:
  - `VITE_API_URL=https://<tu-servicio-backend>.onrender.com/api`

---

¡Listo! Ejecuta ambos servicios y tendrás tu **Plataforma Estudiantil** funcionando localmente.
