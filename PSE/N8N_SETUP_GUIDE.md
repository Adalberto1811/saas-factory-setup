# 🏭 Guía de Configuración N8N (Español)

> **Objetivo**: Conectar N8N con tu nueva base de datos Neon.

Como removimos Supabase, N8N necesita saber dónde guardar los datos ahora. Solo tienes que hacer esto una vez.

## 1. Conectar la Base de Datos (Neon)

1. Abre tu panel de control de **N8N**.
2. Ve al menú de la izquierda: **Credentials** (Credenciales).
3. Haz clic en el botón **Create New** (Crear Nueva) y busca **PostgreSQL**.
4. Llámala: `Neon DB` (Exactamente así).
5. Copia y pega estos datos (los saqué de tu configuración):

| Campo | Valor |
|-------|-------|
| **Host** | (Busca `DATABASE_URL` en tu archivo `.env.local` y copia la parte después de `@` y antes de `:`) <br> *Ejemplo: ep-cool-frog-123456.us-east-2.aws.neon.tech* |
| **Database** | `neondb` |
| **User** | (El usuario de tu `DATABASE_URL`) |
| **Password** | (La contraseña de tu `DATABASE_URL`) |
| **Port** | `5432` |
| **SSL** | Actívalo (On) o "SSL Mode: Require" |

6. Haz clic en **Save** (Guardar).

## 2. Verificar los Flujos (Workflows)

1. Abre el flujo **Lead Capture** (Captura de Leads).
2. Haz doble clic en el nodo de **Postgres**.
3. Asegúrate de que en "Credential to connect with" diga `Neon DB`.
4. Haz lo mismo con el flujo **AgentSyn** (El chat de IA).

---
**¿Por qué tengo que hacer esto yo?**
Por seguridad, yo no tengo acceso directo para entrar a tu panel de administración de N8N y escribir contraseñas. Solo puedo dejarte todo listo en el código.
