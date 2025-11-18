-- Migration script to add missing tables according to ER diagram
-- Version: 5
-- Depends on: 004_create_interaction_tables.sql

BEGIN;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom ENUM types needed for the new tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status_extended') THEN
        CREATE TYPE appointment_status_extended AS ENUM (
            'Scheduled',
            'InProgress',
            'Completed',
            'Cancelled'
        );
    END IF;
END $$;

-- Update the existing appointment_status type by adding new values to the existing enum
DO $$
BEGIN
    BEGIN
        ALTER TYPE appointment_status ADD VALUE 'InProgress';
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;

-- Update users table to add missing columns from ER diagram
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_sync TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_user BOOLEAN DEFAULT FALSE;

-- Update patients table to add missing columns from ER diagram
ALTER TABLE patients ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS marital_status VARCHAR(20);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS known_allergies TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS chronic_conditions TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS current_medications TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS lifestyle_notes TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS member_since TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE patients ADD COLUMN IF NOT EXISTS patient_code VARCHAR(20) UNIQUE;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS current_location TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS current_full_address TEXT;

-- Update professionals table to add missing columns from ER diagram
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS patients_treated INTEGER DEFAULT 0;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS languages_spoken TEXT;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS working_hours TEXT;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS is_volunteer BOOLEAN DEFAULT FALSE;

-- Add missing columns to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_code VARCHAR(20) UNIQUE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_notes TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;

-- Update availability_slots table to add missing column
ALTER TABLE availability_slots ADD COLUMN IF NOT EXISTS slot_date DATE;

-- Update consultations table to add missing columns
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS diagnosis TEXT;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS doctor_recommendations TEXT;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS follow_up_instructions TEXT;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS prescription_attached BOOLEAN DEFAULT FALSE;

-- Update prescriptions table to add missing columns
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS prescription_code VARCHAR(20);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS frequency VARCHAR(100);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS duration VARCHAR(50);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS medication_category VARCHAR(50);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS doctor_notes TEXT;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS prescribed_date DATE;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS prescribed_by_doctor_id INTEGER; -- Changed to INTEGER to match professionals table
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS doctor_name VARCHAR(255);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS doctor_specialty VARCHAR(50);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS clinic_name VARCHAR(255);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS important_notes TEXT;

-- Add foreign key constraint for prescribed_by_doctor_id
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_prescribed_by_doctor') THEN
        ALTER TABLE prescriptions ADD CONSTRAINT fk_prescribed_by_doctor FOREIGN KEY (prescribed_by_doctor_id) REFERENCES professionals(professional_id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create prescription_list table
CREATE TABLE IF NOT EXISTS prescription_list (
    list_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id INTEGER NOT NULL,
    prescription_id INTEGER NOT NULL, -- Changed to INTEGER to match prescriptions table
    condition_treated VARCHAR(255),
    medicines_count INTEGER,
    next_followup DATE,
    prescription_status VARCHAR(20) DEFAULT 'Active',
    last_viewed TIMESTAMPTZ,
    CONSTRAINT fk_prescription_list_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    CONSTRAINT fk_prescription_list_prescription FOREIGN KEY (prescription_id) REFERENCES prescriptions(prescription_id) ON DELETE CASCADE
);

-- Create medicine_reminders table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dosage_form_enum') THEN
        CREATE TYPE dosage_form_enum AS ENUM ('1 tablet', '1 capsule', 'Other');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'how_to_take_enum') THEN
        CREATE TYPE how_to_take_enum AS ENUM ('After food', 'Before food', 'After breakfast', 'Other');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS medicine_reminders (
    reminder_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id INTEGER NOT NULL,
    prescription_id INTEGER, -- Changed to INTEGER to match prescriptions table
    medication_name VARCHAR(255),
    dosage_form dosage_form_enum,
    timing_schedule TEXT,
    how_to_take how_to_take_enum,
    duration TEXT,
    doctor_note TEXT,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    next_reminder_time TIMESTAMPTZ,
    CONSTRAINT fk_medicine_reminder_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    CONSTRAINT fk_medicine_reminder_prescription FOREIGN KEY (prescription_id) REFERENCES prescriptions(prescription_id) ON DELETE SET NULL
);

-- Create reminder_logs table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reminder_status_enum') THEN
        CREATE TYPE reminder_status_enum AS ENUM ('Pending', 'Taken', 'Missed', 'Snoozed');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS reminder_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reminder_id UUID NOT NULL,
    scheduled_time TIMESTAMPTZ NOT NULL,
    taken_time TIMESTAMPTZ,
    status reminder_status_enum NOT NULL DEFAULT 'Pending',
    notes TEXT,
    CONSTRAINT fk_reminder_log FOREIGN KEY (reminder_id) REFERENCES medicine_reminders(reminder_id) ON DELETE CASCADE
);

-- Update medical_records table to add missing columns
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS comments_notes TEXT;
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS linked_appointment_id INTEGER; -- Changed to INTEGER to match appointments table
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS uploaded_by_user_id INTEGER NOT NULL; -- Changed to INTEGER to match users table
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS uploaded_by_role VARCHAR(20);
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS report_date DATE;
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS file_format VARCHAR(20);
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS file_size_mb INTEGER;

-- Add foreign key for linked_appointment_id
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_linked_appointment') THEN
        ALTER TABLE medical_records ADD CONSTRAINT fk_linked_appointment FOREIGN KEY (linked_appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create medical vault tables
CREATE TABLE IF NOT EXISTS prescription_vault (
    vault_prescription_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id INTEGER NOT NULL,
    document_url VARCHAR(255),
    metadata TEXT,
    file_count INTEGER DEFAULT 0,
    CONSTRAINT fk_vault_prescription_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lab_report_vault (
    vault_lab_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id INTEGER NOT NULL,
    document_url VARCHAR(255),
    metadata TEXT,
    file_count INTEGER DEFAULT 0,
    CONSTRAINT fk_vault_lab_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS radiology_vault (
    vault_radiology_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id INTEGER NOT NULL,
    document_url VARCHAR(255),
    metadata TEXT,
    file_count INTEGER DEFAULT 0,
    CONSTRAINT fk_vault_radiology_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS discharge_vault (
    vault_discharge_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id INTEGER NOT NULL,
    document_url VARCHAR(255),
    metadata TEXT,
    file_count INTEGER DEFAULT 0,
    CONSTRAINT fk_vault_discharge_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vaccination_vault (
    vault_vaccination_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id INTEGER NOT NULL,
    document_url VARCHAR(255),
    metadata TEXT,
    file_count INTEGER DEFAULT 0,
    CONSTRAINT fk_vault_vaccination_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS doctor_notes_vault (
    vault_notes_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id INTEGER NOT NULL,
    document_url VARCHAR(255),
    metadata TEXT,
    file_count INTEGER DEFAULT 0,
    CONSTRAINT fk_vault_notes_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS other_documents_vault (
    vault_other_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id INTEGER NOT NULL,
    document_url VARCHAR(255),
    metadata TEXT,
    file_count INTEGER DEFAULT 0,
    CONSTRAINT fk_vault_other_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- Create upload_report_requests table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status_enum') THEN
        CREATE TYPE request_status_enum AS ENUM ('Pending', 'Submitted', 'Reviewed');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS upload_report_requests (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id INTEGER NOT NULL,
    professional_id INTEGER NOT NULL,
    request_code VARCHAR(30) UNIQUE,
    prescription_date DATE,
    requested_tests TEXT,
    due_date DATE,
    status request_status_enum DEFAULT 'Pending',
    additional_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_upload_request_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    CONSTRAINT fk_upload_request_professional FOREIGN KEY (professional_id) REFERENCES professionals(professional_id) ON DELETE CASCADE
);

-- Create uploaded_test_reports table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'upload_method_enum') THEN
        CREATE TYPE upload_method_enum AS ENUM ('File', 'Camera');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS uploaded_test_reports (
    upload_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL,
    test_type VARCHAR(100),
    document_url VARCHAR(255),
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    upload_method upload_method_enum,
    CONSTRAINT fk_uploaded_report_request FOREIGN KEY (request_id) REFERENCES upload_report_requests(request_id) ON DELETE CASCADE
);

-- Update clinics table to add missing columns
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS facilities TEXT;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS operating_hours TEXT;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS area VARCHAR(100);
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS pincode VARCHAR(10);

-- Update clinic_doctors table to add missing columns
ALTER TABLE clinic_doctors ADD COLUMN IF NOT EXISTS qualifications TEXT;
ALTER TABLE clinic_doctors ADD COLUMN IF NOT EXISTS available_days TEXT;
ALTER TABLE clinic_doctors ADD COLUMN IF NOT EXISTS available_hours TEXT;
ALTER TABLE clinic_doctors ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE clinic_doctors ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE clinic_doctors ADD COLUMN IF NOT EXISTS languages TEXT;
ALTER TABLE clinic_doctors ADD COLUMN IF NOT EXISTS distance_km VARCHAR(20);
ALTER TABLE clinic_doctors ADD COLUMN IF NOT EXISTS hospital_affiliation VARCHAR(255);
ALTER TABLE clinic_doctors ADD COLUMN IF NOT EXISTS is_volunteer BOOLEAN DEFAULT FALSE;
ALTER TABLE clinic_doctors ADD COLUMN IF NOT EXISTS available_today BOOLEAN DEFAULT FALSE;
ALTER TABLE clinic_doctors ADD COLUMN IF NOT EXISTS available_tomorrow BOOLEAN DEFAULT FALSE;
ALTER TABLE clinic_doctors ADD COLUMN IF NOT EXISTS available_this_week BOOLEAN DEFAULT FALSE;

-- Create search_history table
CREATE TABLE IF NOT EXISTS search_history (
    search_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id INTEGER NOT NULL,
    search_query VARCHAR(255),
    search_filters TEXT,
    searched_at TIMESTAMPTZ DEFAULT NOW(),
    location_searched TEXT,
    results_count INTEGER,
    CONSTRAINT fk_search_history_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- Create saved_locations table
CREATE TABLE IF NOT EXISTS saved_locations (
    location_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id INTEGER NOT NULL,
    location_name VARCHAR(10),
    full_address TEXT,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    is_current_location BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_saved_locations_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- Create conversation tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conversation_type_enum') THEN
        CREATE TYPE conversation_type_enum AS ENUM ('Appointment', 'Follow-up', 'Query');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS patient_doctor_conversations (
    conversation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id INTEGER NOT NULL,
    professional_id INTEGER NOT NULL,
    appointment_id INTEGER, -- Changed to INTEGER to match appointments table
    last_message_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    conversation_type conversation_type_enum,
    CONSTRAINT fk_conversation_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    CONSTRAINT fk_conversation_professional FOREIGN KEY (professional_id) REFERENCES professionals(professional_id) ON DELETE CASCADE,
    CONSTRAINT fk_conversation_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS professional_conversations (
    conversation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professional_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    appointment_id INTEGER, -- Changed to INTEGER to match appointments table
    last_message_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_prof_conversation_professional FOREIGN KEY (professional_id) REFERENCES professionals(professional_id) ON DELETE CASCADE,
    CONSTRAINT fk_prof_conversation_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    CONSTRAINT fk_prof_conversation_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL
);

-- Create messages table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sender_type_extended') THEN
        CREATE TYPE sender_type_extended AS ENUM ('Patient', 'Doctor', 'System');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_type_enum') THEN
        CREATE TYPE message_type_enum AS ENUM ('Text', 'Prescription', 'Report', 'JoinCall', 'Submitted');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL,
    sender_user_id INTEGER NOT NULL, -- Changed to INTEGER to match users table
    sender_type sender_type_extended NOT NULL,
    message_content TEXT,
    message_type message_type_enum DEFAULT 'Text',
    attachment_url VARCHAR(255),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    CONSTRAINT fk_message_conversation FOREIGN KEY (conversation_id) REFERENCES patient_doctor_conversations(conversation_id) ON DELETE CASCADE,
    CONSTRAINT fk_message_sender_user FOREIGN KEY (sender_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Update ai_chat_logs table to add missing columns
ALTER TABLE ai_chat_logs ADD COLUMN IF NOT EXISTS ai_agent_type VARCHAR(50);
ALTER TABLE ai_chat_logs ADD COLUMN IF NOT EXISTS ai_metadata JSON;
ALTER TABLE ai_chat_logs ADD COLUMN IF NOT EXISTS media_attachments TEXT;
ALTER TABLE ai_chat_logs ADD COLUMN IF NOT EXISTS media_type VARCHAR(20);

-- Create ai_chat_sessions table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_type_enum') THEN
        CREATE TYPE session_type_enum AS ENUM ('Health Query', 'Mental Wellness', 'Triage', 'Crisis');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crisis_type_enum') THEN
        CREATE TYPE crisis_type_enum AS ENUM ('Suicidal', 'Self-harm', 'Severe distress');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS ai_chat_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id INTEGER NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    session_type session_type_enum,
    session_summary TEXT,
    escalated_to_professional BOOLEAN DEFAULT FALSE,
    crisis_detected BOOLEAN DEFAULT FALSE,
    crisis_type crisis_type_enum,
    CONSTRAINT fk_ai_session_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- Create crisis_interventions table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crisis_level_enum') THEN
        CREATE TYPE crisis_level_enum AS ENUM ('Critical', 'High', 'Moderate');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS crisis_interventions (
    intervention_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL,
    patient_id INTEGER NOT NULL,
    crisis_level crisis_level_enum,
    crisis_keywords TEXT,
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    helpline_provided TEXT,
    action_taken VARCHAR(100),
    patient_acknowledged BOOLEAN DEFAULT FALSE,
    follow_up_notes TEXT,
    CONSTRAINT fk_crisis_intervention_session FOREIGN KEY (session_id) REFERENCES ai_chat_sessions(session_id) ON DELETE CASCADE,
    CONSTRAINT fk_crisis_intervention_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- Update reviews table to add missing columns
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS appreciated_aspects TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS feedback_suggestions TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_verified_visit BOOLEAN DEFAULT FALSE;

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
    settings_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER NOT NULL, -- Changed to INTEGER to match users table
    all_notifications_enabled BOOLEAN DEFAULT TRUE,
    appointment_alerts BOOLEAN DEFAULT TRUE,
    incoming_calls BOOLEAN DEFAULT TRUE,
    incoming_video_calls BOOLEAN DEFAULT TRUE,
    medical_reminders BOOLEAN DEFAULT TRUE,
    vibration_alerts BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_notification_settings_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create account_settings table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_preference_enum') THEN
        CREATE TYPE notification_preference_enum AS ENUM ('All', 'Important', 'None');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS account_settings (
    settings_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER NOT NULL, -- Changed to INTEGER to match users table
    preferred_language VARCHAR(20) DEFAULT 'English',
    dark_mode BOOLEAN DEFAULT FALSE,
    notification_preference notification_preference_enum DEFAULT 'All',
    biometric_enabled BOOLEAN DEFAULT FALSE,
    last_password_change TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_account_settings_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create health_articles table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_type_enum') THEN
        CREATE TYPE content_type_enum AS ENUM ('Article', 'Video');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'article_category_enum') THEN
        CREATE TYPE article_category_enum AS ENUM ('Mental Wellness', 'Health Awareness', 'Mindfulness', 'Exercise', 'Sleep');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS health_articles (
    article_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    content_type content_type_enum,
    category article_category_enum,
    author VARCHAR(255),
    published_date DATE,
    thumbnail_url VARCHAR(255),
    video_url VARCHAR(255),
    duration_minutes INTEGER,
    view_count INTEGER DEFAULT 0,
    tags TEXT,
    verified_content BOOLEAN DEFAULT FALSE,
    read_time_minutes INTEGER
);

-- Create article_reads table
CREATE TABLE IF NOT EXISTS article_reads (
    read_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id INTEGER NOT NULL,
    article_id UUID NOT NULL,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    time_spent_seconds INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    saved_to_library BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_article_read_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    CONSTRAINT fk_article_read_article FOREIGN KEY (article_id) REFERENCES health_articles(article_id) ON DELETE CASCADE
);

-- Create wellness_library table
CREATE TABLE IF NOT EXISTS wellness_library (
    library_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id INTEGER NOT NULL,
    article_id UUID NOT NULL,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    personal_notes TEXT,
    CONSTRAINT fk_wellness_library_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    CONSTRAINT fk_wellness_library_article FOREIGN KEY (article_id) REFERENCES health_articles(article_id) ON DELETE CASCADE
);

-- Create wellness_thoughts table
CREATE TABLE IF NOT EXISTS wellness_thoughts (
    thought_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id INTEGER NOT NULL,
    article_id UUID,
    comment TEXT,
    posted_at TIMESTAMPTZ DEFAULT NOW(),
    is_anonymous BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_wellness_thought_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    CONSTRAINT fk_wellness_thought_article FOREIGN KEY (article_id) REFERENCES health_articles(article_id) ON DELETE SET NULL
);

-- Create notifications table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type_enum') THEN
        CREATE TYPE notification_type_enum AS ENUM ('Appointment', 'Medicine', 'Prescription', 'Report', 'Article', 'AppUpdate');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_priority_enum') THEN
        CREATE TYPE notification_priority_enum AS ENUM ('Urgent', 'Normal', 'Low');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER NOT NULL, -- Changed to INTEGER to match users table
    notification_type notification_type_enum NOT NULL,
    title VARCHAR(255),
    message TEXT,
    priority notification_priority_enum DEFAULT 'Normal',
    scheduled_time TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    is_read BOOLEAN DEFAULT FALSE,
    action_data JSON,
    icon VARCHAR(50),
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

COMMIT;