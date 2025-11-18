-- Test script to verify migration changes
-- This script checks that all new tables and columns from the ER diagram have been created

BEGIN;

-- Test 1: Check if new ENUM types were created
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM pg_type WHERE typname = 'appointment_status_extended') = 1, 'appointment_status_extended ENUM type not created';
    ASSERT (SELECT COUNT(*) FROM pg_type WHERE typname = 'dosage_form_enum') = 1, 'dosage_form_enum ENUM type not created';
    ASSERT (SELECT COUNT(*) FROM pg_type WHERE typname = 'how_to_take_enum') = 1, 'how_to_take_enum ENUM type not created';
    ASSERT (SELECT COUNT(*) FROM pg_type WHERE typname = 'reminder_status_enum') = 1, 'reminder_status_enum ENUM type not created';
    ASSERT (SELECT COUNT(*) FROM pg_type WHERE typname = 'request_status_enum') = 1, 'request_status_enum ENUM type not created';
    ASSERT (SELECT COUNT(*) FROM pg_type WHERE typname = 'upload_method_enum') = 1, 'upload_method_enum ENUM type not created';
    ASSERT (SELECT COUNT(*) FROM pg_type WHERE typname = 'conversation_type_enum') = 1, 'conversation_type_enum ENUM type not created';
    ASSERT (SELECT COUNT(*) FROM pg_type WHERE typname = 'message_type_enum') = 1, 'message_type_enum ENUM type not created';
    ASSERT (SELECT COUNT(*) FROM pg_type WHERE typname = 'session_type_enum') = 1, 'session_type_enum ENUM type not created';
    ASSERT (SELECT COUNT(*) FROM pg_type WHERE typname = 'crisis_type_enum') = 1, 'crisis_type_enum ENUM type not created';
    ASSERT (SELECT COUNT(*) FROM pg_type WHERE typname = 'crisis_level_enum') = 1, 'crisis_level_enum ENUM type not created';
    ASSERT (SELECT COUNT(*) FROM pg_type WHERE typname = 'notification_type_enum') = 1, 'notification_type_enum ENUM type not created';
    ASSERT (SELECT COUNT(*) FROM pg_type WHERE typname = 'notification_priority_enum') = 1, 'notification_priority_enum ENUM type not created';
    RAISE NOTICE 'All ENUM types created successfully';
END $$;

-- Test 2: Check if new tables were created
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'prescription_list') = 1, 'prescription_list table not created';
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'medicine_reminders') = 1, 'medicine_reminders table not created';
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'reminder_logs') = 1, 'reminder_logs table not created';
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'prescription_vault') = 1, 'prescription_vault table not created';
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'lab_report_vault') = 1, 'lab_report_vault table not created';
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'radiology_vault') = 1, 'radiology_vault table not created';
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'discharge_vault') = 1, 'discharge_vault table not created';
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'vaccination_vault') = 1, 'vaccination_vault table not created';
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'doctor_notes_vault') = 1, 'doctor_notes_vault table not created';
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'other_documents_vault') = 1, 'other_documents_vault table not created';
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'upload_report_requests') = 1, 'upload_report_requests table not created';
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'uploaded_test_reports') = 1, 'uploaded_test_reports table not created';
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'search_history') = 1, 'search_history table not created';
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'saved_locations') = 1, 'saved_locations table not created';
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'patient_doctor_conversations') = 1, 'patient_doctor_conversations table not created';
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'professional_conversations') = 1, 'professional_conversations table not created';
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'messages') = 1, 'messages table not created';
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'ai_chat_sessions') = 1, 'ai_chat_sessions table not created';
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'crisis_interventions') = 1, 'crisis_interventions table not created';
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'notification_settings') = 1, 'notification_settings table not created';
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'account_settings') = 1, 'account_settings table not created';
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'health_articles') = 1, 'health_articles table not created';
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'article_reads') = 1, 'article_reads table not created';
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'wellness_library') = 1, 'wellness_library table not created';
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'wellness_thoughts') = 1, 'wellness_thoughts table not created';
    ASSERT (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'notifications') = 1, 'notifications table not created';
    RAISE NOTICE 'All new tables created successfully';
END $$;

-- Test 3: Check if new columns were added to existing tables
DO $$
BEGIN
    -- Check appointments table
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'appointment_code') = 1, 'appointment_code column not added to appointments';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'patient_notes') = 1, 'patient_notes column not added to appointments';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'scheduled_at') = 1, 'scheduled_at column not added to appointments';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'completed_at') = 1, 'completed_at column not added to appointments';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'duration_minutes') = 1, 'duration_minutes column not added to appointments';
    
    -- Check availability_slots table
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'availability_slots' AND column_name = 'slot_date') = 1, 'slot_date column not added to availability_slots';
    
    -- Check consultations table
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'consultations' AND column_name = 'diagnosis') = 1, 'diagnosis column not added to consultations';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'consultations' AND column_name = 'doctor_recommendations') = 1, 'doctor_recommendations column not added to consultations';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'consultations' AND column_name = 'follow_up_instructions') = 1, 'follow_up_instructions column not added to consultations';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'consultations' AND column_name = 'prescription_attached') = 1, 'prescription_attached column not added to consultations';
    
    -- Check prescriptions table
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'prescription_code') = 1, 'prescription_code column not added to prescriptions';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'frequency') = 1, 'frequency column not added to prescriptions';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'duration') = 1, 'duration column not added to prescriptions';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'medication_category') = 1, 'medication_category column not added to prescriptions';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'doctor_notes') = 1, 'doctor_notes column not added to prescriptions';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'prescribed_date') = 1, 'prescribed_date column not added to prescriptions';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'is_active') = 1, 'is_active column not added to prescriptions';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'prescribed_by_doctor_id') = 1, 'prescribed_by_doctor_id column not added to prescriptions';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'doctor_name') = 1, 'doctor_name column not added to prescriptions';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'doctor_specialty') = 1, 'doctor_specialty column not added to prescriptions';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'clinic_name') = 1, 'clinic_name column not added to prescriptions';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'important_notes') = 1, 'important_notes column not added to prescriptions';
    
    -- Check medical_records table
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'medical_records' AND column_name = 'comments_notes') = 1, 'comments_notes column not added to medical_records';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'medical_records' AND column_name = 'linked_appointment_id') = 1, 'linked_appointment_id column not added to medical_records';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'medical_records' AND column_name = 'uploaded_by_user_id') = 1, 'uploaded_by_user_id column not added to medical_records';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'medical_records' AND column_name = 'uploaded_by_role') = 1, 'uploaded_by_role column not added to medical_records';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'medical_records' AND column_name = 'report_date') = 1, 'report_date column not added to medical_records';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'medical_records' AND column_name = 'file_format') = 1, 'file_format column not added to medical_records';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'medical_records' AND column_name = 'file_size_mb') = 1, 'file_size_mb column not added to medical_records';
    
    -- Check clinics table
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'clinics' AND column_name = 'facilities') = 1, 'facilities column not added to clinics';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'clinics' AND column_name = 'operating_hours') = 1, 'operating_hours column not added to clinics';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'clinics' AND column_name = 'average_rating') = 1, 'average_rating column not added to clinics';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'clinics' AND column_name = 'total_reviews') = 1, 'total_reviews column not added to clinics';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'clinics' AND column_name = 'city') = 1, 'city column not added to clinics';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'clinics' AND column_name = 'area') = 1, 'area column not added to clinics';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'clinics' AND column_name = 'pincode') = 1, 'pincode column not added to clinics';
    
    -- Check clinic_doctors table
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'clinic_doctors' AND column_name = 'qualifications') = 1, 'qualifications column not added to clinic_doctors';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'clinic_doctors' AND column_name = 'available_days') = 1, 'available_days column not added to clinic_doctors';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'clinic_doctors' AND column_name = 'available_hours') = 1, 'available_hours column not added to clinic_doctors';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'clinic_doctors' AND column_name = 'rating') = 1, 'rating column not added to clinic_doctors';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'clinic_doctors' AND column_name = 'review_count') = 1, 'review_count column not added to clinic_doctors';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'clinic_doctors' AND column_name = 'languages') = 1, 'languages column not added to clinic_doctors';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'clinic_doctors' AND column_name = 'distance_km') = 1, 'distance_km column not added to clinic_doctors';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'clinic_doctors' AND column_name = 'hospital_affiliation') = 1, 'hospital_affiliation column not added to clinic_doctors';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'clinic_doctors' AND column_name = 'is_volunteer') = 1, 'is_volunteer column not added to clinic_doctors';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'clinic_doctors' AND column_name = 'available_today') = 1, 'available_today column not added to clinic_doctors';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'clinic_doctors' AND column_name = 'available_tomorrow') = 1, 'available_tomorrow column not added to clinic_doctors';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'clinic_doctors' AND column_name = 'available_this_week') = 1, 'available_this_week column not added to clinic_doctors';
    
    -- Check reviews table
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'appreciated_aspects') = 1, 'appreciated_aspects column not added to reviews';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'feedback_suggestions') = 1, 'feedback_suggestions column not added to reviews';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'is_verified_visit') = 1, 'is_verified_visit column not added to reviews';
    
    -- Check ai_chat_logs table
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'ai_chat_logs' AND column_name = 'ai_agent_type') = 1, 'ai_agent_type column not added to ai_chat_logs';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'ai_chat_logs' AND column_name = 'ai_metadata') = 1, 'ai_metadata column not added to ai_chat_logs';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'ai_chat_logs' AND column_name = 'media_attachments') = 1, 'media_attachments column not added to ai_chat_logs';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'ai_chat_logs' AND column_name = 'media_type') = 1, 'media_type column not added to ai_chat_logs';
    
    RAISE NOTICE 'All new columns added successfully to existing tables';
END $$;

-- Test 4: Check if UUID columns were added
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'user_id_uuid') = 1, 'user_id_uuid column not added to users';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'patient_id_uuid') = 1, 'patient_id_uuid column not added to patients';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'professionals' AND column_name = 'professional_id_uuid') = 1, 'professional_id_uuid column not added to professionals';
    ASSERT (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'appointment_id_uuid') = 1, 'appointment_id_uuid column not added to appointments';
    RAISE NOTICE 'All UUID columns added successfully';
END $$;

-- Final confirmation
SELECT 'All migration tests passed successfully!' AS Status;

COMMIT;