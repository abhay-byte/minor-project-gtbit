-- ============================================
-- Clinico Database: Fixed Seed Data Script
-- Updated to match migration scripts and ER diagram
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
    ai_chat_logs,
    prescription_list,
    medicine_reminders,
    reminder_logs,
    prescription_vault,
    lab_report_vault,
    radiology_vault,
    discharge_vault,
    vaccination_vault,
    doctor_notes_vault,
    other_documents_vault,
    upload_report_requests,
    uploaded_test_reports,
    search_history,
    saved_locations,
    patient_doctor_conversations,
    professional_conversations,
    messages,
    ai_chat_sessions,
    crisis_interventions,
    notification_settings,
    account_settings,
    health_articles,
    article_reads,
    wellness_library,
    wellness_thoughts,
    notifications
CASCADE;

-- 1. Insert Core Users and get their generated IDs
WITH inserted_users AS (
    INSERT INTO users (email, password_hash, full_name, phone_number, role, last_sync, verified_user, user_id_uuid) VALUES
    ('abhay.raj@example.com', 'hashed_password_123', 'Abhay Raj', '9876543210', 'Patient', NOW(), true, gen_random_uuid()),
    ('priya.sharma@example.com', 'hashed_password_123', 'Priya Sharma', '9876543211', 'Patient', NOW(), true, gen_random_uuid()),
    ('rajesh.kumar@example.com', 'hashed_password_123', 'Rajesh Kumar', '9876543212', 'Patient', NOW(), true, gen_random_uuid()),
    ('amit.patel@example.com', 'hashed_password_123', 'Amit Patel', '9876543213', 'Professional', NOW(), true, gen_random_uuid()),
    ('anjali.singh@example.com', 'hashed_password_123', 'Anjali Singh', '9876543214', 'Professional', NOW(), true, gen_random_uuid()),
    ('vikram.verma@example.com', 'hashed_password_123', 'Vikram Verma', '9876543215', 'Professional', NOW(), true, gen_random_uuid()),
    ('ngo.helpline@example.com', 'hashed_password_123', 'Health Alliance NGO', '9876543220', 'NGO', NOW(), true, gen_random_uuid()),
    ('admin@clinico.com', 'hashed_password_admin', 'Admin User', '9876543230', 'Admin', NOW(), true, gen_random_uuid())
    RETURNING user_id, email, full_name, user_id_uuid
),

-- 2. Insert into role-specific tables (Patients, Professionals, NGOs)
inserted_patients AS (
    INSERT INTO patients (user_id, date_of_birth, gender, address, blood_group, marital_status, known_allergies, chronic_conditions, current_medications, lifestyle_notes, member_since, patient_code, current_location, current_full_address)
    SELECT user_id, '2000-01-15'::date, 'Male', '123 Health St, New Delhi', 'O+', 'Single', 'None', 'None', 'None', 'Non-smoker, exercises regularly', NOW(), 'PT-2025-0001', 'New Delhi', '123, Block A, Sector 14, Dwarka, New Delhi - 110078' FROM inserted_users WHERE email = 'abhay.raj@example.com'
    UNION ALL
    SELECT user_id, '1995-05-22'::date, 'Female', '456 Wellness Ave, New Delhi', 'B+', 'Single', 'Penicillin', 'Hypertension', 'Amlodipine 5mg daily', 'Non-smoker', NOW(), 'PT-2025-0002', 'New Delhi', '456, Wellness Ave, New Delhi - 110001' FROM inserted_users WHERE email = 'priya.sharma@example.com'
    UNION ALL
    SELECT user_id, '1988-11-30'::date, 'Male', '789 Care Lane, Mumbai', 'A+', 'Married', 'Sulfa drugs', 'Diabetes', 'Metformin 500mg twice daily', 'Exercises 3 times a week', NOW(), 'PT-2025-0003', 'Mumbai', '789 Care Lane, Mumbai - 400001' FROM inserted_users WHERE email = 'rajesh.kumar@example.com'
    RETURNING patient_id, user_id
),
inserted_professionals AS (
    INSERT INTO professionals (
        user_id, specialty, credentials, years_of_experience, 
        verification_status, rating, total_reviews, patients_treated, 
        languages_spoken, working_hours, is_volunteer
    )
    SELECT user_id, 'Psychiatrist', 'MD, MBBS, License #12345', 8,
        'Verified'::verification_status_enum, 4.7, 120, 500,
        'Hindi, English', '10:30am-12:30pm, 4:30pm-7:30pm', false
    FROM inserted_users WHERE email = 'amit.patel@example.com'

    UNION ALL

    SELECT user_id, 'General Practitioner', 'MBBS, License #67890', 5,
        'Verified'::verification_status_enum, 4.5, 85, 320,
        'English, Hindi', '9:00am-5:00pm', false
    FROM inserted_users WHERE email = 'anjali.singh@example.com'

    UNION ALL

    SELECT user_id, 'Cardiologist', 'MD, DM Cardiology, License #11223', 12,
        'Pending'::verification_status_enum, 0.0, 0, 0,
        'English, Hindi, Tamil', '10:00am-6:00pm', true
    FROM inserted_users WHERE email = 'vikram.verma@example.com'

    RETURNING professional_id, user_id, specialty
)
,
inserted_ngos AS (
    INSERT INTO ngo_users (user_id, ngo_name, verification_status)
    SELECT user_id, 'Health Alliance India', 'Verified'::verification_status_enum FROM inserted_users WHERE email = 'ngo.helpline@example.com'
    RETURNING ngo_user_id, user_id
),

-- 3. Insert Clinics and Doctors
inserted_clinics AS (
    INSERT INTO clinics (name, address, latitude, longitude, phone_number, type, facilities, operating_hours, average_rating, total_reviews, city, area, pincode) VALUES
    ('City General Hospital', '456 Wellness Ave, New Delhi', 28.6145, 77.2105, '01-123-4567', 'Hospital'::clinic_type_enum, 'Emergency, Lab, Pharmacy, ICU', '24/7', 4.5, 250, 'New Delhi', 'Connaught Place', '110001'),
    ('Metro Clinic', '789 Care Lane, Mumbai', 19.0760, 72.8777, '022-987-6543', 'Clinic'::clinic_type_enum, 'Consultation, Lab, Pharmacy', '9:00 AM - 8:00 PM', 4.2, 180, 'Mumbai', 'Bandra', '400050')
    RETURNING clinic_id, name
),
inserted_clinic_doctors AS (
    INSERT INTO clinic_doctors (clinic_id, full_name, specialty, consultation_fee, qualifications, available_days, available_hours, rating, review_count, languages, distance_km, hospital_affiliation, is_volunteer, available_today, available_tomorrow, available_this_week)
    SELECT clinic_id, 'Dr. Alok Ranjan', 'Cardiologist', 800.00, 'MBBS, MD', 'Mon-Fri', '9:00 AM - 5:00 PM', 4.6, 95, 'English, Hindi', '1.6 km', 'City General Hospital', false, true, true, true FROM inserted_clinics WHERE name = 'City General Hospital'
    UNION ALL
    SELECT clinic_id, 'Dr. Suresh Nair', 'Psychiatrist', 600.00, 'MBBS, MD Psychiatry', 'Tue-Sat', '10:00 AM - 6:00 PM', 4.3, 78, 'English, Hindi, Malayalam', '2.2 km', 'Metro Clinic', false, true, false, true FROM inserted_clinics WHERE name = 'Metro Clinic'
    RETURNING clinic_doctor_id, full_name
),

-- 4. Insert availability slots
inserted_availability AS (
    INSERT INTO availability_slots (professional_id, start_time, end_time, is_booked, slot_date)
    SELECT p.professional_id, NOW() + INTERVAL '1 day 10 hours', NOW() + INTERVAL '1 day 11 hours', false, CURRENT_DATE + INTERVAL '1 day'
    FROM inserted_professionals p JOIN inserted_users u ON p.user_id = u.user_id WHERE u.email = 'amit.patel@example.com'
    UNION ALL
    SELECT p.professional_id, NOW() + INTERVAL '2 days 14 hours', NOW() + INTERVAL '2 days 15 hours', false, CURRENT_DATE + INTERVAL '2 days'
    FROM inserted_professionals p JOIN inserted_users u ON p.user_id = u.user_id WHERE u.email = 'anjali.singh@example.com'
    RETURNING slot_id
),

-- 5. Insert appointments
inserted_appointments AS (
    INSERT INTO appointments (
        patient_id, professional_id, clinic_doctor_id, appointment_time,
        status, appointment_type, consultation_link, appointment_code,
        patient_notes, scheduled_at, completed_at, duration_minutes
    )

    -- 1st SELECT
    SELECT 
        pat.patient_id,
        prof.professional_id,
        NULL,
        NOW() + INTERVAL '3 days',
        'Scheduled'::appointment_status,
        'Virtual'::appointment_type_enum,
        'https://meet.clinico.app/abc-123-xyz',
        'APT-0001',
        'Follow-up for anxiety treatment',
        NOW(),
        NULL::timestamptz,
        30
    FROM inserted_patients pat 
    JOIN inserted_users u_pat ON pat.user_id = u_pat.user_id,
         inserted_professionals prof 
    JOIN inserted_users u_prof ON prof.user_id = u_prof.user_id
    WHERE u_pat.email = 'abhay.raj@example.com' 
      AND u_prof.email = 'amit.patel@example.com'

    UNION ALL

    -- 2nd SELECT
    SELECT 
        pat.patient_id,
        NULL,
        cd.clinic_doctor_id,
        NOW() + INTERVAL '4 days',
        'Scheduled'::appointment_status,
        'In-Person'::appointment_type_enum,
        NULL,
        'APT-0002',
        'Regular checkup',
        NOW(),
        NULL::timestamptz,
        45
    FROM inserted_patients pat 
    JOIN inserted_users u_pat ON pat.user_id = u_pat.user_id,
         inserted_clinic_doctors cd
    WHERE u_pat.email = 'rajesh.kumar@example.com' 
      AND cd.full_name = 'Dr. Alok Ranjan'

    UNION ALL

    -- 3rd SELECT
    SELECT 
        pat.patient_id,
        prof.professional_id,
        NULL,
        (NOW() - INTERVAL '3 days')::timestamptz,
        'Completed'::appointment_status,
        'Virtual'::appointment_type_enum,
        'https://meet.clinico.app/def-456-uvw',
        'APT-0003',
        'Initial consultation for depression',
        (NOW() - INTERVAL '4 days')::timestamptz,
        (NOW() - INTERVAL '3 days')::timestamptz,
        45
    FROM inserted_patients pat 
    JOIN inserted_users u_pat ON pat.user_id = u_pat.user_id,
         inserted_professionals prof 
    JOIN inserted_users u_prof ON prof.user_id = u_prof.user_id
    WHERE u_pat.email = 'priya.sharma@example.com' 
      AND u_prof.email = 'amit.patel@example.com'

    RETURNING appointment_id, patient_id, professional_id, status
),

-- 6. Insert consultations
inserted_consultations AS (
    INSERT INTO consultations (appointment_id, notes, ai_briefing, diagnosis, doctor_recommendations, follow_up_instructions, prescription_attached)
    SELECT appointment_id,
    'Patient reports ongoing anxiety symptoms. Discussed lifestyle changes and coping mechanisms. Prescribed Sertraline 50mg.',
    'Summary: Patient mentioned work stress and difficulty sleeping. Previous mild depression noted.',
    'Generalized Anxiety Disorder with mild depressive symptoms',
    'Continue therapy sessions, monitor medication effectiveness, regular follow-ups',
    'Follow up in 2 weeks, take medication as prescribed, continue mindfulness exercises',
    true
    FROM inserted_appointments WHERE status = 'Completed'::appointment_status
    RETURNING consultation_id, appointment_id
),

-- 7. Insert prescriptions
inserted_prescriptions AS (
    INSERT INTO prescriptions (consultation_id, medication_name, dosage, instructions, prescription_code, frequency, duration, medication_category, doctor_notes, prescribed_date, is_active, prescribed_by_doctor_id, doctor_name, doctor_specialty, clinic_name, important_notes)
    SELECT c.consultation_id, 'Sertraline', '50mg', 'Take one tablet every morning with food.', 'DRX-2001', 'Once daily', '4 weeks', 'Antidepressant', 'Monitor for side effects, especially in first week', CURRENT_DATE, true, 
    prof.professional_id, 
    u_prof.full_name, 
    prof.specialty, 
    'Virtual Consultation', 
    'Complete full course of medication, contact doctor if side effects occur'
    FROM inserted_consultations c
    JOIN inserted_appointments a ON c.appointment_id = a.appointment_id
    JOIN inserted_professionals prof ON a.professional_id = prof.professional_id
    JOIN inserted_users u_prof ON prof.user_id = u_prof.user_id
    RETURNING prescription_id, consultation_id
),

-- 8. Insert Prescription List
inserted_prescription_list AS (
    INSERT INTO prescription_list (patient_id, prescription_id, condition_treated, medicines_count, next_followup, prescription_status, last_viewed)
    SELECT a.patient_id, pr.prescription_id, 'Anxiety and Depression', 1, CURRENT_DATE + INTERVAL '14 days', 'Active', NOW()
    FROM inserted_prescriptions pr
    JOIN inserted_consultations c ON pr.consultation_id = c.consultation_id
    JOIN inserted_appointments a ON c.appointment_id = a.appointment_id
    RETURNING list_id
),

-- 9. Insert Medicine Reminders
inserted_medicine_reminders AS (
    INSERT INTO medicine_reminders (patient_id, prescription_id, medication_name, dosage_form, timing_schedule, how_to_take, duration, doctor_note, start_date, end_date, is_active, next_reminder_time)
    SELECT a.patient_id, pr.prescription_id, 'Sertraline 50mg', '1 tablet', 'Morning 8:00 AM', 'After food', '28 days (Nov 17 - Dec 15)', 'Take with breakfast, monitor mood changes', CURRENT_DATE, CURRENT_DATE + INTERVAL '28 days', true, NOW() + INTERVAL '1 day 8 hours'
    FROM inserted_prescriptions pr
    JOIN inserted_consultations c ON pr.consultation_id = c.consultation_id
    JOIN inserted_appointments a ON c.appointment_id = a.appointment_id
    RETURNING reminder_id
),

-- 10. Insert Reminder Logs
inserted_reminder_logs AS (
    INSERT INTO reminder_logs (reminder_id, scheduled_time, taken_time, status, notes)
    SELECT reminder_id, NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours', 'Taken'::reminder_status_enum, 'Taken on time'
    FROM inserted_medicine_reminders
    UNION ALL
    SELECT reminder_id, NOW(), NULL, 'Pending', NULL
    FROM inserted_medicine_reminders
    RETURNING log_id
),

-- 11. Insert Medical Records
inserted_medical_records AS (
    INSERT INTO medical_records (patient_id, document_name, document_url, document_type, comments_notes, uploaded_by_user_id, uploaded_by_role, report_date, file_format, file_size_mb)
    SELECT pat.patient_id, 'Blood Test Report - CBC', 'https://storage.clinico.app/reports/blood_test_001.pdf', 'Lab Report (CBC)', 'Normal results, slight elevation in cholesterol', pat.user_id, 'Self', CURRENT_DATE - INTERVAL '5 days', 'PDF', 2
    FROM inserted_patients pat JOIN inserted_users u ON pat.user_id = u.user_id
    WHERE u.email = 'abhay.raj@example.com'
    UNION ALL
    SELECT pat.patient_id, 'X-Ray Chest', 'https://storage.clinico.app/reports/xray_chest_001.pdf', 'Radiology', 'Clear lungs, no abnormalities detected', u_prof.user_id, 'Doctor', CURRENT_DATE - INTERVAL '10 days', 'PDF', 1
    FROM inserted_patients pat 
    JOIN inserted_users u ON pat.user_id = u.user_id
    CROSS JOIN (SELECT user_id FROM inserted_users WHERE email = 'amit.patel@example.com') u_prof
    WHERE u.email = 'rajesh.kumar@example.com'
    RETURNING record_id
),

-- 12. Insert Medical Vault Tables
inserted_prescription_vault AS (
    INSERT INTO prescription_vault (patient_id, document_url, metadata, file_count)
    SELECT pat.patient_id, 'https://storage.clinico.app/vault/prescriptions/user_' || pat.patient_id, '{"count": 3, "last_updated": "' || NOW() || '"}', 3
    FROM inserted_patients pat
    RETURNING vault_prescription_id
),
inserted_lab_report_vault AS (
    INSERT INTO lab_report_vault (patient_id, document_url, metadata, file_count)
    SELECT pat.patient_id, 'https://storage.clinico.app/vault/lab_reports/user_' || pat.patient_id, '{"count": 2, "last_updated": "' || NOW() || '"}', 2
    FROM inserted_patients pat
    RETURNING vault_lab_id
),
inserted_radiology_vault AS (
    INSERT INTO radiology_vault (patient_id, document_url, metadata, file_count)
    SELECT pat.patient_id, 'https://storage.clinico.app/vault/radiology/user_' || pat.patient_id, '{"count": 1, "last_updated": "' || NOW() || '"}', 1
    FROM inserted_patients pat
    RETURNING vault_radiology_id
),

-- 13. Insert Upload Report Requests
inserted_upload_requests AS (
    INSERT INTO upload_report_requests (patient_id, professional_id, request_code, prescription_date, requested_tests, due_date, status, additional_notes)
    SELECT p.patient_id, prof.professional_id, 'PRX-2025-1109-01', CURRENT_DATE, 'CBC, BMP, Lipid Profile', CURRENT_DATE + INTERVAL '7 days', 'Pending', 'Please upload within a week'
    FROM inserted_patients p
    JOIN inserted_users u ON p.user_id = u.user_id
    CROSS JOIN (SELECT professional_id FROM inserted_professionals LIMIT 1) prof
    WHERE u.email = 'abhay.raj@example.com'
    RETURNING request_id
),

-- 14. Insert Search History
inserted_search_history AS (
    INSERT INTO search_history (patient_id, search_query, search_filters, location_searched, results_count)
    SELECT pat.patient_id, 'Psychiatrist Doctor', 'Distance, Rating, Specialization', 'New Delhi, India', 12
    FROM inserted_patients pat JOIN inserted_users u ON pat.user_id = u.user_id
    WHERE u.email = 'abhay.raj@example.com'
    UNION ALL
    SELECT pat.patient_id, 'Cardiologist Near Me', 'Distance, Insurance, Available Today', 'Mumbai, India', 8
    FROM inserted_patients pat JOIN inserted_users u ON pat.user_id = u.user_id
    WHERE u.email = 'rajesh.kumar@example.com'
    RETURNING search_id
),

-- 15. Insert Saved Locations
inserted_saved_locations AS (
    INSERT INTO saved_locations (patient_id, location_name, full_address, latitude, longitude, is_current_location, is_default)
    SELECT pat.patient_id, 'Home', '123 Health St, New Delhi - 110078', 28.6145, 77.2105, true, true
    FROM inserted_patients pat JOIN inserted_users u ON pat.user_id = u.user_id
    WHERE u.email = 'abhay.raj@example.com'
    UNION ALL
    SELECT pat.patient_id, 'Office', '456 Business Park, New Delhi - 110001', 28.5355, 77.3910, false, false
    FROM inserted_patients pat JOIN inserted_users u ON pat.user_id = u.user_id
    WHERE u.email = 'abhay.raj@example.com'
    RETURNING location_id
),

-- 16. Insert Conversations
inserted_conversations AS (
    INSERT INTO patient_doctor_conversations (patient_id, professional_id, appointment_id, last_message_at, is_active, conversation_type)
    SELECT a.patient_id, a.professional_id, a.appointment_id, NOW(), true, 'Appointment'
    FROM inserted_appointments a
    WHERE a.professional_id IS NOT NULL
    LIMIT 1
    RETURNING conversation_id, patient_id, professional_id
),

-- 17. Insert Messages
inserted_messages AS (
    INSERT INTO messages (conversation_id, sender_user_id, sender_type, message_content, message_type, sent_at, is_read)
    SELECT conv.conversation_id, p.user_id, 'Patient'::sender_type_extended, 'Hi, I have been experiencing anxiety lately', 'Text'::message_type_enum, NOW() - INTERVAL '1 hour', true
    FROM inserted_conversations conv
    JOIN inserted_patients p ON conv.patient_id = p.patient_id
    UNION ALL
    SELECT conv.conversation_id, prof.user_id, 'Doctor'::sender_type_extended, 'I understand. Can you tell me more about your symptoms?', 'Text'::message_type_enum, NOW() - INTERVAL '45 minutes', true
    FROM inserted_conversations conv
    JOIN inserted_professionals prof ON conv.professional_id = prof.professional_id
    RETURNING message_id
),

-- 18. Insert AI Chat Sessions
inserted_ai_sessions AS (
    INSERT INTO ai_chat_sessions (patient_id, started_at, ended_at, session_type, session_summary, escalated_to_professional, crisis_detected)
    SELECT pat.patient_id, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', 'Health Query'::session_type_enum, 'Patient inquired about symptoms of depression', false, false
    FROM inserted_patients pat JOIN inserted_users u ON pat.user_id = u.user_id
    WHERE u.email = 'abhay.raj@example.com'
    UNION ALL
    SELECT pat.patient_id, NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours', 'Mental Wellness'::session_type_enum, 'Patient discussed stress management techniques', false, false
    FROM inserted_patients pat JOIN inserted_users u ON pat.user_id = u.user_id
    WHERE u.email = 'priya.sharma@example.com'
    RETURNING session_id, patient_id
),

-- 19. Insert AI Chat Logs (linked to sessions)
updated_ai_chat_logs AS (
    INSERT INTO ai_chat_logs (user_id, message_content, sender, timestamp, ai_agent_type, ai_metadata, media_attachments, media_type)
    SELECT u.user_id, 'I have been feeling very sad lately and have lost interest in things I used to enjoy', 'User'::sender_type, NOW() - INTERVAL '2 hours', 'Mental Wellness Agent', '{"confidence": 0.8, "category": "depression"}'::json, NULL, NULL
    FROM inserted_users u
    WHERE u.email = 'abhay.raj@example.com'
    UNION ALL
    SELECT u.user_id, 'I understand that you''re feeling sad. This sounds like it could be depression. Have you been experiencing this for more than 2 weeks?', 'AI'::sender_type, NOW() - INTERVAL '1 hour 55 minutes', 'Mental Wellness Agent', '{"confidence": 0.9, "category": "depression_assessment"}'::json, NULL, NULL
    FROM inserted_users u
    WHERE u.email = 'abhay.raj@example.com'
    RETURNING log_id
),

-- 20. Insert Reviews
inserted_reviews AS (
    INSERT INTO reviews (patient_id, rating, comment, target_type, target_id, appreciated_aspects, feedback_suggestions, is_verified_visit)
    SELECT pat.patient_id, 5, 'Dr. Alok was very helpful and professional.', 'Clinic_Doctor', cd.clinic_doctor_id, 'Knowledgeable, Patient, Explained well', 'Perhaps more time for each patient', true
    FROM inserted_patients pat JOIN inserted_users u ON pat.user_id = u.user_id,
         inserted_clinic_doctors cd
    WHERE u.email = 'rajesh.kumar@example.com' AND cd.full_name = 'Dr. Alok Ranjan'
    UNION ALL
    SELECT pat.patient_id, 4, 'Good consultation, felt heard and understood.', 'Professional', prof.professional_id, 'Empathetic, Good listener', 'Maybe shorter waiting times', true
    FROM inserted_patients pat JOIN inserted_users u ON pat.user_id = u.user_id,
         inserted_professionals prof JOIN inserted_users u_prof ON prof.user_id = u_prof.user_id
    WHERE u.email = 'priya.sharma@example.com' AND u_prof.email = 'amit.patel@example.com'
    RETURNING review_id
),

-- 21. Insert Settings
inserted_notification_settings AS (
    INSERT INTO notification_settings (user_id, all_notifications_enabled, appointment_alerts, medical_reminders, updated_at)
    SELECT u.user_id, true, true, true, NOW()
    FROM inserted_users u
    WHERE u.email IN ('abhay.raj@example.com', 'priya.sharma@example.com', 'rajesh.kumar@example.com')
    RETURNING settings_id
),
inserted_account_settings AS (
    INSERT INTO account_settings (user_id, preferred_language, dark_mode, biometric_enabled)
    SELECT u.user_id, 'English', false, false
    FROM inserted_users u
    RETURNING settings_id
),

-- 22. Insert Health Articles
inserted_health_articles AS (
    INSERT INTO health_articles (title, content, content_type, category, author, published_date, thumbnail_url, duration_minutes, view_count, tags, verified_content, read_time_minutes)
    VALUES
    ('Managing Anxiety in Daily Life', 'Anxiety is a normal emotion characterized by feelings of tension, worried thoughts, and physical changes like increased blood pressure...', 'Article', 'Mental Wellness', 'Dr. Meera Sharma', CURRENT_DATE - INTERVAL '5 days', 'https://cdn.clinico.app/images/anxiety-thumb.jpg', 8, 1250, '#MentalHealth #Anxiety #Wellness', true, 5),
    ('Benefits of Regular Exercise', 'Regular physical activity is one of the most important things you can do for your health...', 'Article', 'Exercise', 'Dr. Rajesh Kumar', CURRENT_DATE - INTERVAL '3 days', 'https://cdn.clinico.app/images/exercise-thumb.jpg', 12, 890, '#Exercise #Health #Fitness', true, 6),
    ('Understanding Sleep Cycles', 'Sleep is a complex biological process that is essential for good health...', 'Video', 'Sleep', 'Dr. Priya Verma', CURRENT_DATE - INTERVAL '7 days', 'https://cdn.clinico.app/images/sleep-thumb.jpg', 15, 2100, '#Sleep #Health #Wellness', true, 8)
    RETURNING article_id, title
),

-- 23. Insert Article Reads
inserted_article_reads AS (
    INSERT INTO article_reads (patient_id, article_id, time_spent_seconds, completed, saved_to_library)
    SELECT p.patient_id, ha.article_id, 320, true, true
    FROM inserted_patients p
    JOIN inserted_users u ON p.user_id = u.user_id
    CROSS JOIN inserted_health_articles ha
    WHERE u.email = 'abhay.raj@example.com' AND ha.title = 'Managing Anxiety in Daily Life'
    UNION ALL
    SELECT p.patient_id, ha.article_id, 450, true, false
    FROM inserted_patients p
    JOIN inserted_users u ON p.user_id = u.user_id
    CROSS JOIN inserted_health_articles ha
    WHERE u.email = 'priya.sharma@example.com' AND ha.title = 'Benefits of Regular Exercise'
    RETURNING read_id
),

-- 24. Insert Wellness Library
inserted_wellness_library AS (
    INSERT INTO wellness_library (patient_id, article_id, personal_notes)
    SELECT p.patient_id, ha.article_id, 'Very helpful for managing my stress levels'
    FROM inserted_patients p
    JOIN inserted_users u ON p.user_id = u.user_id
    CROSS JOIN inserted_health_articles ha
    WHERE u.email = 'abhay.raj@example.com' AND ha.title = 'Managing Anxiety in Daily Life'
    RETURNING library_id
),

-- 25. Insert Wellness Thoughts
inserted_wellness_thoughts AS (
    INSERT INTO wellness_thoughts (patient_id, article_id, comment, is_anonymous)
    SELECT p.patient_id, ha.article_id, 'This article really helped me understand my anxiety better. Thank you!', false
    FROM inserted_patients p
    JOIN inserted_users u ON p.user_id = u.user_id
    CROSS JOIN inserted_health_articles ha
    WHERE u.email = 'abhay.raj@example.com' AND ha.title = 'Managing Anxiety in Daily Life'
    RETURNING thought_id
),

-- 26. Insert Notifications
inserted_notifications AS (
    INSERT INTO notifications (user_id, notification_type, title, message, priority, scheduled_time, sent_at, action_data, icon)
    SELECT u.user_id, 'Appointment'::notification_type_enum, 'Appointment Reminder', 'Your appointment with Dr. Amit Patel is starting in 30 minutes', 'Normal'::notification_priority_enum, NOW() + INTERVAL '30 minutes', NOW(), '{"action": "view_appointment", "appointment_id": 1}'::json, 'appointment-icon'
    FROM inserted_users u
    WHERE u.email = 'abhay.raj@example.com'
    UNION ALL
    SELECT u.user_id, 'Medicine', 'Medicine Reminder', 'Time to take your Sertraline 50mg', 'Urgent', NOW(), NOW(), '{"action": "mark_taken", "reminder_id": 1}', 'pill-icon'
    FROM inserted_users u
    WHERE u.email = 'priya.sharma@example.com'
    RETURNING notification_id
)

-- Final confirmation
SELECT 'Seed data successfully inserted for all tables!' AS Status;

COMMIT;