-- Tabla para solicitudes de soporte de usuarios
CREATE TABLE IF NOT EXISTS pse_support_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    session_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- pending, resolved, closed
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_support_status ON pse_support_requests(status);
CREATE INDEX IF NOT EXISTS idx_support_created ON pse_support_requests(created_at DESC);
