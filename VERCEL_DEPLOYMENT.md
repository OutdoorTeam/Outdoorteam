# 🚀 Guía de Despliegue en Vercel

Esta guía te ayudará a desplegar **Outdoor Team** en Vercel con integración de Supabase.

## 📋 Prerequisitos

✅ Cuenta en [Vercel](https://vercel.com)
✅ Proyecto de Supabase configurado
✅ Extensión de Vercel instalada en VS Code
✅ Extensión de Supabase instalada en VS Code

---

## 🔧 Configuración del Proyecto

### 1. Estructura de Archivos para Vercel

El proyecto ya está configurado con:

- **[vercel.json](vercel.json)** - Configuración principal de Vercel
- **[.vercelignore](.vercelignore)** - Archivos ignorados en el build
- **[api/[[...path]].ts](api/[[...path]].ts)** - Serverless function handler
- **[.env.production](.env.production)** - Plantilla de variables de entorno

### 2. Arquitectura del Despliegue

```
┌─────────────────────────────────────────┐
│           VERCEL DEPLOYMENT              │
├─────────────────────────────────────────┤
│                                          │
│  Frontend (Vite + React)                 │
│  └─ dist/public/                         │
│     ├─ index.html                        │
│     ├─ assets/                           │
│     └─ ...                               │
│                                          │
│  Backend (Serverless Functions)          │
│  └─ api/[[...path]].ts                   │
│     └─ Proxy to Express app              │
│                                          │
└─────────────────────────────────────────┘
           ↓                    ↓
    ┌──────────┐         ┌──────────────┐
    │  Supabase │         │  PostgreSQL  │
    │   Auth    │         │   Database   │
    └──────────┘         └──────────────┘
```

---

## 🚀 Pasos de Despliegue

### Opción 1: Desde VS Code (Recomendado)

1. **Abrir Command Palette** (`Ctrl+Shift+P` o `Cmd+Shift+P`)

2. **Ejecutar**: `Vercel: Deploy Current Project`

3. **Seleccionar** configuración:
   - Framework Preset: `Vite`
   - Build Command: `npm run build:web` (ya configurado en vercel.json)
   - Output Directory: `dist/public` (ya configurado)

4. **Esperar** el despliegue (3-5 minutos aproximadamente)

### Opción 2: Desde Vercel Dashboard

1. Ir a [vercel.com/new](https://vercel.com/new)

2. **Importar** tu repositorio de GitHub

3. **Configurar** el proyecto:
   - Framework Preset: **Vite**
   - Build Command: `npm run build:web`
   - Output Directory: `dist/public`
   - Install Command: `npm ci`

4. **NO HACER DEPLOY** todavía → Primero configurar variables de entorno

---

## 🔐 Configuración de Variables de Entorno

### En Vercel Dashboard:

1. Ir a tu proyecto → **Settings** → **Environment Variables**

2. **Agregar las siguientes variables** (copiar de [.env.production](.env.production)):

#### **Variables del Frontend** (Production + Preview + Development)
```
VITE_SUPABASE_URL=https://jkgbaaqnfycbjylustan.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_BASE_URL=https://tu-proyecto.vercel.app
VITE_USE_HASH_ROUTER=false
```

#### **Variables del Backend** (Production + Preview + Development)
```
DATABASE_URL=postgresql://postgres.jkgbaaqnfycbjylustan:Xwsz3IlSl3TmNtLU@aws-1-sa-east-1.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://jkgbaaqnfycbjylustan.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (⚠️ usar el SERVICE_ROLE real)
SUPABASE_JWT_SECRET=OqsdxRP5kyefjhig/2KLO5QOuKNpIwlExDGG5I3gFwm9e8eCM+SIK7OpLgk9+fCnc4qyQI/pSyK2WGn8sudu2g==
```

#### **Variables de Sistema** (Production solamente)
```
NODE_ENV=production
VERCEL=1
```

#### **CORS** (Production + Preview)
```
CORS_ORIGIN=https://tu-proyecto.vercel.app,capacitor://localhost
```

#### **Opcional** (si se requiere)
```
INTERNAL_API_KEY=tu-key-secreta
DB_SSL_REJECT_UNAUTHORIZED=false
```

3. **Actualizar** `VITE_API_BASE_URL` y `CORS_ORIGIN` con tu URL de Vercel real después del primer deploy

---

## 🔗 Vinculación con Supabase (VS Code)

### Desde la Extensión de Supabase:

1. **Abrir Command Palette** → `Supabase: Link to Project`

2. **Seleccionar** tu proyecto existente: `jkgbaaqnfycbjylustan`

3. **Confirmar** las credenciales:
   - URL: `https://jkgbaaqnfycbjylustan.supabase.co`
   - Service Role Key: (automático)

4. **Verificar** conexión:
   ```bash
   npx supabase status
   ```

---

## ✅ Checklist Pre-Deploy

- [ ] Variables de entorno configuradas en Vercel
- [ ] `vercel.json` configurado correctamente
- [ ] Build local exitoso: `npm run build:web`
- [ ] Supabase vinculado en VS Code
- [ ] Base de datos migrada: `npm run db:migrate:v2`
- [ ] `.vercelignore` creado
- [ ] CORS_ORIGIN incluye el dominio de Vercel

---

## 🧪 Testing Post-Deploy

### 1. Verificar Frontend
```bash
curl https://tu-proyecto.vercel.app
# Debe retornar el HTML de la app
```

### 2. Verificar API Backend
```bash
curl https://tu-proyecto.vercel.app/api/health
# Debe retornar: {"status":"ok","timestamp":"..."}
```

### 3. Verificar Autenticación
1. Ir a `https://tu-proyecto.vercel.app/login`
2. Intentar login con credenciales de prueba
3. Verificar que se crea sesión en Supabase

### 4. Verificar Base de Datos
```bash
curl https://tu-proyecto.vercel.app/api/activities/catalog
# Debe retornar listado de actividades (requiere auth)
```

---

## 🐛 Troubleshooting

### Error: "Build failed"
**Solución**: Revisar logs en Vercel Dashboard → Deployments → Click en el deploy fallido

### Error: "API routes returning 404"
**Solución**:
- Verificar que `api/[[...path]].ts` existe
- Revisar `vercel.json` → `rewrites` está configurado

### Error: "Database connection failed"
**Solución**:
- Verificar `DATABASE_URL` en variables de entorno de Vercel
- Confirmar que Supabase permite conexiones desde `0.0.0.0/0` (o agregar IPs de Vercel)

### Error: "CORS blocked"
**Solución**:
- Actualizar `CORS_ORIGIN` con tu dominio real de Vercel
- Re-deploy después de cambiar variables de entorno

### Error: "Supabase auth not working"
**Solución**:
- Verificar `SUPABASE_JWT_SECRET` es correcto
- En Supabase Dashboard → Authentication → URL Configuration:
  - Site URL: `https://tu-proyecto.vercel.app`
  - Redirect URLs: `https://tu-proyecto.vercel.app/**`

---

## 🔄 Actualizar Deployment

### Desde VS Code:
1. **Hacer cambios** en el código
2. **Commit** a Git
3. **Push** a GitHub/GitLab
4. **Auto-deploy** se activa (si configurado)

### O Manualmente:
```bash
# Desde VS Code Command Palette
Vercel: Deploy Current Project
```

---

## 📱 Configuración para APK (Capacitor)

Una vez desplegado en Vercel, actualizar variables para mobile:

### En `.env`:
```bash
VITE_API_BASE_URL=https://tu-proyecto.vercel.app
```

### Build APK:
```bash
npm run build:mobile
npm run cap:sync
npm run android:apk:debug
```

---

## 🎯 Próximos Pasos

1. ✅ Deploy exitoso en Vercel
2. ⬜ Configurar dominio personalizado (opcional)
3. ⬜ Habilitar Analytics de Vercel
4. ⬜ Configurar CI/CD automático
5. ⬜ Setup de staging environment (preview)
6. ⬜ Configurar logs y monitoring

---

## 📚 Recursos

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [CLAUDE.md](CLAUDE.md) - Documentación del proyecto

---

## 🆘 Soporte

Si encuentras problemas:
1. Revisar logs en Vercel Dashboard
2. Verificar variables de entorno
3. Consultar CLAUDE.md para arquitectura del proyecto
4. Revisar [issues en GitHub](enlace-a-tu-repo/issues)
