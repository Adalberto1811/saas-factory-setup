# 🗝️ CENTRAL API VAULT

> Este documento es el punto de verdad para las integraciones de la fábrica. Todas las APIs aquí listadas han sido probadas y sus endpoints verificados.

## 🤖 Modelos de Lenguaje (OpenRouter)
- **Primary**: `google/gemini-2.5-flash` (Estabilidad / Velocidad)
- **High-End**: `google/gemini-2.5-pro` (Análisis complejo)
- **Fallback**: `openai/gpt-3.5-turbo` (Resiliencia total)

## 🎬 Generación de Video
### Kling AI
- **Endpoint**: `https://api.klingai.com/v1`
- **Auth**: JWT con claim `nbf` (-10s).
- **Status**: Activo.

### Luma/Replicate
- **Model**: `luma/dream-machine`
- **Provider**: Replicate SDK.
- **Status**: Fallback de Kling.

## 💾 Base de Datos & Backend
### Neon (PostgreSQL)
- **Type**: Serverless.
- **MCP**: `neon-mcp` activo.
- **Connection**: Connection string vía env variable.

## ⚙️ Automatización
### N8N (Local/Cloud)
- **Bridge**: `[IP].nip.io:5678` para saltar restricciones DNS.
- **Workflows**: Listados en `agente-landing-workflow.json`.

## 📓 Investigación & Cuadernos
### NotebookLM (Google)
- **Status**: Integrando vía MCP.
- **Bridge**: `notebooklm-mcp` (Node.js).
- **Config**: Localizada en `.claude/notebooklm-config.json`.
- **Auth**: Sesión de navegador persistente (Requiere `init` manual).

---
*Última Validación General: 2026-02-05*
