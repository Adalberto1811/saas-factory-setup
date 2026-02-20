-- Migration: 20260216_training_logs
-- Description: Table for tracking training execution

CREATE TABLE IF NOT EXISTS pse_training_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    microcycle_id INTEGER REFERENCES pse_microcycles(id),
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    volume_meters INTEGER NOT NULL,
    intensity_direction TEXT,
    series_data JSONB NOT NULL, -- Array de { step_id, actual_time, reps_completed }
    hr_avg INTEGER,
    hr_max INTEGER,
    perceived_exertion INTEGER, -- Borg Scale 1-10
    total_duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_training_logs_user ON pse_training_logs(user_id);
CREATE INDEX idx_training_logs_micro ON pse_training_logs(microcycle_id);
