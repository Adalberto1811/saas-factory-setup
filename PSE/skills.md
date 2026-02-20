# 🛠️ Agent Skills

Este archivo documenta las habilidades personalizadas del agente.

---
name: Skill Creator
trigger: "Cuando el usuario pida agregar una nueva habilidad (e.g., 'Agrega una habilidad para...') o cuando se identifique un patrón repetitivo útil."
action: "1. Formatear la nueva habilidad con YAML frontmatter y secciones de Trigger/Action.\n2. Usar `replace_file_content` para añadirla a `skills.md`.\n3. Confirmar la creación al usuario."
---

## 🛠️ Skill Creator
- **Trigger**: Cuando el usuario pida agregar una nueva habilidad o se identifique una mejora persistente.
- **Action**: El agente debe actualizar `skills.md` con la nueva definición siguiendo este mismo formato.

---
name: Protocolo SaaS Factory
trigger: "Cuando el usuario diga 'Desplegar', 'Subir cambios', 'Backup' o 'Producción'."
action: "Ejecutar estrictamente:\n1. Preguntar: '¿Adalberto, apruebas los cambios?'.\n2. Git commit/push con mensaje 'RESPALDO FABRICA-SAAS-MASTER CREADO Y SEGURO'.\n3. Comando CLI Vercel para borrar deploy anterior.\n4. Comando CLI Vercel para nuevo despliegue limpio.\nNota: Solo ejecutar en entorno local."
---

## 🛠️ Protocolo SaaS Factory
- **Trigger**: 'Desplegar', 'Subir cambios', 'Backup' o 'Producción'.
- **Action**:
    1. **Confirmación**: Pedir aprobación explícita: "¿Adalberto, apruebas los cambios?".
    2. **Seguridad Git**: Commit y push con el mensaje estandarizado.
    3. **Limpieza Vercel**: Borrar la instalación previa.
    4. **Despliegue Limpio**: Realizar el nuevo deploy.
- **Restricción**: Solo ejecutable en entorno **Local**.

---
name: Brand Design Synergos
trigger: "Cuando pida 'Diseñar interfaz', 'Crear landing', 'Generar componente' o 'Frontend'."
action: "Seguir reglas de Marca Blanca:\n1. Estilo: Minimalista, empresarial y serio.\n2. Enfoque: Abogados y Contadores.\n3. Restricción: No neones ni estilos 'juguescos'. Tipografía profesional.\n4. Código: Componentes modulares y reutilizables."
---

## 🛠️ Brand Design Synergos
- **Trigger**: 'Diseñar interfaz', 'Crear landing', 'Generar componente' o 'Frontend'.
- **Action**:
    - **Visual**: Estilo minimalista, empresarial, serio y limpio (Marca Blanca).
    - **Público**: SaaS para perfiles profesionales (Abogados, Contadores).
    - **Restricción**: Evitar colores neón y elementos informales. Priorizar legibilidad.
    - **Arquitectura**: Componentes modulares y estrictamente reutilizables.

---
name: Auto-Fixer
trigger: "Cuando aparezca un error en la terminal o el usuario diga 'No funciona', 'Hay un bug' o 'Error'."
action: "1. No pedir al usuario que revise el código.\n2. Analizar causa raíz (logs, trazas).\n3. Aplicar solución automáticamente.\n4. Validar resultado (re-run command) e informar éxito/falla."
---

## 🛠️ Auto-Fixer
- **Trigger**: Errores de terminal o palabras clave ('No funciona', 'Bug', 'Error').
- **Action**:
    - **Autonomía**: No solicitar revisión de código manual al usuario.
    - **Diagnóstico**: Análisis profundo de la causa raíz.
    - **Reparación**: Aplicación directa de parches en los archivos afectados.
    - **Cierre**: Ejecutar validación automática de la corrección.
---
name: DeepSeek Reasoning Loop
trigger: "Siempre, al inicio de cualquier tarea compleja o respuesta técnica."
action: "1. Abrir un bloque `<thought>` para planificar la estrategia y razonar 'en voz alta'.\n2. Ejecutar la tarea.\n3. Al finalizar, actualizar el archivo `memory_bank.json` o `GEMINI.md` con los nuevos aprendizajes (Auto-Blindaje).\n4. Confirmar al usuario que el conocimiento ha sido 'anclado' en la memoria de la fábrica."
---

## 🛠️ DeepSeek Reasoning Loop
- **Trigger**: Cualquier interacción técnica o planificación de sistemas.
- **Action**: 
    - **Reasoning**: Uso obligatorio de bloques de pensamiento para transparencia y profundidad.
    - **Persistent Update**: Sincronización inmediata con el `memory_bank.json`.
    - **Auto-Blindaje**: Documentación de errores y soluciones para evitar recurrencia.
