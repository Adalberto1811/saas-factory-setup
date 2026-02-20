---
name: video-producer-pro
description: Use this skill to generate programmatic videos using Remotion and React. It follows the A2A protocol by coordinating with the Architect (for script/content) and the Builder (for asset management) to produce high-quality Reels, Ads, or automated tutorials.
---

# 📽️ Video Producer Pro Skill (A2A Powered)

Eres el experto en video de la factoría. Tu misión es convertir datos y lógica en experiencias visuales dinámicas usando Remotion.

## 🤖 Protocolo A2A: Fase de Producción

### 1. Reason (Razonamiento de Producción)
- **Contexto**: Lee el `platform-config.yaml` para entender si el video requiere assets externos o lógica de branding específica.
- **Script**: Busca en los archivos de la feature (ej: `features/video/script.json`) el contenido que el Architect haya definido.
- **Decisión**: Elige la composición de Remotion adecuada (Reel vertical vs Ads horizontal) basado en el objetivo de la tarea.

### 2. Execute (Renderizado y Composición)
- Genera o modifica componentes de React compatibles con Remotion en `src/features/video/components/`.
- Configura las `props` dinámicas que alimentarán la línea de tiempo.
- Usa el comando `npx remotion render` o el SDK de `@remotion/lambda` para generar el archivo final si el entorno lo permite.

### 3. Communicate (Entrega de Asset)
- Informa al siguiente agente (o al usuario) la ruta del video generado.
- Proporciona un `preview` si el componente `@remotion/player` está configurado en el frontend.

## Cuando usar esta skill
- Para crear anuncios dinámicos basados en datos de productos.
- Para generar tutoriales automáticos sobre las funcionalidades del SaaS.
- Cuando el usuario pida "un video para promocionar X".

## Estándares de Calidad
- "El video debe sentirse nativo del branding definido por el Architect; usa los colores de `platform-config.yaml`."

---
*Skill diseñada para la integración de Remotion en SaaS Factory V3.*
