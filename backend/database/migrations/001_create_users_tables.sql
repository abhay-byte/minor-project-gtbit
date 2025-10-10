 -- 001_create_users_tables.sql
-- Users, Patients, Professionals, Ngo_Users

BEGIN;

DROP TABLE IF EXISTS "Ngo_Users" CASCADE;
DROP TABLE IF EXISTS "Professionals" CASCADE;
DROP TABLE IF EXISTS "Patients" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;

CREATE TYPE user_role AS ENUM ('Patient', 'Professional', 'NGO', 'Admin');

CREATE TABLE "Users" (
    user_id INT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    phone_number VARCHAR(255) NOT NULL UNIQUE,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE "Patients" (
    patient_id INT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES "Users"(user_id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender VARCHAR(20),
    address VARCHAR(255) NOT NULL
);

CREATE TYPE  professional_status AS ENUM ('Pending', 'Verified', 'Rejected');

CREATE TABLE "Professionals" (
    professional_id INT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES "Users"(user_id) ON DELETE CASCADE,
    specialty VARCHAR(200),
    credentials VARCHAR(255),
    years_of_experience INT,
    verification_status   professional_status NOT NULL
);
CREATE TYPE Ngo_status AS ENUM('verified','non-verified')
CREATE TABLE "Ngo_Users" (
    ngo_user_id INT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES "Users"(user_id) ON DELETE CASCADE,
    ngo_name VARCHAR(255) NOT NULL,
    verification_status  Ngo_status DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_patients_user_id ON "Patients"(user_id);
CREATE INDEX idx_professionals_user_id ON "Professionals"(user_id);
CREATE INDEX idx_ngousers_user_id ON "Ngo_Users"(user_id);

COMMIT;
