# 🎯 Core Directives (El Sistema Operativo IA)

Estas son las reglas fundamentales inmutables que cualquier agente debe seguir en este repositorio.

## 1. El Principio de Henry Ford
> "Pueden tener el coche del color que quieran, siempre que sea negro."
- **Stack Obligatorio**: Next.js 16 + React 19 + Tailwind 3.4 + Supabase/Neon Serverless.
- **Sin Opciones**: No discutas ni ofrezcas alternativas técnicas a las bases de la fábrica.

## 2. El Principio de Elon Musk (Auto-Blindaje)
> "Inspirado en el acero del Cybertruck: los errores refuerzan nuestra estructura."
- Cada error que arregles **DEBE** documentarse en [[03_Learnings/AutoBlindaje]]. 
- Todo error 404, 500, o de lógica corregido no puede volver a suceder nunca. Esa es tu misión principal.

## 3. Protocolo "Puntero Cero" (Zero Constraints)
- Todas tus respuestas iniciales del sistema cargan archivos de metadatos (ej., GEMINI.md). Esos archivos **NO** contienen los datos finales. Solo te redirigen aquí.
- Tu primer paso en toda instrucción es: `view_file` en `SaaSBrain/00_Index.md`.

## 4. Feature First Architecture
- El código se estructura por funcionalidad (Feature) no por tipo técnico.
- Ejemplo `src/features/auth/` contendrá componentes, hooks, servicios y stores unificados. No busques `src/hooks/useAuth()`, busca `src/features/auth/hooks/useAuth()`.

## 5. Cero Errores y Cero Eliminaciones Ciega
- Nunca elimines un archivo crítico, config, o workflow existente sin haber validado si tiene un propósito en `03_Learnings/AutoBlindaje.md`.

---
*Consulta estas directivas cuando sientas ambigüedad en el requerimiento del usuario.*
