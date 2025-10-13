-- Migration script to create tables related to the appointment and consultation workflow.
-- Version: 2
-- Depends on: 001_create_users_tables.sql

-- Begin a transaction
BEGIN;

-- Create custom ENUM types for appointment status and type.
CREATE TYPE appointment_status AS ENUM (
    'Scheduled',
    'Completed',
    'Cancelled'
);

CREATE TYPE appointment_type_enum AS ENUM (
    'Virtual',
    'In-Person'
);

-- 1. Create the 'availability_slots' table
-- This allows professionals to define when they are available for virtual consultations.
CREATE TABLE availability_slots (
    slot_id SERIAL PRIMARY KEY,
    professional_id INT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    is_booked BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_professional
        FOREIGN KEY(professional_id)
        REFERENCES professionals(professional_id)
        ON DELETE CASCADE, -- If a professional is deleted, their slots are also deleted.
    CONSTRAINT check_start_before_end CHECK (start_time < end_time)
);

COMMENT ON COLUMN availability_slots.is_booked IS 'True if an appointment has been scheduled in this slot.';


-- 2. Create the 'appointments' table
-- This is the core transactional table linking patients to care providers.
-- Note: The clinic_doctors table does not exist yet. The clinic_doctor_id column is created here,
-- but the foreign key constraint will be added in a future migration script.
CREATE TABLE appointments (
    appointment_id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL,
    professional_id INT, -- For 'Virtual' appointments
    clinic_doctor_id INT, -- For 'In-Person' appointments
    appointment_time TIMESTAMPTZ NOT NULL,
    status appointment_status NOT NULL DEFAULT 'Scheduled',
    appointment_type appointment_type_enum NOT NULL,
    consultation_link VARCHAR(255),
    CONSTRAINT fk_patient
        FOREIGN KEY(patient_id)
        REFERENCES patients(patient_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_professional
        FOREIGN KEY(professional_id)
        REFERENCES professionals(professional_id)
        ON DELETE SET NULL, -- If a professional is deleted, keep the appointment record but unlink it.
    CONSTRAINT check_appointment_provider
        -- Enforces the core hybrid logic: an appointment must be either virtual or in-person, but not both.
        CHECK ( (appointment_type = 'Virtual' AND professional_id IS NOT NULL AND clinic_doctor_id IS NULL) OR
                (appointment_type = 'In-Person' AND clinic_doctor_id IS NOT NULL AND professional_id IS NULL) ),
    CONSTRAINT check_consultation_link
        -- A consultation link should only exist for virtual appointments.
        CHECK ( (appointment_type = 'Virtual' AND consultation_link IS NOT NULL) OR
                (appointment_type = 'In-Person' AND consultation_link IS NULL) )
);

COMMENT ON COLUMN appointments.professional_id IS 'FK to professionals. Used for virtual appointments.';
COMMENT ON COLUMN appointments.clinic_doctor_id IS 'FK to clinic_doctors. Used for in-person appointments.';
COMMENT ON COLUMN appointments.consultation_link IS 'URL for the video call, generated for virtual appointments.';


-- 3. Create the 'consultations' table
-- This table stores the output and notes from a completed appointment.
CREATE TABLE consultations (
    consultation_id SERIAL PRIMARY KEY,
    appointment_id INT UNIQUE NOT NULL,
    notes TEXT,
    ai_briefing TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_appointment
        FOREIGN KEY(appointment_id)
        REFERENCES appointments(appointment_id)
        ON DELETE CASCADE -- If the appointment is deleted, the consultation details are also deleted.
);

COMMENT ON COLUMN consultations.appointment_id IS 'Links one-to-one with a completed appointment.';
COMMENT ON COLUMN consultations.notes IS 'Detailed clinical notes from the professional.';
COMMENT ON COLUMN consultations.ai_briefing IS 'AI-generated summary of patient chat history provided to the doctor.';


-- 4. Create the 'prescriptions' table
-- A single consultation can result in multiple prescriptions.
CREATE TABLE prescriptions (
    prescription_id SERIAL PRIMARY KEY,
    consultation_id INT NOT NULL,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    instructions TEXT NOT NULL,
    CONSTRAINT fk_consultation
        FOREIGN KEY(consultation_id)
        REFERENCES consultations(consultation_id)
        ON DELETE CASCADE -- If the consultation is deleted, its prescriptions are also deleted.
);

COMMENT ON TABLE prescriptions IS 'Stores medications prescribed during a consultation.';


-- Add indexes on foreign key columns for better query performance.
CREATE INDEX idx_availability_slots_professional_id ON availability_slots(professional_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_professional_id ON appointments(professional_id);
CREATE INDEX idx_appointments_clinic_doctor_id ON appointments(clinic_doctor_id);
CREATE INDEX idx_prescriptions_consultation_id ON prescriptions(consultation_id);

-- Commit the transaction
COMMIT;
