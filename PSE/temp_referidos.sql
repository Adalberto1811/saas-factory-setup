-- Transacción para Referidos Oro
BEGIN;

CREATE TABLE IF NOT EXISTS public.atletas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  telegram_id BIGINT UNIQUE NOT NULL,
  full_name TEXT,
  email TEXT,
  test_400m_time INTERVAL,
  weight_kg NUMERIC(5, 2),
  age INT,
  volume_max_historical_m INT,
  volume_max_aspirational_m INT,
  weeks_to_competition INT,
  referral_code TEXT UNIQUE,
  referral_tier TEXT DEFAULT 'Bronce' NOT NULL,
  referred_by_code TEXT,
  microcycles_delivered_this_month INT DEFAULT 0,
  last_plan_date DATE
);

CREATE TABLE IF NOT EXISTS public.referidos_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.atletas(id),
  referred_id UUID NOT NULL REFERENCES public.atletas(id),
  referral_date DATE DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.atletas IS 'Ficha completa de cada atleta, incluyendo su estatus en el programa de referidos.';
COMMENT ON COLUMN public.atletas.referral_tier IS 'Nivel del atleta en el programa: Bronce, Plata, Oro, Platino.';
COMMENT ON TABLE public.referidos_log IS 'Registra cada evento de referido exitoso para auditoría y cálculo de ganancias.';

COMMIT;
