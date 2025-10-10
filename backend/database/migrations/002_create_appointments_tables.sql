 -- 002_create_appointments_tables.sql
-- Availability_Slots, Appointments, Consultations, Prescriptions

BEGIN;

DROP TABLE IF EXISTS "Prescriptions" CASCADE;
DROP TABLE IF EXISTS "Consultations" CASCADE;
DROP TABLE IF EXISTS "Appointments" CASCADE;
DROP TABLE IF EXISTS "Availability_Slots" CASCADE;

CREATE TABLE "Availability_Slots" (
    slot_id INT PRIMARY KEY,
    professional_id INT NOT NULL REFERENCES "Professionals"(professional_id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_booked BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TYPE status AS ENUM('Scheduled', 'Completed', 'Cancelled');
CREATE TYPE appointment_type AS ENUM('Virtual', 'In-Person');

CREATE TABLE "Appointments" (
    appointment_id INT PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES "Patients"(patient_id) ON DELETE CASCADE,
    professional_id INT   REFERENCES "Professionals"(professional_id) ON DELETE CASCADE,
    clinic_doctor_id INT REFERENCES "Clinic_Doctors"(clinic_doctor_id) ON DELETE SET NULL,
    appointment_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status status NOT NULL,
    appointment_type appointment_type NOT NULL,
    consultation_link VARCHAR(225),
);

CREATE TABLE "Consultations" (
    consultation_id INT PRIMARY KEY,
    appointment_id INT NOT NULL UNIQUE REFERENCES "Appointments"(appointment_id) ON DELETE CASCADE,
    notes TEXT,
    ai_briefing VARCHAR(225),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "Prescriptions" (
    prescription_id INT PRIMARY KEY,
    consultation_id INT NOT NULL REFERENCES "Consultations"(consultation_id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(120),
    instructions TEXT
);

-- Indexes
CREATE INDEX idx_availability_professional_id ON "Availability_Slots"(professional_id);
CREATE INDEX idx_appointments_patient_id ON "Appointments"(patient_id);
CREATE INDEX idx_appointments_professional_id ON "Appointments"(professional_id);
CREATE INDEX idx_appointments_clinic_doctor_id ON "Appointments"(clinic_doctor_id);
CREATE INDEX idx_consultations_appointment_id ON "Consultations"(appointment_id);
CREATE INDEX idx_prescriptions_consultation_id ON "Prescriptions"(consultation_id);

COMMIT;
