# 🏭 Ecosistema Synergos V3: El Manual de la Factoría Inteligente

Este documento detalla la sinergia total y el flujo de trabajo del sistema **Synergos Solutions**, desde el primer contacto en la landing page hasta la ejecución de estrategias complejas en la factoría.

---

## 🛰️ Fase 1: La Exploradora (Syn @ Landing Page)

El viaje comienza en [synergosia.online](https://synergosia.online).

1.  **Captación Activa:** El agente **"Syn"** (Scout) recibe al visitante. Su misión es calificar al lead mediante una conversación amigable.
2.  **Calificación:** Syn detecta el "dolor" del cliente, su presupuesto y su industria.
3.  **Sinergia de Datos:** Al finalizar la charla, Syn envía un payload a **N8N**.
    *   **¿Cómo te enteras?**: N8N procesa el lead y lo inserta en la tabla `crm_leads` de **Neon**. Además, dispara una notificación (email/slack según configuración de N8N) para que sepas que hay un nuevo interesado.
4.  **Handover:** Los datos del lead (nombre, empresa, interés) quedan vinculados a una `sessionId` que se hereda cuando el usuario accede a la plataforma principal.

---

## 🧠 Fase 2: El Orquestador (AgentSyn @ SaaS)

Una vez dentro de `localhost:3000` (o la URL de producción):

1.  **Contexto Compartido:** **AgentSyn** reconoce si el usuario viene de la landing.
2.  **Comando y Control:** AgentSyn no es un chat común; es el **Director de Orquesta**. Utiliza "Tags Agénticos" para activar módulos:
    *   `[[MARKETSYN]]`: Si detecta que quieres vender o publicar.
    *   `[[SYNCARDS]]`: Si hablas de networking o tarjetas.
    *   `[[SUITELEGAL]]`: Para contratos o documentos.
3.  **Multi-Tenancy (PWA Isolation):** Gracias al parámetro `?tenant=tu-slug`, toda la información que conversas, generas o guardas queda blindada bajo tu identificador único en `localStorage` y la base de datos Neon.

---

## 🛠️ Fase 3: Los Módulos Especializados

### 📈 MarketSyn (Marketing Engine - SDK Nativo)
*   **Estrategia:** Genera planes de contenido de 7 días basados en psicología de ventas.
*   **Video Nativo:** Utiliza **Runway Gen-3 Alpha Turbo** de forma directa mediante el SDK integrado, eliminando latencias de n8n.
*   **Factoría de Imágenes (Whisk Mode):**
    *   **Generación en Lote:** Capacidad para crear 20 prompts visuales independientes de una sola vez.
    *   **Consistencia de Marca:** Implementación de "Reference Character" para que tu imagen (o la del cliente) sea el eje central de toda la campaña.
    *   **Costo Cero:** Integración con Whisk Automator para minar imágenes premium de Google Imagen 3 sin pagar suscripciones.
*   **Almacenamiento Persistente:** Los activos se vinculan automáticamente a la tabla `ads_batch` en Neon, permitiendo una gestión masiva de anuncios.

### 📇 SynCards (NFC Digital Cards)
*   **Diseño IA:** Creas tu perfil con el branding de Synergos.
*   **Fondo Cinemático:** Utilizas Flux para generar fondos que impacten.
*   **NFC:** Programas tu tag físico desde el navegador para networking instantáneo.

### ⚖️ Suite Legal (ABOGADOS)
*   **IA Legal:** Generación de contratos, documentos y asesoría estratégica.
*   **Sinergia con TranscripSyn:** Transforma lo hablado en una reunión en un documento legal vinculante en segundos.

### 🎙️ TranscripSyn V2 (Meeting Assistant)
*   **Grabación/Carga:** Grabas en vivo, subes un audio o pegas un link de YouTube.
*   **Análisis "Superpowers":** Al terminar, el sistema genera Mapa Mental (**Mermaid.js**), Resumen y Plan de Acción.
*   **Sinergia:** Envía el audio analizado directamente a AgentSyn para ejecutar cualquier tarea legal o de marketing.

---

## 🧪 ¿Dónde veo los cambios y mejoras?

1.  **Entorno Local:** Ejecuta `npm run dev` y entra en **[http://localhost:3000](http://localhost:3000)**.
2.  **Verificación de Datos:** Puedes ver los leads y registros en tu consola de **Neon (PostgreSQL)**.
3.  **Logs de IA:** En la terminal verás la **"Assistant Chain"** (Gemini 2.5 Flash -> Pro), mostrando cómo el sistema garantiza estabilidad ante fallos.

---

## 🛡️ Auto-Blindaje (Persistent Memory)

Cada vez que logramos una mejora en "tiempo récord", el sistema se fortalece solo:

- **GEMINI.md / memory_bank.json**: He documentado los patrones de **Visualización Mermaid**, **Aislamiento Multi-Tenant** y la **Cadena de Estabilidad 2026**.
- **Aprendizaje Continuo**: Si un modelo de IA falla o un endpoint de imagen cambia (como Kling), el sistema ya sabe usar el fallback de Flux o Qwen gracias a la memoria de errores previos.

**Synergos Solutions V3 no es solo software; es una fábrica de software que aprende de su propio proceso.**
