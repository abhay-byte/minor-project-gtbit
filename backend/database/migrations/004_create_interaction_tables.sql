-- 004_create_interaction_tables.sql
-- AI_Chat_Logs, Reviews

BEGIN;

DROP TABLE IF EXISTS "AI_Chat_Logs" CASCADE;
DROP TABLE IF EXISTS "Reviews" CASCADE;

CREATE TABLE "Reviews" (
    review_id INT PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES "Patients"(patient_id) ON DELETE CASCADE,
    rating INT,
    comment TEXT,
    target_type VARCHAR(255),
    target_id INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE  sender_AI AS ENUM('User', 'AI');

CREATE TABLE "AI_Chat_Logs" (
    log_id INT PRIMARY KEY,
    user_id INT NOT NULL REFERENCES "Users"(user_id) ON DELETE CASCADE,
    message_content TEXT,
    sender  sender_AI NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reviews_patient_id ON "Reviews"(patient_id);
CREATE INDEX idx_aichatlogs_user_id ON "AI_Chat_Logs"(user_id);

COMMIT;
