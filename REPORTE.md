# REPORTE DE BUILD

## 1. Hallazgos y estado
| Estado | Archivo | Detalle |
| ------ | ------- | ------- |
| OK | package.json | Scripts móviles ahora usan `cross-env` y runner Node para Gradle; `cap:sync` con `npx`. |
| OK | scripts/run-gradle.js | Nuevo wrapper multiplataforma para `gradlew` y validación del proyecto Android. |
| OK | tsconfig.server.json | Se añadió `"types": ["node"]` y se ajustó `outDir` a `dist`. |
| OK | server/utils/logging.ts | Se implementó `logAuthError` y `purgeOldLogs` ahora usa `Date`. |
| OK | .env.example | Valores móviles por defecto (`VITE_API_BASE_URL`, `VITE_USE_HASH_ROUTER`). |
| OK | render.yaml | `buildCommand` usa `npm ci`. |
| WARN | .env (local) | Actualizado para móvil; confirmar que no se sube. |
| WARN | Entorno local | Falta JDK (`java -version`), `npm run android:apk:debug` falla con `JAVA_HOME` ausente. |
| WARN | Android project | `android/` generado con `npx cap add android`, sigue ignorado → repetir en entornos limpios. |

## 2. Cambios aplicados
- `npx cap add android` para inicializar el proyecto nativo.
- TypeScript del server compila con tipos de Node y salida en `dist/`.
- `SystemLogger` suma `logAuthError` y corrige limpieza con `Date`.
- Scripts npm móviles compatibles con Windows (`cross-env`, runner Gradle JS).
- Plantillas `.env` alineadas con móvil; Render usa `npm ci`.
- Network security config creada y referenciada para HTTP plano.

## 3. Pasos de build verificados
1. `npm run build:server` ✅
2. `npm run build:mobile` ✅
3. `npm run android:apk:debug` ⚠️ → `JAVA_HOME is not set` (instalar JDK 17+).

Backend local tras compilar:
```
npm run build:server
node dist/server/index.js
```
(Express 5 requiere rutas válidas; con env completos arranca.)

## 4. Variables de entorno necesarias
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL` (`http://10.0.2.2:3001` en emulador)
- `VITE_USE_HASH_ROUTER=true`
- `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE`, `SUPABASE_JWT_SECRET`
- `PORT`, `CORS_ORIGIN`, `STRICT_ENV`, `ENABLE_SCHEDULERS`, `FEATURE_MIGRATIONS`, `FEATURE_SEED_DB`, `JWT_SECRET`, `VAPID_*`

## 5. Checklist Render
- Build: `npm ci && npm run build`
- Start: `npm start`
- Healthcheck: `/health`
- Variables: grupo `outdoor-team-env`

## 6. Diffs
```diff
diff --git a/.env.example b/.env.example
index 21cc1ff..4779cb7 100644
--- a/.env.example
+++ b/.env.example
@@ -4,9 +4,9 @@
 VITE_SUPABASE_URL=
 VITE_SUPABASE_ANON_KEY=
 # Optional: If your mobile app needs to connect to a different backend URL
-VITE_API_BASE_URL=
+VITE_API_BASE_URL=http://10.0.2.2:3001
 # Use HashRouter for Capacitor builds to avoid routing issues. Set to 'true' for mobile builds.
-VITE_USE_HASH_ROUTER=false
+VITE_USE_HASH_ROUTER=true
 
 # -- Backend (Server) --
 # Database Connection (for Kysely ORM)
@@ -44,3 +44,4 @@ VAPID_EMAIL=admin@outdoorteam.com
 # Security
 # Secret key for custom JWTs if not using Supabase Auth exclusively
 JWT_SECRET=your-secret-key-change-in-production
+
diff --git a/package-lock.json b/package-lock.json
index c835a33..1565695 100644
--- a/package-lock.json
+++ b/package-lock.json
@@ -71,6 +71,7 @@
         "@types/react-dom": "19.0.4",
         "@vitejs/plugin-react": "4.3.4",
         "autoprefixer": "10.4.18",
+        "cross-env": "^7.0.3",
         "ignore": "7.0.3",
         "postcss": "8.4.35",
         "rimraf": "^6.0.0",
@@ -4666,6 +4667,25 @@
         "node": ">= 0.10"
       }
     },
+    "node_modules/cross-env": {
+      "version": "7.0.3",
+      "resolved": "https://registry.npmjs.org/cross-env/-/cross-env-7.0.3.tgz",
+      "integrity": "sha512-+/HKd6EgcQCJGh2PSjZuUitQBQynKor4wrFbRg4DtAgS1aWO+gU52xpH7M9ScGgXSYmAVS9bIJ8EzuaGw0oNAw==",
+      "dev": true,
+      "license": "MIT",
+      "dependencies": {
+        "cross-spawn": "^7.0.1"
+      },
+      "bin": {
+        "cross-env": "src/bin/cross-env.js",
+        "cross-env-shell": "src/bin/cross-env-shell.js"
+      },
+      "engines": {
+        "node": ">=10.14",
+        "npm": ">=6",
+        "yarn": ">=1"
+      }
+    },
     "node_modules/cross-spawn": {
       "version": "7.0.6",
       "resolved": "https://registry.npmjs.org/cross-spawn/-/cross-spawn-7.0.6.tgz",
diff --git a/package.json b/package.json
index 5629c30..f146632 100644
--- a/package.json
+++ b/package.json
@@ -13,11 +13,11 @@
     "generate-vapid": "node scripts/generate-vapid.js",
     "db:migrate": "node scripts/migrate.js",
     "db:seed": "node scripts/seed.js",
-    "build:mobile": "CAPACITOR=true vite build && cap sync android",
-    "cap:sync": "cap sync android",
+    "build:mobile": "cross-env CAPACITOR=true vite build && npm run cap:sync",
+    "cap:sync": "npx cap sync android",
     "cap:open": "cap open android",
-    "android:apk:debug": "cd android && ./gradlew assembleDebug",
-    "android:apk:release": "cd android && ./gradlew assembleRelease"
+    "android:apk:debug": "node scripts/run-gradle.js assembleDebug",
+    "android:apk:release": "node scripts/run-gradle.js assembleRelease"
   },
   "engines": {
     "node": ">=18"
@@ -86,6 +86,7 @@
     "@types/react-dom": "19.0.4",
     "@vitejs/plugin-react": "4.3.4",
     "autoprefixer": "10.4.18",
+    "cross-env": "^7.0.3",
     "ignore": "7.0.3",
     "postcss": "8.4.35",
     "rimraf": "^6.0.0",
@@ -94,4 +95,4 @@
     "typescript": "5.8.2",
     "vite": "6.3.1"
   }
-}
+}
\ No newline at end of file
diff --git a/render.yaml b/render.yaml
index 7d067e3..ade7b1b 100644
--- a/render.yaml
+++ b/render.yaml
@@ -4,7 +4,7 @@ services:
     env: node
     plan: free
     rootDir: .
-    buildCommand: "npm install && npm run build"
+    buildCommand: "npm ci && npm run build"
     startCommand: "npm start"
     healthCheckPath: /health
     envVars:
@@ -45,3 +45,4 @@ envVarGroups:
         value: "" # Add your VAPID private key
       - key: VAPID_EMAIL
         value: "admin@outdoorteam.com"
+
diff --git a/server/utils/logging.ts b/server/utils/logging.ts
index d492a4c..71361a0 100644
--- a/server/utils/logging.ts
+++ b/server/utils/logging.ts
@@ -65,6 +65,19 @@ export class SystemLogger {
     });
   }
 
+  /** Helper para errores de autenticaci├│n */
+  static async logAuthError(
+    message: string,
+    email?: string,
+    req?: any
+  ): Promise<void> {
+    const metadata = email ? { email } : undefined;
+    await this.log('warn', message, {
+      req,
+      metadata,
+    });
+  }
+
   /** Trae ├║ltimos logs para dashboards */
   static async getRecent(level?: LogLevel, limit = 100) {
     let q = db!
@@ -84,7 +97,7 @@ export class SystemLogger {
 
     const { numDeletedRows } = await db!
       .deleteFrom('database_alerts')
-      .where('created_at', '<', cutoff.toISOString())
+      .where('created_at', '<', cutoff)
       .executeTakeFirst();
 
     const deleted =
@@ -95,3 +108,5 @@ export class SystemLogger {
     return deleted;
   }
 }
+
+
diff --git a/tsconfig.server.json b/tsconfig.server.json
index a40ba7a..87ad1f5 100644
--- a/tsconfig.server.json
+++ b/tsconfig.server.json
@@ -3,7 +3,7 @@
     "target": "ES2022",
     "module": "CommonJS",
     "moduleResolution": "Node",
-    "outDir": "dist/server",
+    "outDir": "dist",
     "rootDir": ".",
     "esModuleInterop": true,
     "resolveJsonModule": true,
@@ -13,8 +13,13 @@
     "allowSyntheticDefaultImports": true,
     "baseUrl": ".",
     "paths": {
-      "~shared/*": ["shared/*"]
-    }
+      "~shared/*": [
+        "shared/*"
+      ]
+    },
+    "types": [
+      "node"
+    ]
   },
   "include": [
     "server/**/*.ts",
diff --git a/scripts/run-gradle.js b/scripts/run-gradle.js
new file mode 100644
index 0000000..603fcf8
--- /dev/null
+++ b/scripts/run-gradle.js
@@ -0,0 +1,30 @@
+#!/usr/bin/env node
+const { spawnSync } = require('node:child_process');
+const path = require('node:path');
+const fs = require('node:fs');
+
+const tasks = process.argv.slice(2);
+if (tasks.length === 0) {
+  console.error('No Gradle task provided. Example: node scripts/run-gradle.js assembleDebug');
+  process.exit(1);
+}
+
+const androidDir = path.join(process.cwd(), 'android');
+if (!fs.existsSync(androidDir)) {
+  console.error('Android project directory not found. Run "npx cap add android" first.');
+  process.exit(1);
+}
+
+const gradleCommand = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
+
+const result = spawnSync(gradleCommand, tasks, {
+  cwd: androidDir,
+  stdio: 'inherit',
+  shell: process.platform === 'win32',
+});
+
+if (result.error) {
+  console.error('Gradle execution failed:', result.error.message);
+}
+
+process.exit(result.status ?? 1);
diff --git a/android/app/src/main/res/xml/network_security_config.xml b/android/app/src/main/res/xml/network_security_config.xml
new file mode 100644
index 0000000..d4c447f
--- /dev/null
+++ b/android/app/src/main/res/xml/network_security_config.xml
@@ -0,0 +1,7 @@
+<?xml version="1.0" encoding="utf-8"?>
+<network-security-config>
+  <domain-config cleartextTrafficPermitted="true">
+    <domain includeSubdomains="true">10.0.2.2</domain>
+    <domain includeSubdomains="true">localhost</domain>
+  </domain-config>
+</network-security-config>
```
