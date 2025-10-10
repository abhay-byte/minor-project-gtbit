-- 003_create_discovery_and_records_tables.sql
-- Clinics, ClinicDoctors, MedicalRecords

BEGIN;

DROP TABLE IF EXISTS "MedicalRecords" CASCADE;
DROP TABLE IF EXISTS "ClinicDoctors" CASCADE;
DROP TABLE IF EXISTS "Clinics" CASCADE;

CREATE TYPE  clinic_type  AS ENUM('Clinic','Hospital')
CREATE TABLE "Clinics" (
    clinic_id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address  VARCHAR(255) NOT NULL,
    type clinic_type NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
);
 
CREATE INDEX idx_clinics_location ON "Clinics"(latitude, longitude);

CREATE TABLE "Clinic_Doctors" (
    clinic_doctor_id INT PRIMARY KEY,
    clinic_id INT NOT NULL REFERENCES "Clinics"(Clinic_id) ON DELETE CASCADE,
    full_name VARCHAR(100),
    specialty VARCHAR(100),
    consultation_fee  VARCHAR(100),   
);
 -- Create the ENUM type
CREATE TYPE medical_record AS ENUM ('lab', 'imaging', 'consultation');

 
CREATE TABLE "Medical_Records" (
    record_id INT PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES "Patients"(patient_id) ON DELETE CASCADE,
    document_name VARCHAR(225),
    document_uri VARCHAR(225),
    document_type  medical_record  ,  
    updated_at DATE NOT NULL DEFAULT  
);


-- Indexes
CREATE INDEX idx_clinic_doctors_clinic_id ON "ClinicDoctors"(clinic_id);
CREATE INDEX idx_clinic_doctors_professional_id ON "ClinicDoctors"(professional_id);
CREATE INDEX idx_medical_records_patient_id ON "MedicalRecords"(patient_id);

COMMIT;
