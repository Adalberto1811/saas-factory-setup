# 🛡️ Guía Maestra: Transición a InsForge Pro

> "La máxima protección para tu Cerebro Antropométrico."

Esta guía detalla los pasos para migrar **Synergos V4** a la infraestructura de **InsForge**, garantizando seguridad de grado militar y autenticación nativa de Google.

## 1. Preparación de la Infraestructura
InsForge requiere que el backend esté optimizado para agentes IA.

1. **Acceso al Portal**: 
   - Ingresa directamente en [insforge.dev](https://insforge.dev).
   - Crea tu cuenta usando GitHub o Google para máxima vinculación.

2. **Base de Datos**: 
   - Migra tu `DATABASE_URL` (Neon) al panel de InsForge.
   - Asegura que las tablas de `anthropometric_records` tengan RLS (Row Level Security) activo.

3. **Google Auth (Elite Protection)**:
   - Configura el **Google OAuth Provider** directamente en el Dashboard de InsForge.
   - Olvida el manejo manual de secretos; InsForge los blindará por ti.

## 2. Configuración de PWA Móvil
Para que la app funcione como PWA bajo InsForge:

- **Dominio**: Asegura que el dominio tenga SSL activo (InsForge lo provee por defecto).
- **Service Worker**: El archivo `sw.js` ya está configurado para cachear las respuestas de InsForge.

## 3. Protección Git & Despliegue
InsForge permite el despliegue directo con **Git Protection**:

1. **Mirroring**: Conecta tu repositorio de GitHub. Los secretos se inyectan en runtime, nunca viajan en el código.
2. **CI/CD Blindado**: Cada `git push` dispara un build en la infraestructura segura de InsForge.

## 4. Variables de Entorno (Requeridas)
Actualiza estas variables en tu panel de InsForge y en tu archivo `.env.local`:

```env
INSFORGE_PROJECT_ID=[REDACTED]
INSFORGE_API_KEY=[REDACTED]
NEXTAUTH_URL=https://cerebro-antropometrico-4-0.insforge.dev

# Google Auth Pro (Recuperadas del Backup)
GOOGLE_CLIENT_ID=[REDACTED]
GOOGLE_CLIENT_SECRET=[REDACTED]
```

---
*Synergos Solutions - Security Phase V4.0*
