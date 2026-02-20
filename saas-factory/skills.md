# 🛠️ Agent Skills V4 (Deep Intelligence)

prioritize_context: identidad_synergosia.md

---
name: DeepSeek Reasoning Loop 2.0
trigger: "Siempre, al inicio de cualquier tarea compleja."
action: |
  1. Abrir bloque `<thought>` para el análisis sistémico.
  2. Consultar `memory_bank.json` filtrando por la categoría relevante (infra, ai, auth, etc.).
  3. Ejecutar tarea con validación continua.
  4. AL FINALIZAR: Si se descubrió un nuevo patrón o fix, actualizar tanto `GEMINI.md` (log histórico) como `memory_bank.json` (memoria de acceso rápido).
---

## 🏗️ Habilidades de Arquitectura
### Multi-Tenant Isolation
- **Context**: Aplicaciones SaaS compartidas.
- **Protocol**: Siempre prefijo de `tenantId` en almacenamiento local y sesiones.

## 🎨 Habilidades de Diseño
### Brand Syn (Enterprise Branding)
- **Style**: Minimalista, colores sólidos (059669, D4AF37), tipografía Inter/Outfit.
- **Rule**: No efectos 'gamer'. Interfaz limpia para profesionales.

## 🛡️ Habilidades de Resiliencia
### Auto-Fixer 3.0 (Zero-Prompt Recovery)
- **Protocol**: Si un comando falla, el agente DEBE leer la salida del error, formular el fix usando el reasoning loop y aplicarlo sin preguntar al usuario, reportando solo la solución final.

### Production Safety (Adalberto's Rule)
- **Trigger**: `Deploy`, `Backup`, `Push`.
- **Action**: Pregunta obligatoria "¿Adalberto, apruebas los cambios?". Si es afirmativo, ejecutar commit atómico y deploy.

---
name: Memory Anchor (Auto-Blindaje V4)
trigger: "Finalización de una tarea compleja, resolución de bugs críticos o cambios en la identidad visual."
action: |
  1. Identificar el 'Insight de Oro' (lo que evitará el error en el futuro).
  2. Clasificar en una categoría: infrastructure, ai_llm, auth_security, project_pse, ui_ux.
    - [x] Persistent Update: Sincronización inmediata con el `memory_bank.json`.
    - [x] Auto-Blindaje: Documentación de errores y soluciones para evitar recurrencia.
    - [ ] Infinite Context: Si la información no está en RAM, consultar Chroma DB vía `vector_engine.py`.
  3. Ejecutar `update_memory` (actualizar memory_bank.json).
  4. Documentar en `GEMINI.md` sección 🔥 Aprendizajes.
  5. Decir: "Blindaje completo. La fábrica ha evolucionado."
---
name: Infinite Memory Search
trigger: "Cuando el agente necesite datos específicos de manuales técnicos, reglas de natación o documentación MCP no presente en el contexto actual."
action: |
  1. Identificar keywords de búsqueda.
  2. Ejecutar `python .claude/scripts/vector_engine.py query "<keywords>"`.
  3. Si el archivo retornado es grande (>1000 chars), usar `python .claude/scripts/lazy_reader.py <file_path>` para leer el fragmento relevante.
  4. Sintetizar respuesta basada en la evidencia recuperada.
  5. Decir: "Blindaje completo. La fábrica ha evolucionado."
---

## 🛡️ Habilidades de Resiliencia
...
### Memory Anchor (Auto-Blindaje V4)
- **Insight**: El conocimiento no anclado es conocimiento perdido.
- **Protocol**: Al final de cada sesión de éxito, extraer el patrón técnico y guardarlo en el baúl categórico.
