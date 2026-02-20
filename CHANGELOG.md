# Changelog

All notable changes to this project will be documented in this file.

## [3.1.0] - 2025-01-11

### System Prompt Cleanup

**Theme: "Menos ruido, misma funcionalidad"**

### Changed

#### CLAUDE.md (System Prompt)
- **AI Engine en Golden Path**: Añadido `Vercel AI SDK v5 + OpenRouter` a la tabla del stack
- **Sección AI Engine simplificada**: Reducida a una sola línea que referencia `.claude/ai_templates/_index.md`
- **PRPs con ubicación explícita**: Añadida tabla con archivos y propósitos

### Philosophy

El System Prompt no debe duplicar información que ya existe en otros archivos. Una referencia simple es suficiente cuando el archivo destino (`_index.md`) ya contiene toda la documentación necesaria.

---

## [3.0.0] - 2025-01-09

### SaaS Factory V3: The Self-Hardening Factory

**Theme: "La Tesla Factory aplicada al software"**

V3 introduce la analogía de la Tesla Factory y el sistema Auto-Blindaje que hace que la fábrica se fortalezca con cada error.

### Added

#### Tesla Factory Analogy
Nueva metáfora que unifica todo el sistema:

| Componente Tesla | Tu Sistema | Archivo/Herramienta |
|------------------|------------|---------------------|
| **Factory OS** | Cerebro del agente | `CLAUDE.md` / `GEMINI.md` |
| **Blueprints** | Especificaciones de features | `.claude/PRPs/*.md` |
| **Control Room** | Humano que aprueba | Tú preguntas, él valida |
| **Robot Arms** | Manos (editar código, DB) | Supabase MCP + Terminal |
| **Eyes/Cameras** | Visión del producto | Playwright MCP |
| **Quality Control** | Validación automática | Next.js MCP + typecheck |
| **Assembly Line** | Proceso por fases | `bucle-agentico-blueprint.md` |
| **Neural Network** | Aprendizaje continuo | Auto-Blindaje |

#### Auto-Blindaje System
Sistema que hace que la fábrica mejore con cada error:
```
Error ocurre → Se arregla → Se DOCUMENTA → NUNCA ocurre de nuevo
```

Archivos participantes:
- **PRP actual**: Errores específicos de esta feature
- **`.claude/prompts/*.md`**: Errores que aplican a múltiples features
- **`CLAUDE.md`**: Errores críticos que aplican a TODO el proyecto

#### Sección "Aprendizajes" en CLAUDE.md
Nueva sección activa que crece con cada error encontrado.

### Changed

#### CLAUDE.md & GEMINI.md (Complete Rewrite)
- Reducido de 435 a ~280 líneas (más enfocado)
- Añadida analogía Tesla Factory prominente
- Añadida sección Auto-Blindaje con archivos participantes
- Principios KISS/YAGNI/DRY/SOLID ahora como "Reglas de Código"
- Eliminado ejemplo de Python (era confuso en proyecto TypeScript)
- Sección "Aprendizajes" activa al final

#### prp-base.md
- Renombrado de "destino del tren" a "blueprint de la fábrica"
- Añadida referencia a Tesla Factory
- Sección "Aprendizajes" ahora menciona "Neural Network"

#### README.md Principal
- Actualizado a V3 con analogía Tesla Factory
- Sección "El Sistema que Mejora Solo" prominente
- Diagrama de cierre actualizado

### Removed
- **`.claude/PRPs/README.md`**: Consolidado en `prp-base.md`
- **`.claude/PRPs/templates/`**: Directorio eliminado, template en `prp-base.md`
- Referencias a Python (uvicorn, dev_server.py)

### Philosophy

**V3 representa un cambio fundamental:**
- V2: Sistema de comandos inteligentes
- V3: **Fábrica que se blinda sola**

La clave es el Auto-Blindaje: cada error documentado refuerza la estructura para que el mismo error NUNCA ocurra de nuevo.

*"Como el acero del Cybertruck: cada error es un impacto que refuerza nuestra estructura. Blindamos el proceso para que la falla nunca se repita."*

---

## [2.4.0] - 2025-12-17

### AI Templates Reorganization + Lifecycle Commands

**Theme: "No todo necesita ser un agente"**

Se reorganiza el sistema de AI templates separando agentes (secuenciales) de capacidades standalone (independientes).

### Added

#### Lifecycle Commands
- **`/update-sf`**: Actualiza `.claude/` desde el repo SF (encuentra alias, git pull, copia)
- **`/eject-sf`**: Remueve todos los rastros de SF para distribución de producto (destructivo)
- **`.claude/README.md`**: Documentación canónica del template

#### AI Templates Standalone (Nuevos)
- **`single-call.md`**: Llamada simple a LLM con `generateText()` - botones, acciones puntuales
- **`structured-outputs.md`**: JSON tipado con Zod schemas (en optimización)
- **`generative-ui.md`**: Componentes React dinámicos generados por AI (en optimización)

#### AI Templates Agents (Nuevo bloque)
- **`06-rag-basico.md`**: RAG con Supabase pgvector - embeddings, chunking, búsqueda semántica

### Changed

#### Estructura AI Templates
```
ai_templates/
├── _index.md              # Índice actualizado
├── agents/                # Secuenciales (7 bloques)
│   ├── 00-setup-base.md
│   ├── 01-chat-streaming.md
│   ├── 01-alt-action-stream.md
│   ├── 02-web-search.md
│   ├── 03-historial-supabase.md
│   ├── 04-vision-analysis.md
│   ├── 05-tools-funciones.md
│   └── 06-rag-basico.md   # NUEVO
├── single-call.md         # NUEVO
├── structured-outputs.md  # NUEVO
└── generative-ui.md       # NUEVO
```

#### Mejoras UX en Templates
- **04-vision-analysis.md**: Cmd+V para pegar imágenes, ImagePreviewBar encima del input
- **01-chat-streaming.md**: ThinkingIndicator minimalista ("thinking...")
- **01-alt-action-stream.md**: ThinkingToggle expandible, validación de acciones

### Philosophy

**La distinción clave:**
- `agents/` = Flujo secuencial para conversaciones (useChat, streaming)
- `standalone/` = Capacidades puntuales (generateText, generateObject)

*"No todo necesita ser un agente. A veces un botón es suficiente."*

---

## [2.3.0] - 2025-12-14

### Historial Template Upgrade to Action Stream

**Theme: "Persistencia para agentes transparentes"**

Upgrade completo del template de historial para soportar el patrón Action Stream.

### Added

#### Schema para Action Stream
- **`agent_sessions`**: Tabla de sesiones con título auto-generado y modelo seleccionable
- **`agent_actions`**: Tabla de acciones con contenido JSONB
- **7 tipos de acción tipados**: think, message, ask, calculate, tool, search, error
- **CHECK constraint** para validar tipos de acción

#### Optimizaciones
- **Batch save**: Guardado en lote para mejor performance
- **Índices optimizados**: Para queries frecuentes
- **Auto-title**: Generación automática de título desde primer mensaje

#### UI
- **Sidebar mobile-responsive**: Con confirmación de eliminación
- **Model selection per session**: Elegir modelo por conversación

### Technical

Nuevo schema SQL:
```sql
-- agent_sessions: id, user_id, title, model, created_at, updated_at
-- agent_actions: id, session_id, type, content (JSONB), created_at
-- CHECK constraint: type IN ('think','message','ask','calculate','tool','search','error')
```

---

## [2.2.0] - 2025-12-12

### PRP System Simplification + AI Templates LEGO

**Theme: "Simplificar para escalar"**

Se simplifica el sistema PRP y se añade el sistema modular de AI templates.

### Added

#### AI Templates - Sistema LEGO (7 bloques)
Nueva carpeta `ai_templates/` con componentes modulares:
- **00-setup-base**: Config inicial SDK v5 + OpenRouter
- **01-chat-streaming**: Hook useChat implementation
- **01-alt-action-stream**: Patrón de agente transparente (inspirado en tldraw)
- **02-web-search**: Sufijo `:online` para búsqueda web
- **03-historial-supabase**: Persistencia de conversaciones
- **04-vision-analysis**: Análisis de imágenes con Gemini/GPT-4o
- **05-tools-funciones**: Definición de tools con Zod

#### Design Systems (5)
Nueva carpeta `design-systems/` con sistemas visuales:
- **neobrutalism**: Bordes duros, colores primarios, sombras offset
- **neumorphism**: Soft UI con sombras suaves
- **liquid-glass**: Glassmorphism con efectos líquidos
- **gradient-mesh**: Gradientes mesh complejos
- **bento-grid**: Layout de grids asimétricos

#### Metodologías Agentic
- **bucle-agentico-blueprint.md**: Metodología de planificación
- **bucle-agentico-sprint.md**: Metodología de ejecución
- **agent-action-stream.md**: Documentación del paradigma Action Stream

### Changed

#### PRP System
- **Removidos**: `ejecutar-prp.md`, `generar-prp.md` (comandos legacy)
- **Añadido**: `PRPs/README.md` con workflow documentado
- **Simplificado**: `prp_base.md` template más limpio
- **CLAUDE.md**: Actualizado para referenciar nuevo sistema PRP

#### Prompts Consolidados
- **Removidos** (consolidados o obsoletos):
  - `INVESTIGACION-CLAUDE-CODE-V2.md`
  - `agent-builder-pydantic.md`
  - `bucle-agentico.md` (reemplazado por blueprint/sprint)
  - `nextjs-16-guide.md`
  - `supabase-mcp-baas.md`

### Technical

Todos los AI templates siguen el estándar **Vercel AI SDK v5** para composabilidad:
- `UIMessage` como tipo común
- `streamText()` + `toUIMessageStreamResponse()`
- `useChat` de `@ai-sdk/react`
- OpenRouter como provider unificado

---

## [2.1.1] - 2025-12-06

### Hotfixes and Configuration Updates

### Fixed
- **CLAUDE.md**: Corregido nombre "Sebastian Gauch" → "Guillermo Rauch (CEO de Vercel)"
- **MCP config**: Corregido nombre del paquete `next-devtools-mcp` (removido prefijo `@vercel/`)
- **Environment**: Renombrado `.env.example` → `.env.local.example` para claridad

### Changed
- **Tailwind CSS**: Downgrade a versión estable
- **PostCSS/Autoprefixer**: Actualizadas dependencias
- **Codebase cleanup**: Eliminado `proxy.ts` no usado

### Added
- **`add-login` command**: Documentación para setup de autenticación B2B

---

## [2.1.0] - 2025-12-05

### 🤖 Agent-First Architecture Complete

**The Intersection: Ford + Musk + Rauch**

This release embodies the vision of three pioneers:
- **Henry Ford**: One perfected stack (no options, just execution)
- **Elon Musk**: The machine that builds the machine (commands > apps)
- **Guillermo Rauch**: Agent-First development (speed = intelligence)

### Added

#### Agent Role & Philosophy
- **"Tu Rol: Arquitecto Agent-First"** section in `saas-factory/CLAUDE.md`
- **DWY (Done With You) paradigm**: Human decides WHAT, Agent executes HOW
- **The 3 Principles**:
  1. Ford: Golden Path (no technical options)
  2. Musk: Process > Product (reusable systems)
  3. Rauch: Speed = Intelligence (100 iterations in 30 seconds)

#### Complete Project Structure
- **Feature-First Architecture** fully implemented in `src/`
- **Route Groups**: `app/(auth)/` and `app/(main)/` with layouts
- **Example Features**: `auth/` and `dashboard/` with complete folder structure
- **Shared Infrastructure**: 8 organized subdirectories (components, hooks, stores, types, utils, lib, constants, assets)
- **Template System**: `features/.template/` for rapid feature scaffolding
- **Documentation**: READMEs in every major directory explaining purpose and usage

#### Step-by-Step MCP Guide
- Added complete "Prendiendo el Next.js 16 MCP" guide to README.md
- 8-step process from `saas-factory` to running MCP
- Verification tests to confirm MCPs are working

### Changed

#### Documentation Overhaul
- **README.md**: Condensed from 424 to 228 lines (50% reduction, 20/80 principle)
- **Philosophy First**: Ford, Musk, Rauch quotes moved to top of README
- **Removed Technical Details**: Moved Agent-First Development details from README to CLAUDE.md
- **Workflow Consolidation**: Merged "Workflow Típico" and "Step-by-Step MCP" into single section

#### Stack Alignment
- **Updated all references**: Next.js 16, React 19, Tailwind 3.4
- **Removed Tailwind 4**: Unstable, reverted to 3.4 stable
- **Updated `/new-app` command**: Stack Confirmado section reflects correct versions

#### MCP Configuration
- **Fixed package names** in `.mcp.json`:
  - `@vercel/next-devtools-mcp@latest` (was `next-devtools-mcp`)
  - `@playwright/mcp@latest` (was `@anthropic-ai/playwright-mcp`)
  - Reordered: Next.js → Playwright → Supabase (Cerebro → Ojos → Backend)

### Technical

#### Files Created (40 new files)
```
src/
├── app/(auth)/
│   ├── layout.tsx
│   ├── login/page.tsx
│   └── signup/page.tsx
├── app/(main)/
│   ├── layout.tsx
│   └── dashboard/page.tsx
├── features/
│   ├── .template/ (5 folders + README)
│   ├── auth/ (5 folders)
│   ├── dashboard/ (5 folders)
│   └── README.md
└── shared/
    ├── 8 subdirectories (.gitkeep in each)
    └── README.md
```

#### Commit Stats
- **40 files changed**
- **+522 insertions, -149 deletions**
- **Net: +373 lines** (despite 50% README reduction due to new structure)

### Philosophy Impact

**Before V2.1**: Agent had tools but no clear identity
**After V2.1**: Agent knows exactly who it is and how to work with humans

The agent now understands:
- Its role (Architect, not autonomous builder)
- Its constraints (Golden Path only, no invented options)
- Its collaboration model (DWY: Human designs, Agent executes)
- Its superpowers (Turbopack, MCPs, Feature-First context)

---

## [2.0.0] - 2025-12-05

### 🎯 Philosophy Change: "The Machine that Builds the Machine"

V2 adopts Henry Ford's assembly line philosophy - one perfected model instead of many options.

### Added
- **`/new-app` command**: Business Architect - interactive interview that generates `BUSINESS_LOGIC.md`
- **`/landing` command**: The Money Maker - high-conversion landing page generator
- **`metodologia-saas-factory.md`**: Complete SaaS Factory methodology (Delimitar → Deconstruir → Planificar → Ejecutar → Validar)
- **Golden Path stack**: Single optimized path (Next.js 15 + Supabase + Tailwind + shadcn/ui)

### Changed
- **Renamed `nextjs-claude-setup/` → `saas-factory/`**: Cleaner naming for the only template
- **Simplified alias**: `saas-factory` now copies from unified template
- **Email/Password auth by default**: Avoids OAuth bot-blocking during testing

### Removed
- **`python-claude-setup/`**: Unnecessary for SaaS factory (Next.js covers full-stack)
- **`auth-nextjs-template/`**: Auth now injected by agents, not as separate template
- **`setup/`**: Users use the Golden Path directly
- **Multiple template options**: One path, perfected

### Technical
- Repository renamed to `saas-factory-v2`
- Private repo for controlled distribution

---

## [1.3.1] - 2025-12-01

### Added
- **Formularios Directory**: Created `.claude/Formularios/` in all 3 setups (setup, nextjs-claude-setup, python-claude-setup)
- **FORMULARIO_LANDING.md**: Added landing page definition form to all setups for AI-driven landing page creation
- **FORMULARIO_PROYECTO.md**: Added project definition form to setup/ (was already in nextjs/python)

### Changed
- **File Organization**: Moved `FORMULARIO_PROYECTO.md` from root to `.claude/Formularios/` in nextjs-claude-setup and python-claude-setup
- All project forms now organized under `.claude/Formularios/` for consistency

---

## [1.3.0] - 2025-11-28

### Added

#### Documentación de MCPs en CLAUDE.md
- Sección **"🔌 MCPs Clave"** añadida a los 4 CLAUDE.md:
  - Chrome DevTools MCP: tabla de comandos + cuándo usar (bucle agéntico visual)
  - Supabase MCP: tabla de comandos + cuándo usar (acceso directo a BDD)
  - Referencia a `supabase-mcp-baas.md` para guía completa

#### Template auth-nextjs-template Documentado
- Añadido `auth-nextjs-template` como alias oficial
- Actualizada estructura del repositorio en CLAUDE.md raíz
- Documentado como "el más usado" para apps con autenticación pre-configurada

### Changed
- Versión del proyecto actualizada a v1.3.0
- Sección "Qué Incluye Cada Setup" ahora muestra 4 templates

---

## [1.2.0] - 2025-11-28

### Added

#### Nuevos Agentes Especializados (4)
- **frontend-specialist**: Experto en UI/UX, React, Tailwind CSS. Crea interfaces accesibles y performantes.
- **backend-specialist**: Experto en Server Actions, APIs, validaciones con Zod. Arquitectura Clean.
- **supabase-admin**: Experto en operaciones Supabase via MCP. Maneja BDD, RLS, Auth, Storage.
- **vercel-deployer**: Experto en deployments con Vercel CLI. Usa modelo `haiku` para rapidez y bajo costo.

#### Nuevos Prompts/Metodologías (5)
- **supabase-mcp-baas.md**: El 20% que produce el 80% del MCP de Supabase. Incluye los 5 comandos esenciales, patrones de uso, y flujo de trabajo recomendado.
- **nextjs-16-guide.md**: Guía completa de Next.js 16 (Cache Components, Turbopack, proxy.ts, React Compiler).
- **agent-builder-pydantic.md**: Guía para construir agentes IA con Pydantic AI + OpenRouter en Python.
- **agent-builder-vercel.md**: Guía para construir agentes IA con Vercel AI SDK + OpenRouter en Next.js.
- **INVESTIGACION-CLAUDE-CODE-V2.md**: Documento de investigación exhaustiva sobre componentes de `.claude/` según docs oficiales de Anthropic.

#### Estructura Completa en setup/ Base
- El setup base ahora incluye todos los agentes, commands, prompts y skills igual que los templates específicos.

### Changed

#### Reorganización de Skills → Prompts
- **Filosofía corregida**: Skills son para expertise que Claude activa automáticamente. Prompts son documentación de referencia.
- Movido `nextjs-16-complete-guide` de skills/ a prompts/
- Movido `agent-builder-pydantic-ai` de skills/ a prompts/
- Movido `agent-builder-vercel-sdk` de skills/ a prompts/

### Removed

#### Skills Eliminados (6)
- `nano-banana-image-combine/` - No relevante para la fábrica
- `replicate-integration/` - No relevante para la fábrica
- `supabase-auth-memory/` - Redundante con supabase-mcp-baas.md
- `nextjs-16-complete-guide/` - Movido a prompts/
- `agent-builder-pydantic-ai/` - Movido a prompts/
- `agent-builder-vercel-sdk/` - Movido a prompts/

### Technical Notes

#### Estructura Final de .claude/
```
.claude/
├── agents/     (7) - Agentes especializados con modelos y tools específicos
├── commands/   (7) - Slash commands invocados manualmente
├── prompts/    (6-7) - Metodologías y documentación de referencia
├── skills/     (1) - Solo skill-creator (verdadero skill con activación automática)
└── PRPs/       - Templates para Product Requirement Patterns
```

#### Diferenciación Correcta de Componentes
| Componente | Activación | Uso |
|------------|------------|-----|
| Commands | Manual (`/cmd`) | Prompts reutilizables |
| Agents | Delegado | Subagentes con contexto aislado |
| Skills | **Automática** | Expertise que Claude detecta |
| Prompts | Referencia | Metodologías documentadas |

---

## [1.1.0] - 2025-11-27

### Added
- **Project Planning Form**: `FORMULARIO_PROYECTO.md` added to all setups. Defines business problem, solution, target user, data flow, and KPIs before coding.
- **Context Engineering Integration**: Integrated core "Context Engineering" components (PRP templates, Codebase Analyst agent, `/primer` command) into the base setup.
- **Agentic Protocols**: Added "Traffic Light" protocol to `CLAUDE.md` for conditional agentic loop activation.
- **Next.js 16 Support**: Updated `auth-nextjs-template` to support Next.js 16 (Turbopack, Cache Components).

### Changed
- **Documentation Refactor**: Simplified `CLAUDE.md` across all setups (`nextjs`, `python`, `setup`) to remove meta-noise and focus on critical architecture/quality rules.
- **Template Renaming**: Renamed `plantilla-autenticacion` to `auth-nextjs-template` for consistency.
- **PRP Template**: Upgraded to a more robust version with 4 validation levels and "Known Gotchas".

### Fixed
- **Version Hallucination**: Corrected `auth-nextjs-template` package.json to match documentation (Next.js 16).

## [1.0.0] - 2025-10-01

### Added
- Initial release of SaaS Factory.
- Base templates for Next.js and Python.
- Basic agentic loop configuration.
