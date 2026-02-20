-- Tabla para Memoria Agéntica General (Estilo MIMIR)
CREATE TABLE IF NOT EXISTS agente_memoria (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para Persistencia de Kanban Synergos
CREATE TABLE IF NOT EXISTS synergos_kanban (
    id SERIAL PRIMARY KEY,
    strategy_id TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    strategy_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
