# 📖 PSE_ALINEACION_MAESTRA.md
> *"La Verdad Suprema de Performance Swimming Evolution"*

## 🛡️ Núcleo de Identidad (NO NEGOCIABLE)
- **Autenticación**: 100% **Google Auth** vía NextAuth v5.
- **Estado**: El proveedor de `Credentials` (Login Manual) ha sido **ELIMINADO**.
- **Orquestación**: Sincronizado con **InsForge Elite** (Variables de entorno inyectadas en el constructor cloud).
- **Ruta Base**: `/performance` (Critical para redirects y PWA).

## 🌩️ Infraestructura
- **Backend**: Neon PostgreSQL (Postgres Serverless).
- **Vercel**: `performanceswimming.online`.
- **N8N**: `3.148.170.122:5678` (Solo para long-running tasks).

## 🧠 Decisiones Técnicas Críticas
- **Coach Alvin**: Siempre usar el `history` del cliente para evitar repetición de saludos.
- **Antropometría**: Dashboard profesional con filtro por Cédula/ID de atleta.
- **Creem.io**: Webhook nativo en `/api/webhooks/creem` con activación instantánea y firma segura.

## ⚠️ Reglas de "Zero Mistakes"
1. **Nunca** preguntes el nombre si el socio ya lo dio en el `@hola socio` o si aparece en la sesión.
2. **Nunca** ofrezcas login manual en PSE.
3. **Siempre** verifica el `memory_bank.json` de PSE antes de cada FASE.

---
*Si no está en este documento, confírmalo con el socio antes de implementarlo.*
