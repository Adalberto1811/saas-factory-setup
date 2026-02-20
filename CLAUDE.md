# 🏭 SaaS Factory V3 - Meta-Documentación del Repositorio

> *"La Tesla Factory aplicada al software."*

## 🎯 Qué es Este Proyecto

**SaaS Factory** es un sistema de comandos inteligentes para crear aplicaciones production-ready con Claude Code. Es una "fábrica" que genera proyectos completos en minutos.

**Filosofía V3:**
- **Henry Ford:** Un solo modelo "T" perfeccionado → Un solo stack (Golden Path)
- **Elon Musk:** La máquina que construye la máquina → Los comandos que construyen el SaaS
- **Auto-Blindaje:** El sistema se fortalece solo → Cada error es una oportunidad para blindar la fábrica

## 🤖 La Analogía: Tesla Factory

| Componente Tesla | Tu Sistema | Archivo/Herramienta |
|------------------|------------|---------------------|
| **Factory OS** | Cerebro del agente | `saas-factory/CLAUDE.md` |
| **Blueprints** | Especificaciones de features | `.claude/PRPs/*.md` |
| **Control Room** | Humano que aprueba | Tú preguntas, él valida |
| **Robot Arms** | Manos (editar código, DB) | Supabase MCP + Terminal |
| **Eyes/Cameras** | Visión del producto | Playwright MCP |
| **Quality Control** | Validación automática | Next.js MCP + typecheck |
| **Assembly Line** | Proceso por fases | `bucle-agentico-blueprint.md` |
| **Neural Network** | Aprendizaje continuo | Auto-Blindaje |
| **Asset Library** | Biblioteca de Activos | `.claude/` (Comandos, Skills, Agentes, Diseño) |

## 📦 Estructura del Repositorio

```
saas-factory-setup/
├── CLAUDE.md                   # Este archivo (meta-docs del repositorio)
├── README.md                   # Guía de instalación para usuarios
├── CHANGELOG.md                # Historial de versiones
│
└── saas-factory/               # El Golden Path (proyecto funcional)
    ├── CLAUDE.md               # Factory OS - Cerebro del agente
    ├── GEMINI.md               # Espejo para Gemini
    ├── .mcp.json               # MCPs configurados
    ├── package.json            # Dependencias pre-instaladas
    ├── next.config.ts          # Next.js 16 con MCP activado
    ├── src/                    # Código fuente
    │   ├── app/                # Next.js App Router
    │   ├── features/           # Arquitectura Feature-First
    │   └── shared/             # Libs y componentes
    │
    └── .claude/
        ├── commands/           # Comandos slash (/new-app, /landing)
        ├── prompts/            # Assembly Line (bucle agéntico)
        ├── agents/             # Agentes especializados
        ├── PRPs/               # Blueprints de features
        ├── ai_templates/       # Sistema LEGO para features IA
        └── skills/             # Skills reutilizables
```

## 🚀 Cómo Funciona el Sistema

### El Alias `saas-factory`

```bash
alias saas-factory="cp -r [RUTA]/saas-factory/. ."
```

Copia **TODO el proyecto funcional** al directorio actual:
- `CLAUDE.md` → Factory OS (cerebro del agente)
- `.claude/` → Comandos, agentes, PRPs, AI templates
- `.mcp.json` → MCPs configurados (Next.js, Playwright, Supabase)
- `src/` → Código fuente con arquitectura Feature-First
- `package.json` → Dependencias (Next.js 16, React 19, Tailwind 3.4)
- Configs → TypeScript, ESLint, Tailwind

### El Golden Path (Stack Único)

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 16 + React 19 + TypeScript |
| Estilos | Tailwind CSS 3.4 + shadcn/ui |
| Backend | Supabase (Auth + PostgreSQL) |
| AI Engine | Vercel AI SDK v5 + OpenRouter |
| Validación | Zod |
| State | Zustand |
| Testing | Playwright MCP |
| Deploy | Vercel |

## 🧠 V3: Auto-Blindaje

> *"Como el acero del Cybertruck: cada error es un impacto que refuerza nuestra estructura. Blindamos el proceso para que la falla nunca se repita."*

```
Error ocurre → Se arregla → Se DOCUMENTA → NUNCA ocurre de nuevo
```

**Archivos participantes:**
- **PRP actual** → Errores específicos de esta feature
- **`.claude/prompts/*.md`** → Errores que aplican a múltiples features
- **`CLAUDE.md`** → Errores críticos que aplican a TODO

## 🔧 Workflow de Instalación (Para Claude Code)

Cuando un usuario pide ayuda para configurar SaaS Factory:

### 1. Detectar Sistema
```bash
echo $SHELL  # zsh o bash
pwd          # Ruta del repo
```

### 2. Generar y Añadir Alias
```bash
# Reemplazar [REPO_PATH] con el resultado de pwd
echo "alias saas-factory='cp -r [REPO_PATH]/saas-factory/. .'" >> ~/.zshrc
source ~/.zshrc
```

### 3. Validar
```bash
type saas-factory  # Debe retornar: "is an alias for..."
```

### 4. Explicar Uso
```
Configuración completa!

Para crear un nuevo proyecto:
1. mkdir mi-proyecto && cd mi-proyecto
2. saas-factory
3. npm install && npm run dev
4. claude .

Comandos disponibles:
- /new-app  → Define tu SaaS (genera BUSINESS_LOGIC.md)
- /landing  → Crea landing pages de alta conversión
```

## ❌ Restricciones

**Este repositorio NO debe:**
- Convertirse en un proyecto específico (es un factory)
- Tener código de aplicación en el root
- Committear `.mcp.json` con secrets (solo `example.mcp.json`)

**Los proyectos generados NO deben:**
- Usar OAuth para auth inicial (usar Email/Password)
- Añadir backends separados innecesariamente
- Sobre-engineerear la primera versión

## 📊 Estado V3

**Versión:** 3.1.0
**Última actualización:** 2025-01-11

**V3 incluye:**
- Factory OS con analogía Tesla Factory
- Sistema Auto-Blindaje (aprendizaje continuo)
- AI Templates (sistema LEGO modular)
- Lifecycle commands (/update-sf, /eject-sf)

---

*Este archivo es para que Claude Code entienda el **repositorio** SaaS Factory.*
*Para el Factory OS (cerebro del agente), ver `saas-factory/CLAUDE.md`.*
