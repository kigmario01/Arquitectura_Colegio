# Instrucciones de instalación y ejecución

Guía para clonar, instalar y ejecutar la plataforma en otro PC.

## Prerrequisitos
- `Node.js` 18 o superior.
- `Git` instalado.
- Puertos disponibles: `4000` (backend) y `5173` (frontend).

## Clonar el repositorio
```bash
git clone https://github.com/kigmario01/Arquitectura_Colegio.git
cd Arquitectura_Colegio
```

## Backend (API)
1. Instalar dependencias:
   ```bash
   cd backend
   npm install
   ```
2. Arrancar servidor en `4000`:
   - Windows PowerShell:
     ```powershell
     node server.js
     ```
     (Opcional) definir secreto:
     ```powershell
     setx JWT_SECRET "tu-secreto"
     ```
   - macOS/Linux:
     ```bash
     export JWT_SECRET="tu-secreto"
     node server.js
     ```
3. Qué sucede al iniciar:
   - Se crea la base `backend/plataforma_estudiantil.sqlite` (SQLite, sin instalar nada adicional).
   - Se seedéa un usuario administrador.
   - La API queda en `http://localhost:4000/api`.

## Frontend (Web)
1. Instalar dependencias:
   ```bash
   cd ../frontend
   npm install
   ```
2. Configurar la URL del backend creando `frontend/.env.local`:
   ```env
   VITE_API_URL=http://localhost:4000/api
   ```
3. Arrancar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abrir `http://localhost:5173/login` en el navegador.

## Acceso
- Usuario: `admin@colegio.edu`
- Contraseña: `admin123`
- Tras iniciar sesión, se redirige al Dashboard y el token se guarda en `localStorage`.

## Producción (opcional)
- Frontend:
  ```bash
  npm run build
  npm run preview
  ```
- Backend:
  - Levantar con tu gestor (PM2/servicio del sistema) y definir `JWT_SECRET` y `PORT` en el entorno.

## Cambiar puertos
- Si el puerto `4000` está ocupado, puedes arrancar el backend en otro puerto, por ejemplo `4002`:
  - Windows PowerShell:
    ```powershell
    $env:PORT=4002; node server.js
    ```
  - macOS/Linux:
    ```bash
    export PORT=4002
    node server.js
    ```
- Actualiza `frontend/.env.local` a:
  ```env
  VITE_API_URL=http://localhost:4002/api
  ```

## Solución de problemas
- 401 (No autorizado): verifica que el backend esté levantado y que `VITE_API_URL` apunte a la API correcta.
- Address already in use (puerto en uso): cambia `PORT` y actualiza `VITE_API_URL`.
- CORS: el backend tiene `cors` habilitado para `localhost`.

## Notas
- No necesitas instalar ninguna base de datos: se usa SQLite con archivo local.
- Puerto por defecto del backend: `4000`.