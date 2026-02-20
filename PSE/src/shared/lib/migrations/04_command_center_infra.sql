-- Migración: Infraestructura del Centro de Mando (SynCards)
-- Fase: Negocio y Monitoreo

-- 1. Tabla de Salud del Sistema (Latencia y Errores)
CREATE TABLE IF NOT EXISTS system_health (
    id SERIAL PRIMARY KEY,
    endpoint VARCHAR(255) NOT NULL,
    model VARCHAR(100),
    latency_ms INTEGER,
    status_code INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Suscripciones (Integración Polar.sh)
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    polar_subscription_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) NOT NULL, -- 'active', 'trialing', 'past_due', 'canceled'
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Auditoría de Administrador (Panic Button Logs)
CREATE TABLE IF NOT EXISTS admin_audit (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- 'update_prompt', 'block_user', 'system_config'
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización de Dashboard
CREATE INDEX IF NOT EXISTS idx_system_health_created_at ON system_health(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
