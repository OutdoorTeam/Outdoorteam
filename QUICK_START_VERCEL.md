# ⚡ Quick Start: Despliegue en Vercel desde VS Code

## ✅ Prerequisitos Completados

- [x] Proyecto configurado para Vercel
- [x] Dependencias instaladas (`@vercel/node`)
- [x] Configuración serverless lista
- [x] Build exitoso verificado
- [x] Supabase conectado

---

## 🚀 Pasos Rápidos (5 minutos)

### 1️⃣ Vincular con Vercel desde VS Code

#### Opción A: Extensión de Vercel (Recomendado)

1. **Abrir Command Palette**: `Ctrl+Shift+P` (Windows/Linux) o `Cmd+Shift+P` (Mac)

2. **Ejecutar**: `Vercel: Login to Vercel`
   - Se abrirá el navegador para autenticación
   - Autorizar VS Code

3. **Vincular proyecto**: `Vercel: Link to Existing Project` o `Vercel: Create New Project`
   - Seleccionar tu cuenta/team
   - Nombre del proyecto: `outdoor-team` (o el que prefieras)

4. **Configurar**:
   - Framework: `Vite`
   - Build Command: Ya configurado en `vercel.json`
   - Output Directory: Ya configurado en `vercel.json`

#### Opción B: CLI de Vercel

```bash
# Instalar CLI
npm i -g vercel

# Login
vercel login

# Link proyecto
vercel link
```

---

### 2️⃣ Configurar Variables de Entorno en Vercel

#### Desde Vercel Dashboard:

1. **Ir a**: https://vercel.com/dashboard
2. **Seleccionar tu proyecto** → Settings → Environment Variables
3. **Copiar estas variables** (ajustar valores según corresponda):

```bash
# === FRONTEND ===
VITE_SUPABASE_URL=https://jkgbaaqnfycbjylustan.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZ2JhYXFuZnljYmp5bHVzdGFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTg1MDksImV4cCI6MjA3MzY5NDUwOX0.268tOs3eC9VipN85qwCZzDwMwQsaCt_lYzELjc-POAM
VITE_API_BASE_URL=https://TU-PROYECTO.vercel.app
VITE_USE_HASH_ROUTER=false

# === BACKEND ===
DATABASE_URL=postgresql://postgres.jkgbaaqnfycbjylustan:Xwsz3IlSl3TmNtLU@aws-1-sa-east-1.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://jkgbaaqnfycbjylustan.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZ2JhYXFuZnljYmp5bHVzdGFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTg1MDksImV4cCI6MjA3MzY5NDUwOX0.268tOs3eC9VipN85qwCZzDwMwQsaCt_lYzELjc-POAM
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (USAR EL SERVICE_ROLE REAL)
SUPABASE_JWT_SECRET=OqsdxRP5kyefjhig/2KLO5QOuKNpIwlExDGG5I3gFwm9e8eCM+SIK7OpLgk9+fCnc4qyQI/pSyK2WGn8sudu2g==

# === SISTEMA ===
NODE_ENV=production
VERCEL=1

# === CORS (Actualizar después del deploy) ===
CORS_ORIGIN=https://TU-PROYECTO.vercel.app,capacitor://localhost

# === OPCIONAL ===
INTERNAL_API_KEY=tu-clave-secreta
DB_SSL_REJECT_UNAUTHORIZED=false
```

4. **Configurar scope** de cada variable:
   - **Production + Preview + Development** para todas

---

### 3️⃣ Verificar Conexión con Supabase en VS Code

#### Extensión de Supabase:

1. **Abrir Command Palette**: `Ctrl+Shift+P`

2. **Ejecutar**: `Supabase: Link to Project`

3. **Seleccionar**:
   - Project: `jkgbaaqnfycbjylustan`
   - Database password: (si lo pide)

4. **Verificar**:
   ```bash
   # Desde terminal integrada de VS Code
   npx supabase status
   ```

   Debería mostrar:
   ```
   Project: jkgbaaqnfycbjylustan
   API URL: https://jkgbaaqnfycbjylustan.supabase.co
   Status: Connected ✅
   ```

---

### 4️⃣ Desplegar a Vercel

#### Desde VS Code:

1. **Command Palette** → `Vercel: Deploy Current Project to Production`

2. **O Deploy a Preview**:
   - Command Palette → `Vercel: Deploy Current Project to Preview`

#### Desde CLI:

```bash
# Deploy a producción
vercel --prod

# Deploy a preview
vercel
```

#### Automático (Git):

- **Push a `main`** → Deploy automático a producción
- **Push a otra rama** → Deploy automático a preview

---

### 5️⃣ Post-Deploy: Actualizar Variables

Una vez obtengas tu URL de Vercel (ej: `https://outdoor-team-abc123.vercel.app`):

1. **Actualizar en Vercel Dashboard**:
   - `VITE_API_BASE_URL=https://outdoor-team-abc123.vercel.app`
   - `CORS_ORIGIN=https://outdoor-team-abc123.vercel.app,capacitor://localhost`

2. **Re-deploy** para aplicar cambios:
   ```bash
   vercel --prod
   ```

---

### 6️⃣ Configurar Supabase para Vercel

1. **Ir a Supabase Dashboard**: https://app.supabase.com/project/jkgbaaqnfycbjylustan

2. **Authentication** → **URL Configuration**:
   - **Site URL**: `https://TU-PROYECTO.vercel.app`
   - **Redirect URLs**:
     ```
     https://TU-PROYECTO.vercel.app/**
     http://localhost:3000/**
     capacitor://localhost/**
     ```

3. **Database** → **Settings** → **Connection Pooling**:
   - ✅ Verificar que esté habilitado (para Vercel serverless)

---

## ✅ Checklist Final

- [ ] Vercel vinculado en VS Code
- [ ] Variables de entorno configuradas en Vercel
- [ ] Supabase vinculado en VS Code
- [ ] Primera deploy exitosa
- [ ] URLs actualizadas en variables de entorno
- [ ] Re-deploy realizado
- [ ] Supabase configurado con URL de Vercel
- [ ] Testing de endpoints:
  - [ ] `https://TU-PROYECTO.vercel.app` (frontend)
  - [ ] `https://TU-PROYECTO.vercel.app/api/health` (backend)
  - [ ] Login funcional
  - [ ] Dashboard carga datos

---

## 🧪 Testing Rápido

```bash
# 1. Verificar frontend
curl https://TU-PROYECTO.vercel.app

# 2. Verificar API health
curl https://TU-PROYECTO.vercel.app/api/health

# 3. Test de autenticación (desde el browser)
# Ir a: https://TU-PROYECTO.vercel.app/login
# Ingresar credenciales de prueba
```

---

## 🔧 Comandos Útiles de VS Code

### Vercel:
- `Vercel: Deploy Current Project to Production`
- `Vercel: Deploy Current Project to Preview`
- `Vercel: Open Project Dashboard`
- `Vercel: View Deployment Logs`
- `Vercel: Link to Existing Project`

### Supabase:
- `Supabase: Link to Project`
- `Supabase: Start` (local dev)
- `Supabase: Stop`
- `Supabase: Generate Types`

---

## 📱 Siguiente Paso: APK para Android

Una vez Vercel esté funcionando:

1. **Actualizar `.env`**:
   ```bash
   VITE_API_BASE_URL=https://TU-PROYECTO.vercel.app
   ```

2. **Build APK**:
   ```bash
   npm run build:mobile
   npm run cap:sync
   npm run android:apk:debug
   ```

3. **APK ubicado en**:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

---

## 🆘 Troubleshooting

### Deploy falla con "Build error"
→ Revisar logs en Vercel Dashboard → Deployments → Click en deploy fallido

### API retorna 404
→ Verificar que `api/[[...path]].ts` existe y `vercel.json` tiene rewrites

### CORS errors en producción
→ Actualizar `CORS_ORIGIN` con tu dominio real de Vercel

### Supabase auth no funciona
→ Verificar `SUPABASE_JWT_SECRET` y URLs de redirect en Supabase Dashboard

---

## 📚 Referencias

- [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) - Guía completa
- [CLAUDE.md](CLAUDE.md) - Documentación del proyecto
- [README.md](README.md) - Instrucciones generales
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
