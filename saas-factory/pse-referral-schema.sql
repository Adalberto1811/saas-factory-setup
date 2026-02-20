-- PSE Referral System Schema

-- 1. Extend users table to support referrals
-- Using an anonymous block to avoid errors if columns exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='referral_code') THEN
        ALTER TABLE users ADD COLUMN referral_code VARCHAR(20) UNIQUE;
        ALTER TABLE users ADD COLUMN referred_by_id INTEGER REFERENCES users(id);
    END IF;
END $$;

-- 2. Referral Log Table
CREATE TABLE IF NOT EXISTS pse_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id INTEGER NOT NULL REFERENCES users(id),
    referred_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'completed', -- pending, completed, rewarded
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(referrer_id, referred_id)
);

-- 3. Referral Rewards Tracker (Optional but good for auditing)
CREATE TABLE IF NOT EXISTS pse_referral_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id),
    reward_type VARCHAR(50) DEFAULT 'month_free', -- month_free (4 microcycles)
    microcycles_granted INTEGER DEFAULT 4,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_pse_referrals_referrer ON pse_referrals(referrer_id);
