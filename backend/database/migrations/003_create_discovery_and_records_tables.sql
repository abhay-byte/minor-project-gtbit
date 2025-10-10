-- 003_create_discovery_and_records_tables.sql
-- Clinics, ClinicDoctors, MedicalRecords

BEGIN;

DROP TABLE IF EXISTS "MedicalRecords" CASCADE;
DROP TABLE IF EXISTS "ClinicDoctors" CASCADE;
DROP TABLE IF EXISTS "Clinics" CASCADE;

CREATE TABLE "Clinics" (
    clinic_id INT PRIMARY KEY,
    fullName VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(120),
    state VARCHAR(120),
    postal_code VARCHAR(30),
    country VARCHAR(120) DEFAULT 'India',
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    phone_number VARCHAR(30),
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Composite index for geo search (latitude, longitude)
CREATE INDEX idx_clinics_location ON "Clinics"(latitude, longitude);

CREATE TABLE "ClinicDoctors" (
    clinicDoctor_id INT PRIMARY KEY,
    clinic_id INT NOT NULL REFERENCES "Clinics"(Clinic_id) ON DELETE CASCADE,
    professional_id INT NOT NULL REFERENCES "Professionals"(professional_id) ON DELETE CASCADE,
    department VARCHAR(200),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "MedicalRecords" (
    medicalRecord_id INT PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES "Patients"(patient_id) ON DELETE CASCADE,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    title VARCHAR(255),
    description TEXT,
    record_type VARCHAR(100),   -- e.g., 'lab', 'imaging', 'consultation'
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_clinic_doctors_clinic_id ON "ClinicDoctors"(clinic_id);
CREATE INDEX idx_clinic_doctors_professional_id ON "ClinicDoctors"(professional_id);
CREATE INDEX idx_medical_records_patient_id ON "MedicalRecords"(patient_id);

COMMIT;
