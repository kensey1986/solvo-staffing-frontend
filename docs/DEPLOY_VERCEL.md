# Guía de Deploy a Vercel - Solvo Staffing Frontend

## Prerequisitos

- Node.js v20.x instalado
- Vercel CLI instalado (`npm i -g vercel`)
- Acceso a la cuenta de Vercel del proyecto

---

## 1. Verificar cuenta de Vercel

### 1.1 Ver cuenta actual
```bash
vercel whoami
```

Si el resultado muestra una cuenta diferente a `kenshin1986`, debes cambiar de cuenta.

### 1.2 Cerrar sesión de cuenta incorrecta
```bash
vercel logout
```

### 1.3 Iniciar sesión con la cuenta correcta
```bash
vercel login
```

Esto abrirá el navegador para autenticarte. Asegúrate de seleccionar la cuenta correcta.

---

## 2. Verificar vinculación del proyecto

### 2.1 Verificar que el proyecto está vinculado
```bash
vercel project ls
```

Deberías ver `solvo-staffing-frontend` en la lista.

### 2.2 Si el proyecto no está vinculado
```bash
vercel link
```

Selecciona:
- **Scope:** `kenshin1986's projects`
- **Project:** `solvo-staffing-frontend`

---

## 3. Deploy

### 3.1 Deploy a Preview (desarrollo/testing)
```bash
vercel
```

Esto desplegará una versión de preview que puedes usar para testing.

### 3.2 Deploy a Production
```bash
vercel --prod
```

Esto desplegará directamente a producción.

---

## 4. URLs del proyecto

| Entorno | URL |
|---------|-----|
| Production | https://solvo-staffing-frontend.vercel.app |
| Dashboard | https://vercel.com/kenshin1986s-projects/solvo-staffing-frontend |

---

## 5. Configuración del proyecto

El archivo `vercel.json` contiene la configuración de build:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build:prod",
  "outputDirectory": "dist/solvo-staffing-frontend/browser",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "angular",
  "env": {
    "USE_MOCK_SERVICES": "true",
    "PRODUCTION": "false"
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 6. Variables de Entorno

### 6.1 Ver variables configuradas en Vercel
```bash
vercel env ls
```

### 6.2 Agregar nueva variable de entorno
```bash
vercel env add NOMBRE_VARIABLE
```

### 6.3 Variables requeridas

| Variable | Descripción | Valor Default |
|----------|-------------|---------------|
| `USE_MOCK_SERVICES` | Usar servicios mock | `true` |
| `PRODUCTION` | Modo producción | `false` |
| `API_BASE_URL` | URL base del API | `http://localhost:3000/api` |

---

## 7. Comandos útiles

### Ver logs del último deploy
```bash
vercel logs <URL_DEL_DEPLOY>
```

### Inspeccionar un deploy
```bash
vercel inspect <URL_DEL_DEPLOY>
```

### Listar deploys recientes
```bash
vercel ls
```

### Rollback a un deploy anterior
```bash
vercel rollback
```

### Eliminar un deploy
```bash
vercel remove <URL_DEL_DEPLOY>
```

---

## 8. Desactivar Protección de Deploy

Para que los deployments sean públicos sin requerir autenticación de Vercel:

### 8.1 Vía Dashboard
1. Ve a: https://vercel.com/kenshin1986s-projects/solvo-staffing-frontend/settings
2. Navega a **Deployment Protection** en el menú lateral
3. Desactiva **"Vercel Authentication"**
4. Guarda los cambios

### 8.2 Cuándo desactivar la protección
- Cuando necesites compartir URLs de preview con clientes externos
- Para demos públicas
- Para testing con usuarios sin cuenta Vercel

> ⚠️ **Nota:** Desactivar la protección hace que cualquier persona con el enlace pueda acceder al deploy.

---

## 9. Deploy automático con Git

El proyecto está configurado para deploy automático desde GitHub:

- **Branch `main`** → Deploy a Production
- **Otras branches** → Deploy Preview

Para activar/desactivar el deploy automático:
1. Ve a https://vercel.com/kenshin1986s-projects/solvo-staffing-frontend/settings/git
2. Configura las opciones de "Production Branch" y "Preview Branches"

---

## 9. Troubleshooting

### Error: `ng: command not found`
**Causa:** El CLI de Angular no está disponible globalmente en Vercel.
**Solución:** Asegúrate de que `vercel.json` use `npm run build:prod` en lugar de `ng build`.

### Error: `npm install` falla
**Causa:** Conflictos de dependencias peer.
**Solución:** Usa `npm install --legacy-peer-deps` en `installCommand`.

### Error: Output directory not found
**Causa:** El directorio de salida no coincide con la configuración de Angular.
**Solución:** Verifica que `outputDirectory` en `vercel.json` sea `dist/solvo-staffing-frontend/browser`.

### Error: 404 en rutas de Angular
**Causa:** Vercel no redirige las rutas a `index.html`.
**Solución:** Asegúrate de tener la configuración de `rewrites` en `vercel.json`.

---

## 10. Checklist pre-deploy

- [ ] Verificar que estás en la cuenta correcta de Vercel (`vercel whoami`)
- [ ] Verificar que estás en la rama correcta (`git branch`)
- [ ] Asegurarte de que todos los cambios están commiteados
- [ ] Ejecutar tests localmente (`npm test`)
- [ ] Ejecutar build localmente (`npm run build:prod`)
- [ ] Revisar variables de entorno si es necesario

---

## 11. Contacto y soporte

- **Dashboard de Vercel:** https://vercel.com/kenshin1986s-projects/solvo-staffing-frontend
- **Repositorio GitHub:** https://github.com/kensey1986/solvo-staffing-frontend
