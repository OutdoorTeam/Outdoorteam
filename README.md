# Outdoor Team - Academia de Hábitos Saludables

Una aplicación web para el seguimiento de hábitos saludables, entrenamiento, nutrición y bienestar integral. Esta versión está configurada para ser auto-hosteada usando Supabase.

## 🚀 Características

- **Seguimiento de Hábitos**: Sistema completo para rastrear ejercicio, nutrición, pasos diarios y meditación.
- **Planes Personalizados**: Diferentes niveles de acceso a funcionalidades.
- **Panel de Administración**: Gestión completa de usuarios y contenido.
- **PWA**: Instalable en dispositivos móviles y desktop.
- **Métricas Detalladas**: Análisis de progreso con gráficos y estadísticas.
- **Backend Node/Express y Frontend React**: Stack moderno y performante.
- **Integración con Supabase**: Utiliza Supabase para base de datos (PostgreSQL), autenticación y almacenamiento.

## 📋 Requisitos Previos

- **Node.js**: `v18` o superior.
- **npm**: `v8` o superior.
- **Supabase**: Una cuenta de Supabase y un proyecto creado.

## ⚡ Instalación y Ejecución Local

1.  **Clonar el repositorio**
    ```bash
    git clone <repository-url>
    cd outdoor-team
    ```

2.  **Instalar dependencias**
    Se recomienda usar `npm ci` para una instalación limpia basada en `package-lock.json`.
    ```bash
    npm ci
    ```

3.  **Configurar variables de entorno**
    Crea un archivo `.env` en la raíz del proyecto copiando el ejemplo:
    ```bash
    cp .env.example .env
    ```
    Ahora, edita el archivo `.env` y completa las variables con tus credenciales de Supabase. Puedes encontrarlas en la configuración de tu proyecto de Supabase (`Settings > API`).

    - `VITE_SUPABASE_URL` y `SUPABASE_URL`: Tu URL de proyecto de Supabase.
    - `VITE_SUPABASE_ANON_KEY` y `SUPABASE_ANON_KEY`: Tu clave `anon` (pública).
    - `SUPABASE_SERVICE_ROLE`: Tu clave `service_role` (secreta, solo para el backend).
    - `SUPABASE_JWT_SECRET`: Tu secreto de JWT, encontrado en `Settings > API > JWT Settings`.
    - `DATABASE_URL`: La URL de conexión a tu base de datos PostgreSQL de Supabase. La encontrarás en `Settings > Database > Connection string`. Asegúrate de reemplazar `[YOUR_PASSWORD]` con la contraseña de tu base de datos.

4.  **Ejecutar migraciones de la base de datos**
    Para crear todas las tablas necesarias en tu base de datos de Supabase, ejecuta el script de migración.
    ```bash
    npm run db:migrate
    ```
    *Nota: Este comando solo necesita ser ejecutado una vez durante la configuración inicial.*

5.  **Iniciar la aplicación en modo de desarrollo**
    Este comando iniciará tanto el servidor de backend (en el puerto 3001) como el de frontend (en el puerto 3000) con recarga en caliente.
    ```bash
    npm start
    ```

6.  **Acceder a la aplicación**
    - Frontend: [http://localhost:3000](http://localhost:3000)
    - Backend API: [http://localhost:3001](http://localhost:3001)

## 🛠️ Scripts Disponibles

- `npm start`: Inicia el entorno de desarrollo.
- `npm run build`: Compila el frontend y el backend para producción.
- `npm run db:migrate`: Aplica las migraciones de la base de datos.
- `npm run db:seed`: (Opcional) Puebla la base de datos con datos iniciales.
- `npm run generate-vapid`: Genera nuevas claves VAPID para notificaciones push.

## ⚙️ Endpoints de Verificación

- **Health Check**: `GET /health` - Verifica que el servidor esté corriendo.
- **Debug de Entorno**: `GET /debug/env` - Muestra el estado de las variables de entorno requeridas y los feature flags activos (sin exponer secretos).

## 🚀 Despliegue en Producción (Ej. Render)

Puedes usar el archivo `render.yaml` incluido para desplegar en [Render](https://render.com/).

1.  Crea un nuevo "Blueprint" en Render y conecta tu repositorio.
2.  Render detectará `render.yaml` y configurará el servicio.
3.  En la configuración del servicio en Render, ve a "Environment" y agrega las variables de entorno de tu archivo `.env` como "Secret Files".

**Configuración en `render.yaml`:**
- **Root Directory**: `.` (el servicio se construye desde la raíz).
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start` (o `node dist/server/index.js` si prefieres correr el build de producción).
