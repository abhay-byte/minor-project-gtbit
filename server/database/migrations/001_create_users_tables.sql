-- Migration script to create core user and role-specific tables.
-- Version: 1

-- Begin a transaction
BEGIN;

-- Create custom ENUM types to enforce specific value constraints,
-- which is more efficient and safer than using VARCHAR with CHECK constraints.

-- Defines the possible roles a user can have within the system.
CREATE TYPE user_role AS ENUM (
    'Patient',
    'Professional',
    'NGO',
    'Admin'
);

-- Defines the verification statuses for professionals and NGOs.
CREATE TYPE verification_status_enum AS ENUM (
    'Pending',
    'Verified',
    'Rejected'
);


-- 1. Create the central 'users' table
-- This table holds the common login and identity information for all users.
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role user_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comments for clarity on key columns.
COMMENT ON COLUMN users.user_id IS 'Primary Key. Unique identifier for every user.';
COMMENT ON COLUMN users.email IS 'The user''s login email. Must be unique.';
COMMENT ON COLUMN users.role IS 'Defines the user''s role and permissions (Patient, Professional, NGO, Admin).';


-- 2. Create the 'patients' table
-- This table stores extra information for users with the 'Patient' role.
CREATE TABLE patients (
    patient_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(50),
    address VARCHAR(255),
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE -- If a user is deleted, their patient profile is also deleted.
);

COMMENT ON COLUMN patients.patient_id IS 'Primary Key. Unique identifier for a patient profile.';
COMMENT ON COLUMN patients.user_id IS 'Foreign Key. Links one-to-one with the users table.';


-- 3. Create the 'professionals' table
-- This table stores extra information for users with the 'Professional' role.
CREATE TABLE professionals (
    professional_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    specialty VARCHAR(100),
    credentials TEXT,
    years_of_experience INT CHECK (years_of_experience >= 0),
    verification_status verification_status_enum NOT NULL DEFAULT 'Pending',
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE -- If a user is deleted, their professional profile is also deleted.
);

COMMENT ON COLUMN professionals.professional_id IS 'Primary Key. Unique identifier for a professional profile.';
COMMENT ON COLUMN professionals.user_id IS 'Foreign Key. Links one-to-one with the users table.';
COMMENT ON COLUMN professionals.verification_status IS 'Admin verification status (Pending, Verified, Rejected).';


-- 4. Create the 'ngo_users' table
-- This table stores information specific to users associated with an NGO.
CREATE TABLE ngo_users (
    ngo_user_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    ngo_name VARCHAR(255) NOT NULL,
    verification_status verification_status_enum NOT NULL DEFAULT 'Pending',
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE -- If a user is deleted, their NGO profile is also deleted.
);

COMMENT ON COLUMN ngo_users.ngo_user_id IS 'Primary Key. Unique identifier for an NGO user profile.';
COMMENT ON COLUMN ngo_users.user_id IS 'Foreign Key. Links one-to-one with the users table.';


-- Add indexes on foreign key columns for faster joins and lookups.
-- Note: The UNIQUE constraint on user_id in child tables already creates an index automatically,
-- but explicit index creation is shown here for completeness and clarity.
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_professionals_user_id ON professionals(user_id);
CREATE INDEX idx_ngo_users_user_id ON ngo_users(user_id);


-- Commit the transaction
COMMIT;