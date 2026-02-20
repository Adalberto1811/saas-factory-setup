# 🔑 Guía de Credenciales para MCPs

## Instrucciones para Adalberto

Para que los MCPs funcionen, necesitas generar tokens/API keys en cada servicio y reemplazarlos en el archivo `.mcp.json`.

---

## 1. 🐙 GitHub Token

1. Ve a: https://github.com/settings/tokens
2. Click en **"Generate new token"** → **"Generate new token (classic)"**
3. Nombre: `SaaS Factory MCP`
4. Expiration: Elige la duración que prefieras
5. Permisos a marcar:
   - ✅ `repo` (todos los sub-permisos)
   - ✅ `read:org`
   - ✅ `read:user`
6. Click **"Generate token"**
7. **COPIA EL TOKEN** (solo se muestra una vez)

---

## 2. 🚀 Vercel Token

1. Ve a: https://vercel.com/account/tokens
2. Click en **"Create"**
3. Nombre: `SaaS Factory MCP`
4. Scope: **Full Access**
5. Click **"Create Token"**
6. **COPIA EL TOKEN**

---

## 3. 🐘 Neon Database

1. Ve a: https://console.neon.tech (crea cuenta si no tienes)
2. Click en tu avatar → **"Account settings"**
3. Sección **"API Keys"**
4. Click **"Create new API Key"**
5. Nombre: `SaaS Factory MCP`
6. **COPIA LA API KEY**

### Credenciales Respaldadas:
```
API Key (MCP): napi_wq75gpe7f8zy3webg8fyywm8vp2s4i3q8p53w4m0rxjpw2gap45d6ootm3socckd
Database URL: postgresql://neondb_owner:npg_yE0Ba8lFSdTb@ep-bitter-hill-ahdypq3e-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

---

## 4. ⚡ N8N (requiere Docker + instancia N8N)

### Si tienes N8N instalado:
1. Abre tu instancia de N8N
2. Ve a **Settings** → **API**
3. Genera una nueva API Key
4. Copia la URL de tu N8N (ej: `https://tu-n8n.com` o `http://localhost:3000`)

### Si NO tienes N8N:
Puedes omitir este MCP por ahora. Lo configuramos después.

### Credenciales Respaldadas:
```
N8N URL: http://3.148.170.122:5678
Email: adalberto1811@gmail.com
Password: ALA181111
API Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjgxNTUzOC03ZTc1LTQ5MDktODgwOC0xZWI4MGQyMmJmMTQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY4Njg2OTk1fQ.UeOeqqEsZ_UNA2X0rPdnQHWmMTB0SqyTnopXLLyJZYU
```

---

## 5. 🎬 Kling AI (Video Generation)

1. Ve a: https://kling.ai
2. Crea una cuenta y ve a la sección de **API Key**.
3. Genera un **Access Key** y un **Secret Key**.
4. **CREDERNCIALES ACTUALES (Respaldadas):**
   ```
   Access Key: ARTRNdeMnFBM9tARta4AMbgrNpgaGkyr
   Secret Key: CB3MGgp8EggdmeJ9rHCgHNQrheQ8mkTt
   ```

---

## 6. 🎨 Flux via OpenRouter - Generación de Imágenes

1. Ve a: https://openrouter.ai
2. Crea cuenta y ve a **Keys** → **Create Key**.
3. Nombre: `Synergos MarketSyn`
4. **COPIA LA API KEY** (formato: `sk-or-v1-eb3b...3cfe`)

---

## 📝 Cómo Agregar las Credenciales

Una vez tengas los tokens, dámelos y yo los agrego al archivo `.mcp.json`. (Nota: Las de Kling AI y Flux se agregan a `.env.local`).

**Formato de respuesta:**
```
GitHub: ghp_xxxxxxxxxxxx
Vercel: xxxxxxxxxxxxx
Neon: xxxxxxxxxxxxx
N8N URL: https://xxx
N8N Key: xxxxxxxxxxxxx
Kling Access: xxx
Kling Secret: xxx
Flux (FAL_KEY): xxx
```

⚠️ **IMPORTANTE**: Nunca compartas estos tokens públicamente. Solo dámelos en este chat privado.
