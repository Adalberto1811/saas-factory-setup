-- Extended PSE Schema for InsForge

-- 1. Plans (Macrociclo)
CREATE TABLE IF NOT EXISTS pse_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) DEFAULT 'Mi Plan de Entrenamiento',
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_competencia TIMESTAMP WITH TIME ZONE,
    total_microciclos INTEGER DEFAULT 12,
    current_microciclo INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active', -- active, completed, archived
    metadata JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Microcycles
CREATE TABLE IF NOT EXISTS pse_microcycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES pse_plans(id) ON DELETE CASCADE,
    numero_semana INTEGER NOT NULL,
    data JSONB NOT NULL,
    feedback_usuario TEXT,
    completado BOOLEAN DEFAULT FALSE,
    sentimiento_atleta INTEGER, -- 1-5 scale
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Subscriptions (Polar.sh Integration)
CREATE TABLE IF NOT EXISTS pse_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'inactive', -- active, inactive, canceled, trial
    payment_provider VARCHAR(50) DEFAULT 'polar',
    provider_subscription_id VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Support Requests
CREATE TABLE IF NOT EXISTS pse_support_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    session_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- pending, resolved, closed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Activity Log (Real-time tracking for Admin)
CREATE TABLE IF NOT EXISTS pse_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL, -- microcycle_gen, login, anthropometry_added, payment_success
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Push Subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
    endpoint TEXT PRIMARY KEY,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    tags JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pse_plans_user ON pse_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_pse_microcycles_plan ON pse_microcycles(plan_id);
CREATE INDEX IF NOT EXISTS idx_pse_subs_user ON pse_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_user ON pse_activity_log(user_id);
