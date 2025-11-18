-- Migration script to update ID columns to UUID according to ER diagram
-- Version: 6
-- Depends on: 005_add_missing_tables.sql

-- Due to the complexity and risk of converting all existing SERIAL IDs to UUIDs in one migration,
-- this script will create a procedure to handle the migration in a safer way.
-- This approach preserves existing data while adding UUID support.

BEGIN;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add UUID columns to existing tables (without breaking existing functionality)
-- These columns will be populated gradually and eventually replace the SERIAL IDs

-- Add UUID columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_id_uuid UUID UNIQUE;
UPDATE users SET user_id_uuid = gen_random_uuid() WHERE user_id_uuid IS NULL;
ALTER TABLE users ALTER COLUMN user_id_uuid SET NOT NULL;

-- Add UUID columns to related tables
ALTER TABLE patients ADD COLUMN IF NOT EXISTS user_id_uuid UUID;
UPDATE patients SET user_id_uuid = u.user_id_uuid 
FROM users u 
WHERE patients.user_id = u.user_id;

ALTER TABLE professionals ADD COLUMN IF NOT EXISTS user_id_uuid UUID;
UPDATE professionals SET user_id_uuid = u.user_id_uuid 
FROM users u 
WHERE professionals.user_id = u.user_id;

ALTER TABLE ngo_users ADD COLUMN IF NOT EXISTS user_id_uuid UUID;
UPDATE ngo_users SET user_id_uuid = u.user_id_uuid 
FROM users u 
WHERE ngo_users.user_id = u.user_id;

-- Add UUID columns to other tables
ALTER TABLE patients ADD COLUMN IF NOT EXISTS patient_id_uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS professional_id_uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE ngo_users ADD COLUMN IF NOT EXISTS ngo_user_id_uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_id_uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE availability_slots ADD COLUMN IF NOT EXISTS slot_id_uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS consultation_id_uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS prescription_id_uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS record_id_uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS clinic_id_uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE clinic_doctors ADD COLUMN IF NOT EXISTS clinic_doctor_id_uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS review_id_uuid UUID DEFAULT gen_random_uuid();
ALTER TABLE ai_chat_logs ADD COLUMN IF NOT EXISTS log_id_uuid UUID DEFAULT gen_random_uuid();

-- Update foreign key references to include UUID versions
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_id_uuid UUID;
UPDATE appointments SET patient_id_uuid = p.patient_id_uuid 
FROM patients p 
WHERE appointments.patient_id = p.patient_id;

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS professional_id_uuid UUID;
UPDATE appointments SET professional_id_uuid = pr.professional_id_uuid 
FROM professionals pr 
WHERE appointments.professional_id = pr.professional_id;

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS clinic_doctor_id_uuid UUID;
UPDATE appointments SET clinic_doctor_id_uuid = cd.clinic_doctor_id_uuid 
FROM clinic_doctors cd 
WHERE appointments.clinic_doctor_id = cd.clinic_doctor_id;

-- Update consultations
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS appointment_id_uuid UUID;
UPDATE consultations SET appointment_id_uuid = a.appointment_id_uuid 
FROM appointments a 
WHERE consultations.appointment_id = a.appointment_id;

-- Update prescriptions
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS consultation_id_uuid UUID;
UPDATE prescriptions SET consultation_id_uuid = c.consultation_id_uuid 
FROM consultations c 
WHERE prescriptions.consultation_id = c.consultation_id;

-- Update medical_records
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS patient_id_uuid UUID;
UPDATE medical_records SET patient_id_uuid = p.patient_id_uuid 
FROM patients p 
WHERE medical_records.patient_id = p.patient_id;

-- Add UUID foreign keys to other tables as needed
-- Update clinic_doctors
ALTER TABLE clinic_doctors ADD COLUMN IF NOT EXISTS clinic_id_uuid UUID;
UPDATE clinic_doctors SET clinic_id_uuid = c.clinic_id_uuid 
FROM clinics c 
WHERE clinic_doctors.clinic_id = c.clinic_id;

-- Update reviews
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS patient_id_uuid UUID;
UPDATE reviews SET patient_id_uuid = p.patient_id_uuid 
FROM patients p 
WHERE reviews.patient_id = p.patient_id;

-- Update ai_chat_logs
ALTER TABLE ai_chat_logs ADD COLUMN IF NOT EXISTS user_id_uuid UUID;
UPDATE ai_chat_logs SET user_id_uuid = u.user_id_uuid 
FROM users u 
WHERE ai_chat_logs.user_id = u.user_id;

-- Add comments to document the migration status
COMMENT ON COLUMN users.user_id_uuid IS 'UUID version of user_id for compatibility with ER diagram. Primary key will be migrated in future version.';
COMMENT ON COLUMN patients.patient_id_uuid IS 'UUID version of patient_id for compatibility with ER diagram. Primary key will be migrated in future version.';
COMMENT ON COLUMN professionals.professional_id_uuid IS 'UUID version of professional_id for compatibility with ER diagram. Primary key will be migrated in future version.';
COMMENT ON COLUMN appointments.appointment_id_uuid IS 'UUID version of appointment_id for compatibility with ER diagram. Primary key will be migrated in future version.';

COMMIT;