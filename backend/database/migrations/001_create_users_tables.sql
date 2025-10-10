-- 001_create_users_tables.sql
-- Users, Patients, Professionals, NgoUsers (CamelCase table names)

BEGIN;

-- ensure clean for dev runs
DROP TABLE IF EXISTS "NgoUsers" CASCADE;
DROP TABLE IF EXISTS "Professionals" CASCADE;
DROP TABLE IF EXISTS "Patients" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;

CREATE TABLE "Users" (
    user_id INT PRIMARY KEY,
    fullName VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    contact_number VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    address VARCHAR(255),
    verification_status BOOLEAN DEFAULT FALSE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('patient','professional','ngo')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "Patients" (
    patient_id INT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES "Users"(user_id ) ON DELETE CASCADE,
    date_of_birth DATE,
    gender VARCHAR(20),
    blood_group VARCHAR(5),
    contact_number VARCHAR(30),
    emergency_contact JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "Professionals" (
    professional_id INT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES "Users"(user_id ) ON DELETE CASCADE,
    specialization VARCHAR(200),
    license_number VARCHAR(100) UNIQUE,
    experience_years INT,
    qualifications TEXT,
    contact_number VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "NgoUsers" (
    ngoUsers_id INT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES "Users"(user_id ) ON DELETE CASCADE,
    organization_name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(150),
    address TEXT,
    contact_number VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for FK lookups
CREATE INDEX idx_patients_user_id ON "Patients"(user_id);
CREATE INDEX idx_professionals_user_id ON "Professionals"(user_id);
CREATE INDEX idx_ngousers_user_id ON "NgoUsers"(user_id);

COMMIT;
