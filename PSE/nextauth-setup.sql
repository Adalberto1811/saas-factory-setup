-- Tablas necesarias para NextAuth (Auth.js) con PostgresAdapter

-- 1. Asegurar que la tabla users tenga los campos necesarios para OAuth
ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "image" TEXT;

-- 2. Tabla de Cuentas (OAuth)
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type VARCHAR(255),
  PRIMARY KEY (id)
);

-- 3. Tabla de Sesiones (Opcional si usas JWT, pero recomendada)
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  "sessionToken" VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

-- 4. Tabla de Tokens de Verificación
CREATE TABLE IF NOT EXISTS verification_token (
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- 5. Índices para rapidez
CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions("userId");
