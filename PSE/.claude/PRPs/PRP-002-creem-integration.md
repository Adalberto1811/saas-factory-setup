# PRP-002: Integración de Pagos Creem.io (Zero Lies)

> **Propietario**: Antigravity (SaaS Factory V3)
> **Estado**: Propuesta de Migración
> **Contexto**: PSE Publication Readiness

## 🎯 Objetivo
Sustituir la pasarela de pagos de Polar.sh por **Creem.io** para resolver problemas de fiabilidad en los cobros y asegurar la activación automática de suscripciones Pro en el ecosistema PSE.

## 🛡️ User Review Required
> [!IMPORTANT]
> Se requiere que el Socio proporcione el **Pay link (Checkout URL)** de Creem.io una vez creado el producto en su dashboard. La activación depende de la inyección correcta del `userId` en los metadatos.

## 🏗️ Cambios Propuestos

### 1. Configuración de Pagos
#### [MODIFY] [pse-payment-config.ts](file:///c:/Keys/saas-factory-setup/PSE/src/shared/config/pse-payment-config.ts)
- Añadir sección `creem`.
- Establecer `checkoutUrl` (Placeholder hasta confirmación del Socio).

### 2. Receptor de Webhooks (Zero Lies Bridge)
#### [NEW] [route.ts](file:///c:/Keys/saas-factory-setup/PSE/src/app/api/webhooks/creem/route.ts)
- Implementar validación de firma `creem-signature` (HMAC-SHA256).
- Procesar evento `checkout.completed`.
- Activar suscripción en la tabla `pse_subscriptions` de Neon vinculando el `user_id` desde los metadatos.
- Registrar evento en `pse_activity_log`.

### 3. Interfaz del Coach
#### [MODIFY] [CoachChat.tsx](file:///c:/Keys/saas-factory-setup/PSE/src/features/coach/components/CoachChat.tsx)
- Cambiar el link de Polar.sh por el de Creem.io.
- Protocolo de metadatos: `?metadata[userId]=${authSession.user.id}`.

## 🧪 Plan de Verificación
1. **Simulación de Pago**: Ejecutar POST manual al nuevo webhook con payload de prueba de Creem.io.
2. **Activación de Atleta**: Verificar en Neon que la tabla `pse_subscriptions` se actualiza a `status: active` para el ID correspondiente.
3. **UI Check**: Validar que el botón de pago en el chat redirige a la URL de Creem.io con los parámetros correctos.

---
*Este Blueprint asegura la resiliencia financiera de la fábrica PSE bajo el Protocolo Zero Lies.*
