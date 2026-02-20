# 🛡️ RESPALDO SaaS SYNERGOS
## Fábrica de Agentes - Sistema Completo de Marca Blanca
### Fecha de Respaldo: 8 de Enero 2026 (Actualizado 13 de Enero)

---

## 📋 ÍNDICE
1. [Servidor AWS](#servidor-aws)
2. [URLs de Servicios](#urls-de-servicios)
3. [Credenciales API](#credenciales-api)
4. [Sistema Fábrica SaaS](#sistema-fabrica-saas)
5. [Workflows N8N Modulares](#workflows-n8n-modulares)
6. [Model Context Protocol (MCP)](#model-context-protocol-mcp)
7. [Instalador de Marca Blanca](#instalador-de-marca-blanca)
8. [Base de Datos](#base-de-datos)
9. [Proyectos Clientes](#proyectos-clientes)
10. [**🆕 Plan Maestro de Infraestructura 2026**](#plan-maestro-de-infraestructura-synergos-2026)
11. [**🆕 Mejoras Implementadas Enero 2026**](#mejoras-implementadas-enero-2026)
12. [**🚀 Logros 11 Enero 2026**](#logros-11-enero-2026)
13. [**📋 Archivos Pendientes**](#archivos-pendientes)


---

## 🖥️ SERVIDOR AWS

| Campo | Valor |
|-------|-------|
| **IP Pública** | `3.148.170.122` |
| **Usuario SSH** | `ubuntu` |
| **Archivo Llaves** | `C:\Keys\N8N_AWS_KEYS.pem` |
| **Comando SSH** | `ssh -i "C:\Keys\N8N_AWS_KEYS.pem" ubuntu@3.148.170.122` |
| **Tipo Instancia** | t2.micro (1GB RAM) |
| **Swap Configurado** | 4GB |
| **Sistema Operativo** | Ubuntu |
| **Espacio Disponible** | 18GB (34% uso) |

### 🔄 Migración Programada: Abril 2026

**Razón**: N8N gratis expira en Junio 2026  
**Nuevo Proveedor**: **Peramix VPS**  
**Plan Seleccionado**: VPS X1

| Especificación | AWS Actual (t2.micro) | Peramix VPS X1 | Mejora |
|----------------|----------------------|----------------|--------|
| **RAM** | 1 GB | **8 GB** | **8x más** |
| **CPU** | 1 vCPU | 4 vCPU AMD EPYC | **4x más potente** |
| **Almacenamiento** | EBS (lento) | **80 GB NVMe** | **10x más rápido** |
| **Tráfico** | Limitado | **Ilimitado** | ∞ |
| **Protección DDoS** | No incluida | **1-3 Gbps** incluida | ✅ Nuevo |
| **Snapshots** | Manual (costo extra) | **1 gratis** | ✅ Nuevo |
| **Precio Mensual** | ~$10 USD | **$4.99 USD** | **50% ahorro** |
| **Primer Mes** | - | **$3.49 USD** (30% desc) | - |

**Ahorro Anual Proyectado**: ~$60 USD/año

#### Plan de Migración (Abril 2026)

```bash
# FASE 1: Preparación (1 semana antes)
1. Exportar todos los workflows N8N de AWS
2. Backup completo de base de datos Neon
3. Documentar custom nodes y configuraciones

# FASE 2: Contratación (1 día)
1. Contratar Peramix VPS X1 ($3.49 primer mes)
2. Seleccionar Ubuntu 24.04 LTS
3. Datacenter: Dallas, USA

# FASE 3: Configuración (2-3 horas)
ssh root@[IP_PERAMIX]
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
docker compose up -d n8n

# FASE 4: Migración de Datos (1 hora)
1. Importar workflows exportados
2. Configurar webhooks (misma IP o actualizar DNS)
3. Probar todos los workflows críticos

# FASE 5: Testing (1 semana)
1. Monitorear uptime con UptimeRobot (gratis)
2. Verificar performance workflows pesados
3. Confirmar estabilidad 24/7

# FASE 6: Cutover Final (1 día)
1. Actualizar DNS si aplica
2. Verificar todos los agentes funcionando
3. Cancelar AWS EC2 (ahorrar $10/mes)
```

---

## 🌐 URLs DE SERVICIOS

### Producción AWS

| Servicio | URL | Puerto |
|----------|-----|--------|
| **N8N** | http://3.148.170.122:5678 | 5678 |
| **Landing Synergos** | https://synergosia.online | - |

### Landing Page Corporativa

| Elemento | Detalle |
|----------|---------|
| **URL** | https://synergosia.online |
| **Webhook Leads** | `http://3.148.170.122:5678/webhook/lead-synergos` |
| **Captura** | Nombre, Email, Empresa, WhatsApp |
| **WhatsApp** | +58 426 273 5288 |
| **Email** | synergossolutions@gmail.com |
| **Planes** | 5 niveles (Genérico → Empresarial) |
| **Diseño** | Oscuro + Verde bosque + Acentos dorados |
| **Estado** | ✅ PRODUCCIÓN |

---

## 🔑 CREDENCIALES API (Resumen)

### Gemini & DB
- **Google Gemini**: AIzaSyCX572BiGS2q7Scl2odc8Y4wdjlx8BVecs
- **Neon DB**: postgresql://neondb_owner:npg_yE0Ba8lFSdTb@ep-bitter-hill-ahdypq3e-pooler.c-3.us-east-1.aws.neon.tech/neondb

### Meta (SocialSyn)
- **FB App ID**: 1426340769066785
- **IG App ID**: 1432714301607365

---

## 🔗 MODEL CONTEXT PROTOCOL (MCP)

**Servidores Desplegados:**
- **database**: `/api/mcp/database` (search_knowledge, list_documents, get_client_data)
- **github**: `/api/mcp/github` (repos, issues)
- **vercel**: `/api/mcp/vercel` (deployments, env vars)
- **n8n**: `/api/mcp/n8n` (webhooks)

---

## 🗺️ PLAN MAESTRO DE INFRAESTRUCTURA 2026

1. **USB #1: "Oficina Móvil"**: Win11 To Go (Rufus) con OpenCode Desktop.
2. **USB #2: "El Ingeniero"**: Ventoy Multi-Boot con ISOs de mantenimiento.
3. **"El Búnker"**: Mini Lenovo con Linux Server + n8n + Docker (Local).
4. **CRM Low-Code**: Google Sheets + n8n + App Web.
5. **Seguridad .Onion**: Respaldo en Dark Web vía Tor.

---

## 🚀 LOGROS ENERO 2026

- **MarketSyn Avatar**: Generación de consistencia (Frontal, Lateral, 3/4). Inyección en Kling AI.
- **SynCards Premium**: Diseño Beacons.ai style con branding dinámico y backgrounds IA.
- **Sales Agent Landing**: Agente de cierre comercial especializado en automatización.
- **TranscripSyn Deep Capture**: Grabación de alta fidelidad para reuniones y YouTube.
- **Aislamiento SaaS**: Restricción de módulos por cliente vía `config.ts` con UI de bloqueo.
- **MCP Multi-Server**: Conectividad avanzada con Database, GitHub, Vercel y N8N.

---

## 📋 MEJORAS IMPLEMENTADAS CRÍTICAS

1. **Documentos Persistentes**: Guardado en Neon DB y sección "Mis Documentos".
2. **Estadísticas TranscripSyn**: Registro real de minutos y archivos procesados en Neon.
3. **Panel Admin Protegido**: Contraseña `admin123syn`, edición de logo e iniciales dinámica.
4. **Fix MarketSyn**: Limpieza de JSON en `LaunchPlanner` y fallback 200 OK.
5. **Fix Kling AI**: Uso de endpoint `/task` con `task_type: "video_generation"`.

---
**© 2026 Synergos Solutions - Fábrica de Agentes IA**
