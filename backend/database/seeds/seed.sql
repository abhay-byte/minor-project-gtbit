BEGIN;

-- ===== USERS =====
INSERT INTO "Users" (user_id, email, password_hash, full_name, phone_number, role, created_at) VALUES
(1, 'john@example.com', 'hashed_pw_1', 'John Doe', '9998887771', 'Patient', NOW()),
(2, 'dr.smith@example.com', 'hashed_pw_2', 'Dr. Sarah Smith', '9998887772', 'Professional', NOW()),
(3, 'ngohelp@example.com', 'hashed_pw_3', 'Helping Hands', '9998887773', 'NGO', NOW()),
(4, 'admin@example.com', 'hashed_pw_4', 'System Admin', '9998887774', 'Admin', NOW());

-- ===== PATIENTS =====
INSERT INTO "Patients" (patient_id, user_id, date_of_birth, gender, address) VALUES
(1, 1, '1995-05-10', 'Male', '123 Main Street, New Delhi');

-- ===== PROFESSIONALS =====
INSERT INTO "Professionals" (professional_id, user_id, specialty, credentials, years_of_experience, verification_status) VALUES
(1, 2, 'General Physician', 'MBBS, MD', 10, 'Verified');

-- ===== NGO USERS =====
INSERT INTO "Ngo_Users" (ngo_user_id, user_id, ngo_name, verification_status) VALUES
(1, 3, 'Helping Hands Foundation', TRUE);

-- ===== CLINICS =====
INSERT INTO "Clinics" (clinic_id, name, address, latitude, longitude) VALUES
(1, 'City Health Clinic', '456 Health Road, New Delhi', 28.6139, 77.2090);

-- ===== CLINIC DOCTORS =====
INSERT INTO "Clinic_Doctors" (clinic_doctor_id, clinic_id, full_name, specialty, consultation_fee) VALUES
(1, 1, 'Dr. Sarah Smith', 'General Physician', '₹500');

-- ===== MEDICAL RECORDS =====
INSERT INTO "MedicalRecords" (medicalrecord_id, patient_id, record_date, title, description) VALUES
(1, 1, '2024-09-20', 'Blood Test Report', 'Normal blood test results');

-- ===== REVIEWS =====
INSERT INTO "Reviews" (review_id, patient_id, rating, comment, target_type, target_id, created_at) VALUES
(1, 1, 5, 'Excellent service and staff!', 'Clinic', 1, NOW());

-- ===== AI CHAT LOGS =====
INSERT INTO "AI_Chat_Logs" (log_id, user_id, message_content, sender, timestamp) VALUES
(1, 1, 'Can I book an appointment?', 'User', NOW()),
(2, 1, 'Yes, please choose your clinic and doctor.', 'AI', NOW());

COMMIT;
