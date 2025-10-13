-- Migration script to create tables for hyperlocal discovery (clinics, clinic_doctors)
-- and patient-specific data (medical_records). It also finalizes the appointments table schema.
-- Version: 3
-- Depends on: 002_create_appointments_tables.sql

-- Begin a transaction
BEGIN;

-- Create a custom ENUM type for the clinic/hospital distinction.
CREATE TYPE clinic_type_enum AS ENUM (
    'Clinic',
    'Hospital'
);

-- 1. Create the 'medical_records' table
-- This table acts as a digital vault for patients to store their health documents.
CREATE TABLE medical_records (
    record_id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_url VARCHAR(255) UNIQUE NOT NULL, -- Link to cloud storage (e.g., S3 URL)
    document_type VARCHAR(50), -- e.g., 'Lab Report', 'X-Ray', 'Prescription'
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_patient
        FOREIGN KEY(patient_id)
        REFERENCES patients(patient_id)
        ON DELETE CASCADE -- If a patient is deleted, their records are also deleted.
);

COMMENT ON TABLE medical_records IS 'Stores patient-uploaded health documents.';
COMMENT ON COLUMN medical_records.document_url IS 'A unique URL pointing to the file in cloud storage.';


-- 2. Create the 'clinics' table
-- Stores information about physical healthcare locations for the map feature.
CREATE TABLE clinics (
    clinic_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL, -- Precision for standard GPS coordinates
    longitude DECIMAL(9, 6) NOT NULL,
    phone_number VARCHAR(20),
    type clinic_type_enum NOT NULL
);

COMMENT ON TABLE clinics IS 'Powers the hyperlocal discovery map feature.';
COMMENT ON COLUMN clinics.latitude IS 'GPS coordinate for map pin placement.';
COMMENT ON COLUMN clinics.longitude IS 'GPS coordinate for map pin placement.';


-- 3. Create the 'clinic_doctors' table
-- Stores information about doctors who work at a physical clinic.
-- This is distinct from the platform's volunteer 'professionals'.
CREATE TABLE clinic_doctors (
    clinic_doctor_id SERIAL PRIMARY KEY,
    clinic_id INT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(100),
    consultation_fee DECIMAL(10, 2) CHECK (consultation_fee >= 0),
    CONSTRAINT fk_clinic
        FOREIGN KEY(clinic_id)
        REFERENCES clinics(clinic_id)
        ON DELETE CASCADE -- If a clinic is removed, its associated doctors are also removed.
);

COMMENT ON TABLE clinic_doctors IS 'Doctors who work at physical clinics, separate from platform volunteers.';


-- 4. Update the 'appointments' table with the foreign key constraint
-- Now that 'clinic_doctors' exists, we can establish the foreign key relationship.
ALTER TABLE appointments
ADD CONSTRAINT fk_clinic_doctor
    FOREIGN KEY(clinic_doctor_id)
    REFERENCES clinic_doctors(clinic_doctor_id)
    ON DELETE SET NULL; -- If a clinic doctor is deleted, keep the appointment but unlink it.

-- Add indexes on foreign key columns for better query performance.
CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_clinic_doctors_clinic_id ON clinic_doctors(clinic_id);

-- Optional: Add a spatial index for geo-queries on clinics if using PostGIS extension.
-- CREATE INDEX idx_clinics_location ON clinics USING GIST (ST_MakePoint(longitude, latitude));


-- Create a composite B-tree index on the latitude and longitude columns in the clinics table.
-- This will optimize queries that filter or sort by location, such as finding all clinics
-- within a specific map bounding box (e.g., WHERE lat > x AND lat < y AND lon > a AND lon < b).
CREATE INDEX idx_clinics_lat_lon ON clinics (latitude, longitude);

-- Commit the transaction
COMMIT;
