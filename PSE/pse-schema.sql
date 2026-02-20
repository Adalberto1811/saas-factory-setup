-- 🏋️‍♂️ Performance Swimming Evolution - Esquema de Datos V1 (Fase 2)

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Planes de Entrenamiento (Bloques de 12 semanas)
CREATE TABLE IF NOT EXISTS pse_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Ej: "Plan Rumbo a Nacional 2026"
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_competencia TIMESTAMP WITH TIME ZONE,
    total_microciclos INTEGER DEFAULT 12,
    current_microciclo INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    metadata JSONB DEFAULT '{}', -- Datos técnicos como test T100, nivel, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Microciclos (Sesiones Semanales)
CREATE TABLE IF NOT EXISTS pse_microcycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID REFERENCES pse_plans(id) ON DELETE CASCADE,
    numero_semana INTEGER NOT NULL,
    data JSONB NOT NULL, -- El plan de entrenamiento generado
    feedback_usuario TEXT,
    completado BOOLEAN DEFAULT FALSE,
    sentimiento_atleta INTEGER CHECK (sentimiento_atleta BETWEEN 1 AND 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Suscripciones y Pagos (Paywall)
CREATE TABLE IF NOT EXISTS pse_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    checkout_session_id TEXT, -- ID de referencia de pasarela (Stripe/Paypal)
    status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'pending', 'expired')),
    plan_type TEXT DEFAULT 'standard', -- Ej: 'premium', 'elite'
    expires_at TIMESTAMP WITH TIME ZONE,
    last_payment_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_pse_plans_user ON pse_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_pse_microcycles_plan ON pse_microcycles(plan_id);
CREATE INDEX IF NOT EXISTS idx_pse_subscriptions_user ON pse_subscriptions(user_id);
