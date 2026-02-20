# 🤖 Protocolo A2A (Agent-to-Agent) - SaaS Factory V3

Este protocolo define cómo los agentes de la factoría colaboran de forma secuencial y autónoma para resolver tareas complejas.

## 🧠 El Ciclo de Vida del Agente (REC)

Todo agente operando bajo este protocolo DEBE seguir el ciclo **Reason -> Execute -> Communicate**.

### 1. Reason (Razonar)
Antes de actuar, el agente debe analizar el contexto heredado de los agentes anteriores.
- **Leyendo**: Identificar decisiones clave tomadas previamente (ej: stack tecnológico, rutas de archivos).
- **Razonando**: Determinar qué falta para completar su responsabilidad específica.
- **Output**: Expresar brevemente su pensamiento en 1-2 frases dentro de un bloque `<thought>`.

### 2. Execute (Ejecutar)
El agente utiliza sus herramientas (MCPs o Skills) para realizar el trabajo técnico.
- **Eficiencia**: Ejecutar herramientas de forma directa y minimizando la charla.
- **Persistencia**: Guardar sus decisiones en archivos estandarizados (ej: `platform-config.yaml`) para que el siguiente agente los herede.

### 3. Communicate (Comunicar)
Al finalizar su tarea, el agente prepara el "testigo" para el siguiente agente.
- **Status**: Confirmar qué se logró.
- **Contexto**: Mencionar cualquier detalle crítico que el siguiente agente deba saber.

## 📋 Estándares de Comunicación

- **No preguntar al usuario**: En el flujo A2A, los agentes operan en modo autónomo basado en el `platform-config.yaml` inicial. Solo se pide intervención humana ante errores críticos.
- **Brevedad**: Menos charla, más ejecución. El log debe ser profesional y accionable.
- **Formato de Archivo Crítico**: El archivo `platform-config.yaml` es la única fuente de verdad (Single Source of Truth) para el stack tecnológico.

## 🏗️ Jerarquía Sugerida para Proyectos

1. **Architect**: Decide el qué y cómo (Stack).
2. **Builder**: Genera el código base y la infraestructura.
3. **Security**: Valida vulnerabilidades y cumplimiento.
4. **DevOps**: Configura CI/CD y Observabilidad.
5. **Portal**: Genera la UI de administración o landing.

---
*Protocolo derivado de la arquitectura de Google ADK optimizado para SaaS Factory V3.*
