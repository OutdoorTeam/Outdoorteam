# AGENTS.md

## Proposito
- Guia operativa para compilar, diagnosticar y desplegar Outdoor Team (web + backend + APK/AAB Android) sin romper Supabase ni tareas programadas.

## Stack y arquitectura
- Frontend `client/`: React 18 + Vite + Tailwind + Radix UI + React Router (HashRouter en movil). Metricas con Recharts.
- Backend `server/`: Express 5 + Kysely (Postgres) + Supabase (auth/storage). Cron jobs opcionales (reset diario, notificaciones).
- Compartido `shared/validation-schemas.ts`: validaciones Zod.
- Android `android/`: Capacitor 7 (`appId` `com.outdoorteam.app`).
- Scripts `scripts/`: dev, migraciones/seed, generacion VAPID (push web).
- PWA + hosting: build web y despliegue (ej. Render).

## Entorno (.env)
- Duplicar `.env.example` -> `.env`. Variables minimas:
  - Backend: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE`, `SUPABASE_JWT_SECRET`, `SUPABASE_ANON_KEY`, `STRICT_ENV`, `CORS_ORIGIN` (incluir `capacitor://localhost` y el dominio web).
  - Cliente:
    - `VITE_SUPABASE_URL=`
    - `VITE_SUPABASE_ANON_KEY=`
    - `VITE_API_BASE_URL=http://10.0.2.2:3001` # Emulador
    - `VITE_USE_HASH_ROUTER=true`
- Para dispositivo fisico o release usar `https://api.tudominio.com` y abrir CORS a ese host.
- Flags opcionales: `FEATURE_MIGRATIONS`, `FEATURE_SEED_DB`, `ENABLE_SCHEDULERS`.
- Push web: generar `VAPID_PUBLIC_KEY` y `VAPID_PRIVATE_KEY` con `npm run generate-vapid` (solo PWA; en Android nativo usar FCM).

## Flujo local (web + API)
1. `npm ci`
2. `npm run db:migrate` (y `npm run db:seed` si aplica)
3. `npm run start:dev` (API en 3001; valida `.env`)
4. `npm start` consume `dist/` para pruebas tipo prod

## Pre-flight checks Android (siempre)
- `java -version` -> JDK 17+.
- `echo $env:JAVA_HOME` (Windows) apuntando al JDK.
- Android Studio + SDK API 35 instalados; `android/local.properties` con `sdk.dir`.
- `.env` movil correcto: si no es emulador, URL publica HTTPS en `VITE_API_BASE_URL` + CORS.
- `capacitor.config.ts` -> `webDir: "dist/public"`.

## Build Android
- Comandos desde la raiz (Windows / PowerShell recomendado):
  - `npx cross-env CAPACITOR=true vite build`
  - `npx cap sync android`
  - `cd android`
  - `.\gradlew.bat assembleDebug`
- Equivalentes por script:
  - `npm run build:mobile` (usar cross-env para `CAPACITOR=true`).
  - `npm run cap:sync`.
  - `npm run android:apk:debug` (usar `gradlew.bat` en Windows).

### Release pro
- Keystore:
  - `keytool -genkey -v -keystore outdoor-team.keystore -alias outdoorteam -keyalg RSA -keysize 2048 -validity 10000`
- `android/app/build.gradle` -> `signingConfigs` + `buildTypes.release` (activar minify/R8 y reglas compatibles con Capacitor).
- `.env` productivo (HTTPS) y CORS actualizado.
- Build release:
  - `npx cross-env CAPACITOR=true vite build`
  - `npx cap sync android`
  - `cd android`
  - `.\gradlew.bat bundleRelease` # AAB para Play Store
  - `.\gradlew.bat assembleRelease` # APK firmado (alternativo)

## Red y seguridad Android
- `AndroidManifest.xml`: `usesCleartextTraffic=true` solo si necesitas HTTP local; quitar en prod.
- `res/xml/network_security_config.xml`: habilita `10.0.2.2`/`localhost`. Agregar tu dominio si vas a HTTP interno (preferible HTTPS).
- Push nativa: integrar FCM + `google-services.json` (VAPID solo web PWA).

## Endpoints de diagnostico backend
- `GET /health`
- `GET /debug/env`
- `GET /api/status`
- Estaticos: `dist/public` en prod; `public/` en dev (via `setupStaticServing`).

## Migraciones y seeds
- `npm run db:migrate` tras editar `scripts/migration.sql`.
- `npm run db:seed` si `FEATURE_SEED_DB=true` o manual.

## Observabilidad (recomendado)
- Crashlytics o Sentry para capturar errores nativos/web.
- Analytics: eventos de habitos (completado, duracion, meta alcanzada).

## Seguridad (guardrails)
- Nunca poner secretos en variables `VITE_*`.
- Validar entradas en el servidor (Zod en cliente solo mejora UX).
- Buckets de planes/archivos en privado; usar URLs firmadas si aplica.

## Troubleshooting (sintomas -> acciones)
- `JAVA_HOME is not set` -> instalar JDK 17+ y setear `JAVA_HOME`.
- `./gradlew: command not found` en Windows -> usar `gradlew.bat`.
- La app no habla con la API en dispositivo real -> `VITE_API_BASE_URL` a dominio publico + CORS + HTTPS; `10.0.2.2` solo emulador.
- CORS bloqueado -> incluir `capacitor://localhost` y tu dominio en backend.
- Pantalla blanca post-build -> confirmar `VITE_USE_HASH_ROUTER=true` y `base: './'` cuando `CAPACITOR=true`; reconstruir y `cap sync`.
- Push no llega en APK -> recordar que VAPID es web; en nativo usar FCM.

## Contribuciones
- Hooks y componentes funcionales, tipado estricto, utilidades Tailwind/class-variance-authority.
- En backend, preferir Kysely sobre SQL crudo; loguear con niveles usando `SystemLogger`.
