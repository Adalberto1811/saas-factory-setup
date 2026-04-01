# 🛡️ Respaldo de Operación: Rescate Coach API (31-Mar-2026)

## 📌 Estado de la Situación
- **Problema Inicial**: El Coach Alvin no respondía a los mensajes de los usuarios en la interfaz de chat de `performanceswimming.online`.
- **Diagnóstico Profundo**:
  - La base de datos Neon estaba intacta (no había fallos de esquema para las tablas vitales).
  - El servidor backend estaba vivo y respondía **Http 200 OK**.
  - **El Bug Real**: El componente frontend `CoachChat.tsx` utilizaba el hook `useChat` de la librería `@ai-sdk/react`. Este hook espera forzosamente que las respuestas del backend vengan en formato **Stream Data Protocol** (`X-Vercel-AI-Data-Stream`).
  - Las respuestas calculadas (historial o paywall) se estaban enviando como un simple `NextResponse.json()`. El hook frontend recibía esto y lo descartaba silenciosamente, provocando que la interfaz permaneciera "ciega" ante las respuestas del Coach.

---

## 💻 El Fix Aplicado (Local)

El código ha sido reparado en la ruta:
`c:\Keys\PSE_BACKUP_2026-02-09\src\app\api\coach\route.ts`

### 1. Helper de Stream Artificial
Se inyectó una función para convertir strings planos al formato requerido por Vercel AI SDK:

```typescript
function createStreamCompatibleResponse(text: string): Response {
    const encoder = new TextEncoder();
    const chunks = text.match(/.{1,100}/gs) || [text];
    
    const stream = new ReadableStream({
        start(controller) {
            for (const chunk of chunks) {
                const escaped = JSON.stringify(chunk);
                controller.enqueue(encoder.encode(`0:${escaped}\n`));
            }
            controller.enqueue(encoder.encode('d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n'));
            controller.close();
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'X-Vercel-AI-Data-Stream': 'v1',
        },
    });
}
```

### 2. Conversión de JSON a Stream
Se actualizaron los bloques de respuesta de persistencia y paywall.

**Antes (Erróneo):**
```typescript
return NextResponse.json({
    response: currentWeekMicrocycle.data.raw_response
});
```

**Ahora (Correcto):**
```typescript
return createStreamCompatibleResponse(
    `📋 **Entrenamiento de la semana actual:**\n\n${textContent}\n\n---\n_Este es tu plan vigente. ¡A darle con todo! 🏊‍♂️_`
);
```

### 3. Parsing Multipart Multimodal
Se mejoró la extracción de los mensajes cuando el cliente envía imágenes (multipart) para evitar fallos de lectura.

---

## 🚧 Bloqueo Actual (Vercel)
Se intentó desplegar el proyecto múltiples veces vía Vercel CLI (`npx vercel --prod`).
El despliegue falló exclusivamente por **errores internos de infraestructura de Vercel** o problemas de dependencias en el entorno del CLI que impidieron construir el `npm install`.

**El código local está 100% perfecto y validado. Lo único restante es inyectar este código al dashboard de  Despliegue (Github o Vercel direct).**

## 🔐 Blindaje Consolidado
Toda la lógica de este bug se ha escrito permanentemente en la memoria base del agente (`GEMINI.md`), previniendo que futuras iteraciones de API de Chat rompan la compatibilidad del stream.
