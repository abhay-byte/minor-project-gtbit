-- ============================================
-- Clinico Database: Seed Data Script
-- Version: 1.3 - Added explicit casting for all ENUM types.
-- ============================================

BEGIN;

-- For a clean seed, we truncate all tables.
-- The CASCADE option also resets auto-incrementing sequences.
TRUNCATE TABLE
    users,
    patients,
    professionals,
    ngo_users,
    clinics,
    clinic_doctors,
    availability_slots,
    appointments,
    consultations,
    prescriptions,
    medical_records,
    reviews,
    ai_chat_logs
CASCADE;


-- Use Common Table Expressions (CTEs) to insert data and retrieve generated IDs.
-- This avoids hardcoding foreign keys and makes the script more robust.

-- 1. Insert Core Users and get their generated IDs
WITH inserted_users AS (
    INSERT INTO users (email, password_hash, full_name, phone_number, role) VALUES
    ('abhay.raj@example.com', 'hashed_password_123', 'Abhay Raj', '9876543210', 'Patient'::user_role),
    ('priya.sharma@example.com', 'hashed_password_123', 'Priya Sharma', '9876543211', 'Patient'::user_role),
    ('rajesh.kumar@example.com', 'hashed_password_123', 'Rajesh Kumar', '9876543212', 'Patient'::user_role),
    ('amit.patel@example.com', 'hashed_password_123', 'Amit Patel', '9876543213', 'Professional'::user_role),
    ('anjali.singh@example.com', 'hashed_password_123', 'Anjali Singh', '9876543214', 'Professional'::user_role),
    ('vikram.verma@example.com', 'hashed_password_123', 'Vikram Verma', '9876543215', 'Professional'::user_role),
    ('ngo.helpline@example.com', 'hashed_password_123', 'Health Alliance NGO', '9876543220', 'NGO'::user_role),
    ('admin@clinico.com', 'hashed_password_admin', 'Admin User', '9876543230', 'Admin'::user_role)
    RETURNING user_id, email, full_name
),

-- 2. Insert into role-specific tables (Patients, Professionals, NGOs)
inserted_patients AS (
    INSERT INTO patients (user_id, date_of_birth, gender, address)
    SELECT user_id, '2000-01-15'::date, 'Male', '123 Health St, New Delhi' FROM inserted_users WHERE email = 'abhay.raj@example.com'
    UNION ALL
    SELECT user_id, '1995-05-22'::date, 'Female', '456 Wellness Ave, New Delhi' FROM inserted_users WHERE email = 'priya.sharma@example.com'
    UNION ALL
    SELECT user_id, '1988-11-30'::date, 'Male', '789 Care Lane, Mumbai' FROM inserted_users WHERE email = 'rajesh.kumar@example.com'
    RETURNING patient_id, user_id
),
inserted_professionals AS (
    INSERT INTO professionals (user_id, specialty, credentials, years_of_experience, verification_status)
    SELECT user_id, 'Psychiatrist', 'MD, MBBS, License #12345', 8, 'Verified'::verification_status_enum FROM inserted_users WHERE email = 'amit.patel@example.com'
    UNION ALL
    SELECT user_id, 'General Practitioner', 'MBBS, License #67890', 5, 'Verified'::verification_status_enum FROM inserted_users WHERE email = 'anjali.singh@example.com'
    UNION ALL
    SELECT user_id, 'Cardiologist', 'MD, DM Cardiology, License #11223', 12, 'Pending'::verification_status_enum FROM inserted_users WHERE email = 'vikram.verma@example.com'
    RETURNING professional_id, user_id
),
inserted_ngos AS (
    INSERT INTO ngo_users (user_id, ngo_name, verification_status)
    SELECT user_id, 'Health Alliance India', 'Verified'::verification_status_enum FROM inserted_users WHERE email = 'ngo.helpline@example.com'
),

-- 3. Insert Clinics and Doctors
inserted_clinics AS (
    INSERT INTO clinics (name, address, latitude, longitude, phone_number, type) VALUES
    ('City General Hospital', '456 Wellness Ave, New Delhi', 28.6145, 77.2105, '011-123-4567', 'Hospital'::clinic_type_enum),
    ('Metro Clinic', '789 Care Lane, Mumbai', 19.0760, 72.8777, '022-987-6543', 'Clinic'::clinic_type_enum)
    RETURNING clinic_id, name
),
inserted_clinic_doctors AS (
    INSERT INTO clinic_doctors (clinic_id, full_name, specialty, consultation_fee)
    SELECT clinic_id, 'Dr. Alok Ranjan', 'Cardiologist', 800.00 FROM inserted_clinics WHERE name = 'City General Hospital'
    UNION ALL
    SELECT clinic_id, 'Dr. Suresh Nair', 'Psychiatrist', 600.00 FROM inserted_clinics WHERE name = 'Metro Clinic'
    RETURNING clinic_doctor_id, full_name
),

-- 4. Insert availability, appointments, consultations, and prescriptions
inserted_availability AS (
    INSERT INTO availability_slots (professional_id, start_time, end_time, is_booked)
    SELECT p.professional_id, NOW() + INTERVAL '1 day 10 hours', NOW() + INTERVAL '1 day 11 hours', FALSE
    FROM inserted_professionals p JOIN inserted_users u ON p.user_id = u.user_id WHERE u.email = 'amit.patel@example.com'
),
inserted_appointments AS (
    INSERT INTO appointments (patient_id, professional_id, clinic_doctor_id, appointment_time, status, appointment_type, consultation_link)
    -- Virtual Appointment
    SELECT pat.patient_id, prof.professional_id, NULL, NOW() + INTERVAL '3 days', 'Scheduled'::appointment_status, 'Virtual'::appointment_type_enum, 'https://meet.clinico.app/abc-123-xyz'
    FROM inserted_patients pat JOIN inserted_users u_pat ON pat.user_id = u_pat.user_id,
         inserted_professionals prof JOIN inserted_users u_prof ON prof.user_id = u_prof.user_id
    WHERE u_pat.email = 'abhay.raj@example.com' AND u_prof.email = 'amit.patel@example.com'
    UNION ALL
    -- In-Person Appointment
    SELECT pat.patient_id, NULL, cd.clinic_doctor_id, NOW() + INTERVAL '4 days', 'Scheduled'::appointment_status, 'In-Person'::appointment_type_enum, NULL
    FROM inserted_patients pat JOIN inserted_users u_pat ON pat.user_id = u_pat.user_id,
         inserted_clinic_doctors cd
    WHERE u_pat.email = 'rajesh.kumar@example.com' AND cd.full_name = 'Dr. Alok Ranjan'
    UNION ALL
    -- A completed appointment for the consultation record
    SELECT pat.patient_id, prof.professional_id, NULL, NOW() - INTERVAL '3 days', 'Completed'::appointment_status, 'Virtual'::appointment_type_enum, 'https://meet.clinico.app/abc-123-xyz'
    FROM inserted_patients pat JOIN inserted_users u_pat ON pat.user_id = u_pat.user_id,
         inserted_professionals prof JOIN inserted_users u_prof ON prof.user_id = u_prof.user_id
    WHERE u_pat.email = 'priya.sharma@example.com' AND u_prof.email = 'amit.patel@example.com'
    RETURNING appointment_id, status
),
inserted_consultation AS (
    INSERT INTO consultations (appointment_id, notes, ai_briefing)
    SELECT appointment_id,
    'Patient reports anxiety symptoms. Discussed lifestyle changes and coping mechanisms.',
    'Summary: Patient mentioned stress at work and difficulty sleeping.'
    FROM inserted_appointments WHERE status = 'Completed'::appointment_status
    RETURNING consultation_id
),
inserted_prescriptions AS (
    INSERT INTO prescriptions (consultation_id, medication_name, dosage, instructions)
    SELECT consultation_id, 'Sertraline', '50mg', 'Take one tablet every morning with food.' FROM inserted_consultation
),

-- 5. Insert Medical Records
inserted_medical_records AS (
    INSERT INTO medical_records (patient_id, document_name, document_url, document_type)
    SELECT pat.patient_id, 'Blood Test Report', 'https://storage.clinico.app/reports/blood_test.pdf', 'Blood Test'
    FROM inserted_patients pat JOIN inserted_users u ON pat.user_id = u.user_id
    WHERE u.email = 'abhay.raj@example.com'
),

-- 6. Insert Reviews
inserted_reviews AS (
    INSERT INTO reviews (patient_id, rating, comment, target_type, target_id)
    SELECT pat.patient_id, 5, 'Dr. Alok was very helpful and professional.', 'Clinic_Doctor', cd.clinic_doctor_id
    FROM inserted_patients pat JOIN inserted_users u ON pat.user_id = u.user_id,
         inserted_clinic_doctors cd
    WHERE u.email = 'rajesh.kumar@example.com' AND cd.full_name = 'Dr. Alok Ranjan'
)

-- 7. Insert AI Chat Logs
INSERT INTO ai_chat_logs (user_id, message_content, sender, "timestamp")
SELECT user_id, 'I have a sore throat and it has been bothering me for 3 days.', 'User'::sender_type, NOW() - INTERVAL '5 minutes' FROM inserted_users WHERE email = 'abhay.raj@example.com'
UNION ALL
SELECT user_id, 'I understand. A sore throat lasting 3 days could be due to viral or bacterial infection.', 'AI'::sender_type, NOW() - INTERVAL '4 minutes' FROM inserted_users WHERE email = 'abhay.raj@example.com';


-- Final confirmation
SELECT 'Seed data successfully inserted!' AS Status;

COMMIT;

