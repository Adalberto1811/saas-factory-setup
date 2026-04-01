# 🏛️ Arquitectura Maestra SynergosIA (Coding Standards)

> **Directivas de ingeniería de software obligatorias para todo agente que desarrolle en esta bóveda.**

## 1. Modularidad (Estilo PSE)
*   **Separación de Responsabilidades**: Todo proyecto debe seguir un enfoque *Feature-First* (o en capas precisas). La lógica de negocio, los endpoints y la UI son entidades independientes.
*   **Independencia y Escalabilidad**: El desarrollo debe crear bases que puedan transformarse del "Factory" base a un nuevo SaaS sin acoplamientos destructivos.

## 2. Manejo de Errores (Silent Logging)
*   **Aislamiento del Cliente**: Nunca propagar excepciones crudas (`stack traces`) al usuario final. Todas las rutas de API y funciones frontend críticas deben usar bloques `try/catch`.
*   **Registro Activo**: Usar herramientas como `debugLog` o sistemas equivalentes para rastrear errores silenciosos en la consola y dejar una huella técnica de lo que falló.
*   **Fallbacks Seguros**: Ante un fallo irrecuperable de infraestructura (OpenRouter, Base de datos, Auth), el sistema debe regresar un mensaje genérico, un error HTTP controlado (`500` o `400`) y garantizar que la aplicación o la UI no se congele.

## 3. Automatización, Orquestación y Shell
*   **Prioridad PowerShell**: Para cualquier script local de inicialización, diagnóstico o automatización en la máquina host de Windows, el agente **debe emplear PowerShell** en lugar de Bash.
*   **Scripts Predictibles**: Las automatizaciones deben manejar parámetros no interactivos, deshabilitar `telemetry` (cuando sea necesario) y redirigir sus fallos para ser diagnosticables de manera local.

## 4. Flujo de Trabajo y Memoria
*   **Actualización Constante**: El agente que termine de codificar o resolver un error **tiene la obligación irrefutable** de ir a `04_Context/System_Core.md` y registrar sus acciones.
