-- 002_create_appointments_tables.sql
-- availabilitySlots, Appointments, Consultations, Prescriptions

BEGIN;

DROP TABLE IF EXISTS "Prescriptions" CASCADE;
DROP TABLE IF EXISTS "Consultations" CASCADE;
DROP TABLE IF EXISTS "Appointments" CASCADE;
DROP TABLE IF EXISTS "AvailabilitySlots" CASCADE;

CREATE TABLE "AvailabilitySlots" (
    availabilitySlot_id INT PRIMARY KEY,
    professional_id INT NOT NULL REFERENCES "Professionals"(professional_id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    slot_type VARCHAR(50),         -- e.g., 'in_person', 'teleconsult'
    is_booked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "Appointments" (
    appointment_id  SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES "Patients"( patient_id) ON DELETE CASCADE,
    professional_id INT NOT NULL REFERENCES "Professionals"(professional_id) ON DELETE CASCADE,
    clinic_id INT REFERENCES "Clinics"(Clinic_id) ON DELETE SET NULL,
    availabilitySlot_id INT REFERENCES "AvailabilitySlots"(availabilitySlot_id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled', -- scheduled, cancelled, completed, no_show
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "Consultations" (
    consultation_id INT PRIMARY KEY,
    appointment_id INT NOT NULL UNIQUE REFERENCES "Appointments"(appointment_id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    diagnosis TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "Prescriptions" (
    prescription_id INT PRIMARY KEY,
    consultation_id INT NOT NULL REFERENCES "Consultations"(consultation_id) ON DELETE CASCADE,
    medicine_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(120),
    instructions TEXT,
    duration_days INT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_availability_professional_id ON "AvailabilitySlots"(professional_id);
CREATE INDEX idx_appointments_patient_id ON "Appointments"(patient_id);
CREATE INDEX idx_appointments_professional_id ON "Appointments"(professional_id);
CREATE INDEX idx_appointments_slot_id ON "Appointments"(availabilitySlot_id);
CREATE INDEX idx_consultations_appointment_id ON "Consultations"(appointment_id);
CREATE INDEX idx_prescriptions_consultation_id ON "Prescriptions"(consultation_id);

COMMIT;
