# 🔥 Aprendizajes y Patrones (Auto-Blindaje Activo)

> Esta sección CRECE con cada error encontrado. Cada error aquí documentado blinda al agente para que NUNCA vuelva a ocurrir.

## #infra #npm
### 2025-01-09: Usar npm run dev, no next dev
- **Error**: Puerto hardcodeado causa conflictos
- **Fix**: Siempre usar `npm run dev` (auto-detecta puerto)
- **Aplicar en**: Todos los proyectos

### 2026-02-03: Resiliencia de Instalación (OpenClaw/Moltbot)
- **Error**: `npm install` cuelga indefinidamente o falla con `ECOMPROMISED` debido a red ultra-lenta o interferencias en el registry.
- **Causa**: El árbol de dependencias de OpenClaw es masivo (>500MB) y requiere una conexión estable que no siempre está disponible en entornos de red restringidos.
- **Fix (Net-Bypass Strategy)**:
  1. No depender de `npm install` secuencial para el core.
  2. **Direct Tarball**: Descargar el `.tgz` directamente del registro (`registry.npmjs.org/openclaw/-/openclaw-[VERSION].tgz`).
  3. **Pre-built Dist**: Extraer el tarball manualmente (`tar -xzf`). Las versiones oficiales ya incluyen la carpeta `dist/`, eliminando la necesidad de `npm run build` local.
  4. **Minimal Install**: Usar `--omit=dev` y registros mirror (`npmmirror.com`) para reducir la carga de red al 20%.
  5. **Hybrid verification**: Si `npm` se cuelga al 90%, verificar `node_modules` manualmente. Si los módulos core (`hono`, `commander`, `express`) están presentes, el sistema puede intentar arrancar.

## #n8n #webhook
### 2026-01-18: Error 502 en N8N (Bad Gateway)
- **Error**: Workflow "Social Publisher" falla con 502 Bad Gateway.
- **Causa**: Nodo "Post Text (Postiz)" refiere a un servicio que ya no existe en la base de datos interna de N8N.
- **Fix**: Reemplazar nodo obsoleto con nodo HTTP Request estándar o actualizar la integración.
- **Acción Requerida**: Reparar workflow "Social Publisher (Mass Campaign)".

### 2026-01-19: Parseo de JSON en MarketSyn
- **Error**: "Unexpected token in JSON" al recibir planes de N8N.
- **Causa**: N8N envía respuestas con bloques markdown (```json) o texto extra.
- **Fix**: Implementar lógica `parsePlan` que limpia marcas de código y extrae el objeto JSON puro.

### 2026-01-19: Migración "Mega" (Pure Meta) y Naming de Nodos n8n
- **Error**: Despliegue de n8n fallaba con "Unrecognized node type".
- **Causa**: Identificadores genéricos (`facebook`) no son válidos; se requieren nombres internos: `facebookGraphApi` e `instagramGraphApi`.
- **Fix**: Mapeo exacto de tipos en el JSON y despliegue directo vía API REST (Node.js/fetch) para total fiabilidad.

### 2026-01-21: Dos Agentes N8N Diferentes (AgentSyn vs Landing)
- **Error**: El chat de la landing page no respondía.
- **Causa**: Se usaba el webhook incorrecto. Hay **dos agentes diferentes**:
  - **AgentSyn** (`ef270b01...`): Gemini Flash, input via `body.chatInput`
  - **Agente Landing** (`webhook/chat`, ID: `lRt9Is2nkz0ATDn2`): OpenAI GPT-4.1, input via `query.message`
- **Fix**: Actualizar `synergos-config.ts` con `agentSyn: "webhook/chat"` y cambiar el frontend para enviar `query.message` y `query.sessionId`.
- **Backup**: `agente-landing-workflow.json` guardado en root del proyecto.

### 2026-01-26: Independencia de Brain (N8N-Free)
- **Concepto**: No usar n8n para la lógica de chat/brain (latencia y fragilidad).
- **Implementación**: Lógica de orquestación 100% local en rutas de Next.js. N8N se reserva solo para tareas de larga duración (social publishing).
- **Vercel Fix**: Habilitar `export const config = { runtime: 'edge' }` en rutas API para asegurar compatibilidad con Web Standard API (fetch/req.json) en Vercel.

### 2026-02-16: Fallo de los Tres Puntos ("...") y Unificación de Repositorios (Cero vs Final)
- **Error**: El asistente de producción (Etna Moros) respondía con una burbuja de tres puntos ("...") constante.
- **Causa**: N8N devolvía un array vacío `[]`. El frontend antiguo no manejaba este estado.
- **Detección**: La captura de pantalla del socio reveló que el repo activo en producción era `synergos-evo-cero` (basado en números de línea del log).
- **Fix**: 
  1. **Extractor Profundo**: Capaz de buscar texto en cualquier profundidad del JSON de N8N.
  2. **Diagnóstico en Pantalla**: Si el contenido es nulo, el asistente ahora explica el error: *"⚠️ Fallo de Conexión: Flujo N8N inactivo o IA saturada"*.
  3. **Unificación Global**: Blindaje aplicado a `cero`, `final` y `factory` para erradicar el problema en cualquier rama.

## #ia #llm #openrouter
### 2026-01-24: OpenRouter 404 & Gemini 2.0 Upgrade
- **Error**: `streamText` fallaba silenciosamente (o 404 en logs) con `google/gemini-flash-1.5`.
- **Causa**: Modelo deprecado o movido en OpenRouter.
- **Fix**: Actualizar a `google/gemini-2.0-flash-exp:free`.
- **Lección**: Verificar siempre el ID del modelo en OpenRouter si hay errores de red misteriosos.

### 2026-01-26: Cadena de Estabilidad (OpenRouter Paid Tier)
- **Síntomas**: Error 429 (Quota) en Gemini 2.0 y Error 404 (Not Found) en Gemini 1.5 via Direct SDK.
- **Causa**: Agotamiento de cuotas gratuitas y restricciones regionales de modelos específicos en la API key directa.
- **Fix**: Implementar **"Cadena de Estabilidad"** en OpenRouter: `google/gemini-flash-1.5` -> `google/gemini-pro-1.5` -> `openai/gpt-3.5-turbo`.
- **Blindaje**: El sistema ahora prioriza el saldo pagado sobre las cuotas gratuitas, garantizando servicio continuo.

### 2026-01-31: 🤖 Fallo de Estabilidad Kimi k2.5 (Rollback)
- **Error**: Las respuestas del Coach se trababan o tardaban >60s.
- **Causa**: `moonshotai/kimi-k2.5` tiene rate limits agresivos o inestabilidad en OpenRouter para este endpoint.
- **Fix**: Restaurar `google/gemini-2.5-flash` como modelo primario en la Stability Chain.
- **Lección**: No usar modelos "Reasoning" o experimentales como primarios en producción sin validación previa de latencia.

### 2026-03-31: Coach API (AI SDK useChat) Stream Compatibility
- **Error**: El frontend (UI) no renderizaba la respuesta del Coach, a pesar de que el backend respondía con status 200 OK y el mensaje correcto. El coach "hablaba solo".
- **Causa**: El hook `useChat` de `@ai-sdk/react` espera **estrictamente** un formato de Data Stream. Cuando el backend cacheaba la respuesta y devolvía `NextResponse.json({ response: "..." })`, el hook ignoraba silenciosamente el payload por no ser un stream `0:"text"\n`.
- **Causa 2**: El backend no parcheaba correctamente un payload `messages` en formato multipart, causando que la extracción de texto fallara en peticiones con archivos/imágenes.
- **Fix (Implementado localmente en PSE_BACKUP)**:
  1. Se creó el helper `createStreamCompatibleResponse` que convierte strings planos en un `ReadableStream` con el protocolo Vercel AI SDK (`0:"texto"\n` seguido de `d:{"finishReason":"stop"}\n`).
  2. Se reemplazó el `NextResponse.json()` en las rutas cacheadas y de Paywall por la nueva función stream-compatible.
  3. Se añadió lógica de desestructuración para parsear `lastMessage.content` ya sea como `string` o como array `multipart`.

## #database #sql
### 2026-01-30: Columna `full_name` vs `name` en tabla `users`
- **Error**: `column "name" does not exist` en consultas SQL.
- **Causa**: El esquema de la DB usa `full_name`, pero el código usaba `name`.
- **Fix**: Actualizar `PSEService.getOrCreateUserByName()` para usar `full_name` en SELECT e INSERT.

### 2026-01-30: Email SQL Injection en Template Literal
- **Error**: `column "pse" does not exist`.
- **Causa**: El dominio `@pse-atleta.com` estaba fuera del `${}` en la plantilla SQL. Postgres interpretaba `@pse` como un operador de columna.
- **Fix**: Mover todo el string de email dentro del parámetro: `${name + '@pse-atleta.com'}`.

### 2026-01-30: Duplicate Key en `users_email_key`
- **Error**: `duplicate key value violates unique constraint "users_email_key"`.
- **Causa**: Usuario ya existía con nombre diferente pero mismo email.
- **Fix**: Función blindada con triple búsqueda: (1) por nombre, (2) por email, (3) INSERT con ON CONFLICT.

## #auth #nextjs
### 2026-01-30: Coach Persistencia con Autenticación JWT
- **Problema**: El Coach "adivinaba" el usuario por texto del chat, causando duplicados y errores.
- **Solución**: Implementar `getAuthenticatedUserId()` que lee la cookie `auth_token` y extrae el `userId` del JWT.

### 2026-02-03: Auth.js Nuclear Alignment (Base Path)
- **Error**: Error 400 "Bad Request" y CSRF failure al usar un `basePath` personalizado.
- **Causa**: Desajuste entre el endpoint interno de Auth.js y la URL externa detectada por el navegador.
- **Fix**: **Triple Alineamiento**. 1) `authConfig.basePath: "/prefijo/api/auth"`, 2) `SessionProvider basePath: "/prefijo/api/auth"`, 3) `AUTH_URL: http://host/prefijo/api/auth`.
- **Blindaje**: Nunca manipular cookies de sesión manualmente; el alineamiento de rutas lo soluciona todo.

### 2026-02-11: Subpath Alignment y Estabilización SDK v4+
- **Error**: Redirect loops y 404s en /performance.
- **Causa**: `basePath` faltante en `next.config.ts` y `auth.config.ts`.
- **Fix**: Sincronización de `basePath: '/performance'` en ambos archivos.

---
*Fin del registro de blindaje.*
