# Outdoor Team - Academia de Hábitos Saludables

Una aplicación web para el seguimiento de hábitos saludables, entrenamiento, nutrición y bienestar integral. Esta versión está configurada para ser auto-hosteada usando Supabase y para ser compilada como una aplicación Android usando Capacitor.

## 🚀 Características

- **Seguimiento de Hábitos**: Sistema completo para rastrear ejercicio, nutrición, pasos diarios y meditación.
- **Planes Personalizados**: Diferentes niveles de acceso a funcionalidades.
- **Panel de Administración**: Gestión completa de usuarios y contenido.
- **PWA y App Android**: Instalable en dispositivos móviles y desktop.
- **Métricas Detalladas**: Análisis de progreso con gráficos y estadísticas.
- **Backend Node/Express y Frontend React**: Stack moderno y performante.
- **Integración con Supabase**: Utiliza Supabase para base de datos (PostgreSQL), autenticación y almacenamiento.

## 📋 Requisitos Previos

- **Node.js**: `v18` o superior.
- **npm**: `v8` o superior.
- **Supabase**: Una cuenta de Supabase y un proyecto creado.
- **Android Studio**: Para compilar y ejecutar la aplicación en Android.

## ⚡ Instalación y Ejecución Local (Web)

1.  **Clonar el repositorio**
    ```bash
    git clone <repository-url>
    cd outdoor-team
    ```

2.  **Instalar dependencias**
    ```bash
    npm ci
    ```

3.  **Configurar variables de entorno**
    Crea un archivo `.env` en la raíz del proyecto copiando el ejemplo:
    ```bash
    cp .env.example .env
    ```
    Edita `.env` y completa las variables con tus credenciales de Supabase.

4.  **Ejecutar migraciones de la base de datos**
    ```bash
    npm run db:migrate
    ```

5.  **Iniciar la aplicación en modo de desarrollo**
    ```bash
    npm start
    ```
    - Frontend: [http://localhost:3000](http://localhost:3000)
    - Backend API: [http://localhost:3001](http://localhost:3001)

## 📱 Compilación para Android (Capacitor)

1.  **Configurar variables de entorno para móvil**
    En tu archivo `.env`, asegúrate de que las siguientes variables estén configuradas para el build móvil:
    ```
    VITE_USE_HASH_ROUTER=true
    # Si tu app necesita conectarse a un backend remoto (no localhost)
    # VITE_API_BASE_URL=https://tu-api.com 
    ```

2.  **Construir la aplicación web y sincronizar con Capacitor**
    Este comando compila la aplicación React y copia los archivos web a la plataforma nativa de Android.
    ```bash
    npm run build:mobile
    ```
    *La primera vez, Capacitor puede pedirte que instales la plataforma Android. Sigue las instrucciones.*

3.  **Abrir el proyecto en Android Studio**
    ```bash
    npm run cap:open
    ```
    Esto abrirá Android Studio con tu proyecto.

4.  **Generar un APK de depuración (Debug)**
    Desde la raíz de tu proyecto, puedes ejecutar:
    ```bash
    npm run android:apk:debug
    ```
    El APK se encontrará en `android/app/build/outputs/apk/debug/`.

5.  **Generar un APK de lanzamiento (Release)**
    Para generar un APK firmado para producción, primero debes configurar la firma en `android/app/build.gradle`. Luego, ejecuta:
    ```bash
    npm run android:apk:release
    ```
    El APK se encontrará en `android/app/build/outputs/apk/release/`.

## 🛠️ Scripts Disponibles

- `npm start`: Inicia el entorno de desarrollo web.
- `npm run build`: Compila el frontend y el backend para producción web.
- `npm run build:web`: Compila solo el frontend para la web.
- `npm run build:mobile`: Compila el frontend para móvil y sincroniza con Capacitor.
- `npm run cap:sync`: Sincroniza los cambios del proyecto web con la plataforma Android.
- `npm run cap:open`: Abre el proyecto nativo en Android Studio.
- `npm run android:apk:debug`: Genera un APK de depuración.
- `npm run android:apk:release`: Genera un APK de lanzamiento (requiere configuración de firma).
- `npm run db:migrate`: Aplica las migraciones de la base de datos.
- `npm run db:seed`: (Opcional) Puebla la base de datos con datos iniciales.
- `npm run generate-vapid`: Genera nuevas claves VAPID para notificaciones push web.

## ⚙️ Notas sobre Android

- **Permisos**: El permiso de `INTERNET` es agregado automáticamente por Capacitor.
- **Notificaciones Push**: Las notificaciones push para la web (VAPID) no funcionan en la app nativa. Para notificaciones push en Android, necesitarás integrar un servicio como Firebase Cloud Messaging (FCM) y el plugin de Capacitor para Push Notifications.
- **CORS**: El backend debe permitir peticiones desde `capacitor://localhost` para que la app Android pueda comunicarse con la API.

## 🚀 Despliegue en Producción (Web - Ej. Render)

Puedes usar el archivo `render.yaml` incluido para desplegar la versión web en [Render](https://render.com/).
