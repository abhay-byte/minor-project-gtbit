-- 004_create_interaction_tables.sql
-- Reviews and AIChatLogs and any other interaction tables

BEGIN;

DROP TABLE IF EXISTS "AIChatLogs" CASCADE;
DROP TABLE IF EXISTS "Reviews" CASCADE;

CREATE TABLE "Reviews" (
    id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES "Patients"(id) ON DELETE CASCADE,
    clinic_id INT NOT NULL REFERENCES "Clinics"(id) ON DELETE CASCADE,
    appointment_id INT REFERENCES "Appointments"(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "AIChatLogs" (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    session_id UUID,
    user_message TEXT NOT NULL,
    assistant_response TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reviews_patient_id ON "Reviews"(patient_id);
CREATE INDEX idx_reviews_clinic_id ON "Reviews"(clinic_id);
CREATE INDEX idx_reviews_appointment_id ON "Reviews"(appointment_id);

CREATE INDEX idx_aichatlogs_user_id ON "AIChatLogs"(user_id);

COMMIT;
