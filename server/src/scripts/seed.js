// src/scripts/seed.js
require('dotenv').config({ path: '../.env' });
const db = require('../config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const seedDatabase = async () => {
    console.log('--- Starting database seeding script ---');
    const client = await db.connect();
    console.log('Database connection established.');

    try {
        console.log('Starting transaction...');
        await client.query('BEGIN');

        // 1. Truncate all tables for a clean slate
        console.log('Truncating all tables...');
        await client.query(`
            TRUNCATE TABLE
                users, patients, professionals, ngo_users, clinics, clinic_doctors,
                availability_slots, appointments, consultations, prescriptions,
                medical_records, reviews, ai_chat_logs,
                prescription_list, medicine_reminders, reminder_logs,
                prescription_vault, lab_report_vault, radiology_vault, discharge_vault,
                vaccination_vault, doctor_notes_vault, other_documents_vault,
                upload_report_requests, uploaded_test_reports, search_history,
                saved_locations, patient_doctor_conversations, professional_conversations,
                messages, ai_chat_sessions, crisis_interventions, notification_settings,
                account_settings, health_articles, article_reads, wellness_library,
                wellness_thoughts, notifications
            CASCADE;
        `);

        // 2. Hash passwords
        console.log('Hashing user passwords...');
        const salt = await bcrypt.genSalt(10);
        const passwords = {
            default: await bcrypt.hash('password123', salt),
            admin: await bcrypt.hash('admin123', salt),
        };

        // 3. Seed Users (with UUID columns)
        console.log('Seeding users...');
        const userResult = await client.query(`
            INSERT INTO users (email, password_hash, full_name, phone_number, role, last_sync, verified_user, user_id_uuid) VALUES
            ('abhay.raj@example.com', $1, 'Abhay Raj', '9876543210', 'Patient', NOW(), true, $3),
            ('priya.sharma@example.com', $1, 'Priya Sharma', '9876543211', 'Patient', NOW(), true, $4),
            ('rajesh.kumar@example.com', $1, 'Rajesh Kumar', '9876543212', 'Patient', NOW(), true, $5),
            ('amit.patel@example.com', $1, 'Dr. Amit Patel', '9876543213', 'Professional', NOW(), true, $6),
            ('anjali.singh@example.com', $1, 'Dr. Anjali Singh', '9876543214', 'Professional', NOW(), true, $7),
            ('vikram.verma@example.com', $1, 'Dr. Vikram Verma', '9876543215', 'Professional', NOW(), true, $8),
            ('ngo.helpline@example.com', $1, 'Health Alliance NGO', '9876543220', 'NGO', NOW(), true, $9),
            ('admin@clinico.com', $2, 'Admin User', '9876543230', 'Admin', NOW(), true, $10)
            RETURNING user_id, email, user_id_uuid;
        `, [
            passwords.default, 
            passwords.admin,
            uuidv4(), uuidv4(), uuidv4(),
            uuidv4(), uuidv4(), uuidv4(),
            uuidv4(), uuidv4()
        ]);
        
        const users = new Map(userResult.rows.map(u => [u.email, { user_id: u.user_id, user_id_uuid: u.user_id_uuid }]));

        // 4. Seed Patients (with UUID and new columns)
        console.log('Seeding patients...');
        const patientResult = await client.query(`
            INSERT INTO patients (
                user_id, user_id_uuid, date_of_birth, gender, address, 
                blood_group, marital_status, known_allergies, chronic_conditions, 
                current_medications, lifestyle_notes, member_since, patient_code, 
                current_location, current_full_address, patient_id_uuid
            ) VALUES
            ($1, $2, '2000-01-15'::date, 'Male', '123 Health St, New Delhi', 
             'O+', 'Single', 'None', 'None', 'None', 
             'Non-smoker, exercises regularly', NOW(), 'PT-2025-0001', 
             'New Delhi', '123, Block A, Sector 14, Dwarka, New Delhi - 110078', $3),
            ($4, $5, '1995-05-22'::date, 'Female', '456 Wellness Ave, New Delhi', 
             'B+', 'Single', 'Penicillin', 'Hypertension', 'Amlodipine 5mg daily', 
             'Non-smoker', NOW(), 'PT-2025-0002', 
             'New Delhi', '456, Wellness Ave, New Delhi - 110001', $6),
            ($7, $8, '1988-11-30'::date, 'Male', '789 Care Lane, Mumbai', 
             'A+', 'Married', 'Sulfa drugs', 'Diabetes', 'Metformin 500mg twice daily', 
             'Exercises 3 times a week', NOW(), 'PT-2025-0003', 
             'Mumbai', '789 Care Lane, Mumbai - 400001', $9)
            RETURNING patient_id, user_id, patient_id_uuid;
        `, [
            users.get('abhay.raj@example.com').user_id,
            users.get('abhay.raj@example.com').user_id_uuid,
            uuidv4(),
            users.get('priya.sharma@example.com').user_id,
            users.get('priya.sharma@example.com').user_id_uuid,
            uuidv4(),
            users.get('rajesh.kumar@example.com').user_id,
            users.get('rajesh.kumar@example.com').user_id_uuid,
            uuidv4()
        ]);
        
        const patients = new Map(patientResult.rows.map(p => [p.user_id, { 
            patient_id: p.patient_id, 
            patient_id_uuid: p.patient_id_uuid 
        }]));

        // 5. Seed Professionals (with UUID and new columns)
        console.log('Seeding professionals...');
        const professionalResult = await client.query(`
            INSERT INTO professionals (
                user_id, user_id_uuid, specialty, credentials, years_of_experience, 
                verification_status, rating, total_reviews, patients_treated, 
                languages_spoken, working_hours, is_volunteer, professional_id_uuid
            ) VALUES
            ($1, $2, 'Psychiatrist', 'MD, MBBS, License #12345', 8, 
             'Verified', 4.7, 120, 500, 'Hindi, English', 
             '10:30am-12:30pm, 4:30pm-7:30pm', false, $3),
            ($4, $5, 'General Practitioner', 'MBBS, License #67890', 5, 
             'Verified', 4.5, 85, 320, 'English, Hindi', 
             '9:00am-5:00pm', false, $6),
            ($7, $8, 'Cardiologist', 'MD, DM Cardiology, License #11223', 12, 
             'Pending', 0.0, 0, 0, 'English, Hindi, Tamil', 
             '10:00am-6:00pm', true, $9)
            RETURNING professional_id, user_id, specialty, professional_id_uuid;
        `, [
            users.get('amit.patel@example.com').user_id,
            users.get('amit.patel@example.com').user_id_uuid,
            uuidv4(),
            users.get('anjali.singh@example.com').user_id,
            users.get('anjali.singh@example.com').user_id_uuid,
            uuidv4(),
            users.get('vikram.verma@example.com').user_id,
            users.get('vikram.verma@example.com').user_id_uuid,
            uuidv4()
        ]);
        
        const professionals = new Map(professionalResult.rows.map(p => [p.user_id, { 
            professional_id: p.professional_id,
            specialty: p.specialty,
            professional_id_uuid: p.professional_id_uuid
        }]));

        // 6. Seed NGO Users
        console.log('Seeding NGO users...');
        await client.query(`
            INSERT INTO ngo_users (user_id, user_id_uuid, ngo_name, verification_status, ngo_user_id_uuid) 
            VALUES ($1, $2, 'Health Alliance India', 'Verified', $3);
        `, [
            users.get('ngo.helpline@example.com').user_id,
            users.get('ngo.helpline@example.com').user_id_uuid,
            uuidv4()
        ]);

        // 7. Seed Clinics (with UUID and new columns)
        console.log('Seeding clinics...');
        const clinicResult = await client.query(`
            INSERT INTO clinics (
                name, address, latitude, longitude, phone_number, type, 
                facilities, operating_hours, average_rating, total_reviews, 
                city, area, pincode, clinic_id_uuid
            ) VALUES
            ('City General Hospital', '456 Wellness Ave, New Delhi', 28.6145, 77.2105, 
             '01-123-4567', 'Hospital', 'Emergency, Lab, Pharmacy, ICU', '24/7', 
             4.5, 250, 'New Delhi', 'Connaught Place', '110001', $1),
            ('Metro Clinic', '789 Care Lane, Mumbai', 19.0760, 72.8777, 
             '022-987-6543', 'Clinic', 'Consultation, Lab, Pharmacy', '9:00 AM - 8:00 PM', 
             4.2, 180, 'Mumbai', 'Bandra', '400050', $2)
            RETURNING clinic_id, name, clinic_id_uuid;
        `, [uuidv4(), uuidv4()]);
        
        const clinics = new Map(clinicResult.rows.map(c => [c.name, { 
            clinic_id: c.clinic_id,
            clinic_id_uuid: c.clinic_id_uuid
        }]));

        // 8. Seed Clinic Doctors (with UUID and new columns)
        console.log('Seeding clinic doctors...');
        const clinicDoctorResult = await client.query(`
            INSERT INTO clinic_doctors (
                clinic_id, clinic_id_uuid, full_name, specialty, consultation_fee, 
                qualifications, available_days, available_hours, rating, review_count, 
                languages, distance_km, hospital_affiliation, is_volunteer, 
                available_today, available_tomorrow, available_this_week, clinic_doctor_id_uuid
            ) VALUES
            ($1, $2, 'Dr. Alok Ranjan', 'Cardiologist', 800.00, 'MBBS, MD', 
             'Mon-Fri', '9:00 AM - 5:00 PM', 4.6, 95, 'English, Hindi', '1.6 km', 
             'City General Hospital', false, true, true, true, $3),
            ($4, $5, 'Dr. Suresh Nair', 'Psychiatrist', 600.00, 'MBBS, MD Psychiatry', 
             'Tue-Sat', '10:00 AM - 6:00 PM', 4.3, 78, 'English, Hindi, Malayalam', '2.2 km', 
             'Metro Clinic', false, true, false, true, $6)
            RETURNING clinic_doctor_id, full_name, clinic_doctor_id_uuid;
        `, [
            clinics.get('City General Hospital').clinic_id,
            clinics.get('City General Hospital').clinic_id_uuid,
            uuidv4(),
            clinics.get('Metro Clinic').clinic_id,
            clinics.get('Metro Clinic').clinic_id_uuid,
            uuidv4()
        ]);
        
        const clinicDoctors = new Map(clinicDoctorResult.rows.map(cd => [cd.full_name, {
            clinic_doctor_id: cd.clinic_doctor_id,
            clinic_doctor_id_uuid: cd.clinic_doctor_id_uuid
        }]));

        // 9. Seed Availability Slots (with UUID)
        console.log('Seeding availability slots...');
        await client.query(`
            INSERT INTO availability_slots (
                professional_id, start_time, end_time, is_booked, slot_date, slot_id_uuid
            ) VALUES
            ($1, NOW() + INTERVAL '1 day 10 hours', NOW() + INTERVAL '1 day 11 hours', 
             false, CURRENT_DATE + INTERVAL '1 day', $2),
            ($3, NOW() + INTERVAL '2 days 14 hours', NOW() + INTERVAL '2 days 15 hours', 
             false, CURRENT_DATE + INTERVAL '2 days', $4);
        `, [
            professionals.get(users.get('amit.patel@example.com').user_id).professional_id,
            uuidv4(),
            professionals.get(users.get('anjali.singh@example.com').user_id).professional_id,
            uuidv4()
        ]);

        // 10. Seed Appointments (with UUID and new columns)
        console.log('Seeding appointments...');
        const appointmentResult = await client.query(`
            INSERT INTO appointments (
                patient_id, patient_id_uuid, professional_id, professional_id_uuid,
                clinic_doctor_id, clinic_doctor_id_uuid, appointment_time, status, 
                appointment_type, consultation_link, appointment_code, patient_notes, 
                scheduled_at, completed_at, duration_minutes, appointment_id_uuid
            ) VALUES
            ($1, $2, $3, $4, NULL, NULL, NOW() + INTERVAL '3 days', 'Scheduled', 
             'Virtual', 'https://meet.clinico.app/abc-123-xyz', 'APT-0001', 
             'Follow-up for anxiety treatment', NOW(), NULL, 30, $5),
            ($6, $7, NULL, NULL, $8, $9, NOW() + INTERVAL '4 days', 'Scheduled', 
             'In-Person', NULL, 'APT-0002', 'Regular checkup', NOW(), NULL, 45, $10),
            ($11, $12, $13, $14, NULL, NULL, NOW() - INTERVAL '3 days', 'Completed', 
             'Virtual', 'https://meet.clinico.app/def-456-uvw', 'APT-0003', 
             'Initial consultation for depression', NOW() - INTERVAL '4 days', 
             NOW() - INTERVAL '3 days', 45, $15)
            RETURNING appointment_id, patient_id, professional_id, status, appointment_id_uuid;
        `, [
            // Appointment 1 - Abhay with Amit
            patients.get(users.get('abhay.raj@example.com').user_id).patient_id,
            patients.get(users.get('abhay.raj@example.com').user_id).patient_id_uuid,
            professionals.get(users.get('amit.patel@example.com').user_id).professional_id,
            professionals.get(users.get('amit.patel@example.com').user_id).professional_id_uuid,
            uuidv4(),
            // Appointment 2 - Rajesh with clinic doctor
            patients.get(users.get('rajesh.kumar@example.com').user_id).patient_id,
            patients.get(users.get('rajesh.kumar@example.com').user_id).patient_id_uuid,
            clinicDoctors.get('Dr. Alok Ranjan').clinic_doctor_id,
            clinicDoctors.get('Dr. Alok Ranjan').clinic_doctor_id_uuid,
            uuidv4(),
            // Appointment 3 - Priya with Amit (completed)
            patients.get(users.get('priya.sharma@example.com').user_id).patient_id,
            patients.get(users.get('priya.sharma@example.com').user_id).patient_id_uuid,
            professionals.get(users.get('amit.patel@example.com').user_id).professional_id,
            professionals.get(users.get('amit.patel@example.com').user_id).professional_id_uuid,
            uuidv4()
        ]);
        
        const appointments = appointmentResult.rows;
        const completedAppointment = appointments.find(a => a.status === 'Completed');

        // 11. Seed Consultations (with UUID and new columns)
        console.log('Seeding consultations...');
        const consultationResult = await client.query(`
            INSERT INTO consultations (
                appointment_id, appointment_id_uuid, notes, ai_briefing, diagnosis, 
                doctor_recommendations, follow_up_instructions, prescription_attached, consultation_id_uuid
            ) VALUES
            ($1, $2, 
             'Patient reports ongoing anxiety symptoms. Discussed lifestyle changes and coping mechanisms. Prescribed Sertraline 50mg.',
             'Summary: Patient mentioned work stress and difficulty sleeping. Previous mild depression noted.',
             'Generalized Anxiety Disorder with mild depressive symptoms',
             'Continue therapy sessions, monitor medication effectiveness, regular follow-ups',
             'Follow up in 2 weeks, take medication as prescribed, continue mindfulness exercises',
             true, $3)
            RETURNING consultation_id, appointment_id, consultation_id_uuid;
        `, [
            completedAppointment.appointment_id,
            completedAppointment.appointment_id_uuid,
            uuidv4()
        ]);
        
        const consultation = consultationResult.rows[0];

        // 12. Seed Prescriptions (with UUID and new columns - using short specialty)
        console.log('Seeding prescriptions...');
        const prescriptionResult = await client.query(`
            INSERT INTO prescriptions (
                consultation_id, consultation_id_uuid, medication_name, dosage, instructions, 
                prescription_code, frequency, duration, medication_category, doctor_notes, 
                prescribed_date, is_active, prescribed_by_doctor_id, doctor_name, 
                doctor_specialty, clinic_name, important_notes, prescription_id_uuid
            ) VALUES
            ($1, $2, 'Sertraline', '50mg', 'Take one tablet every morning with food.', 
             'DRX-2001', 'Once daily', '4 weeks', 'Antidepressant', 
             'Monitor for side effects, especially in first week', CURRENT_DATE, true, 
             $3, 'Dr. Amit Patel', 'MD', 'Virtual Consultation', 
             'Complete full course of medication, contact doctor if side effects occur', $4)
            RETURNING prescription_id, consultation_id, prescription_id_uuid;
        `, [
            consultation.consultation_id,
            consultation.consultation_id_uuid,
            professionals.get(users.get('amit.patel@example.com').user_id).professional_id,
            uuidv4()
        ]);
        
        const prescription = prescriptionResult.rows[0];

        // 13. Seed Prescription List
        console.log('Seeding prescription list...');
        await client.query(`
            INSERT INTO prescription_list (
                patient_id, prescription_id, condition_treated, medicines_count, 
                next_followup, prescription_status, last_viewed
            ) VALUES ($1, $2, 'Anxiety and Depression', 1, CURRENT_DATE + INTERVAL '14 days', 'Active', NOW());
        `, [
            completedAppointment.patient_id,
            prescription.prescription_id
        ]);

        // 14. Seed Medicine Reminders
        console.log('Seeding medicine reminders...');
        const reminderResult = await client.query(`
            INSERT INTO medicine_reminders (
                patient_id, prescription_id, medication_name, dosage_form, timing_schedule, 
                how_to_take, duration, doctor_note, start_date, end_date, is_active, next_reminder_time
            ) VALUES
            ($1, $2, 'Sertraline 50mg', '1 tablet', 'Morning 8:00 AM', 'After food', 
             '28 days (Nov 17 - Dec 15)', 'Take with breakfast, monitor mood changes', 
             CURRENT_DATE, CURRENT_DATE + INTERVAL '28 days', true, NOW() + INTERVAL '1 day 8 hours')
            RETURNING reminder_id;
        `, [
            completedAppointment.patient_id,
            prescription.prescription_id
        ]);
        
        const reminder = reminderResult.rows[0];

        // 15. Seed Reminder Logs
        console.log('Seeding reminder logs...');
        await client.query(`
            INSERT INTO reminder_logs (reminder_id, scheduled_time, taken_time, status, notes) VALUES
            ($1, NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours', 'Taken', 'Taken on time'),
            ($1, NOW(), NULL, 'Pending', NULL);
        `, [reminder.reminder_id]);

        // 16. Seed Medical Records (with UUID and new columns)
        console.log('Seeding medical records...');
        await client.query(`
            INSERT INTO medical_records (
                patient_id, patient_id_uuid, document_name, document_url, document_type, 
                comments_notes, uploaded_by_user_id, uploaded_by_role, report_date, 
                file_format, file_size_mb, record_id_uuid
            ) VALUES
            ($1, $2, 'Blood Test Report - CBC', 'https://storage.clinico.app/reports/blood_test_001.pdf', 
             'Lab Report (CBC)', 'Normal results, slight elevation in cholesterol', 
             $3, 'Self', CURRENT_DATE - INTERVAL '5 days', 'PDF', 2, $4),
            ($5, $6, 'X-Ray Chest', 'https://storage.clinico.app/reports/xray_chest_001.pdf', 
             'Radiology', 'Clear lungs, no abnormalities detected', 
             $7, 'Doctor', CURRENT_DATE - INTERVAL '10 days', 'PDF', 1, $8);
        `, [
            patients.get(users.get('abhay.raj@example.com').user_id).patient_id,
            patients.get(users.get('abhay.raj@example.com').user_id).patient_id_uuid,
            users.get('abhay.raj@example.com').user_id,
            uuidv4(),
            patients.get(users.get('rajesh.kumar@example.com').user_id).patient_id,
            patients.get(users.get('rajesh.kumar@example.com').user_id).patient_id_uuid,
            users.get('amit.patel@example.com').user_id,
            uuidv4()
        ]);

        // 17. Seed Medical Vault Tables
        console.log('Seeding medical vaults...');
        for (const [email, userData] of users.entries()) {
            if (patients.has(userData.user_id)) {
                const patientId = patients.get(userData.user_id).patient_id;
                
                await client.query(`
                    INSERT INTO prescription_vault (patient_id, document_url, metadata, file_count) 
                    VALUES ($1, $2, $3, 3);
                `, [
                    patientId,
                    `https://storage.clinico.app/vault/prescriptions/user_${patientId}`,
                    JSON.stringify({ count: 3, last_updated: new Date() })
                ]);

                await client.query(`
                    INSERT INTO lab_report_vault (patient_id, document_url, metadata, file_count) 
                    VALUES ($1, $2, $3, 2);
                `, [
                    patientId,
                    `https://storage.clinico.app/vault/lab_reports/user_${patientId}`,
                    JSON.stringify({ count: 2, last_updated: new Date() })
                ]);

                await client.query(`
                    INSERT INTO radiology_vault (patient_id, document_url, metadata, file_count) 
                    VALUES ($1, $2, $3, 1);
                `, [
                    patientId,
                    `https://storage.clinico.app/vault/radiology/user_${patientId}`,
                    JSON.stringify({ count: 1, last_updated: new Date() })
                ]);
            }
        }

        // 18. Seed Upload Report Requests
        console.log('Seeding upload report requests...');
        await client.query(`
            INSERT INTO upload_report_requests (
                patient_id, professional_id, request_code, prescription_date, 
                requested_tests, due_date, status, additional_notes
            ) VALUES
            ($1, $2, 'PRX-2025-1109-01', CURRENT_DATE, 'CBC, BMP, Lipid Profile', 
             CURRENT_DATE + INTERVAL '7 days', 'Pending', 'Please upload within a week');
        `, [
            patients.get(users.get('abhay.raj@example.com').user_id).patient_id,
            professionals.get(users.get('amit.patel@example.com').user_id).professional_id
        ]);

        // 19. Seed Search History
        console.log('Seeding search history...');
        await client.query(`
            INSERT INTO search_history (
                patient_id, search_query, search_filters, location_searched, results_count
            ) VALUES
            ($1, 'Psychiatrist Doctor', 'Distance, Rating, Specialization', 'New Delhi, India', 12),
            ($2, 'Cardiologist Near Me', 'Distance, Insurance, Available Today', 'Mumbai, India', 8);
        `, [
            patients.get(users.get('abhay.raj@example.com').user_id).patient_id,
            patients.get(users.get('rajesh.kumar@example.com').user_id).patient_id
        ]);

        // 20. Seed Saved Locations
        console.log('Seeding saved locations...');
        await client.query(`
            INSERT INTO saved_locations (
                patient_id, location_name, full_address, latitude, longitude, 
                is_current_location, is_default
            ) VALUES
            ($1, 'Home', '123 Health St, New Delhi - 110078', 28.6145, 77.2105, true, true),
            ($1, 'Office', '456 Business Park, New Delhi - 110001', 28.5355, 77.3910, false, false);
        `, [patients.get(users.get('abhay.raj@example.com').user_id).patient_id]);

        // 21. Seed Conversations
        console.log('Seeding conversations...');
        const conversationResult = await client.query(`
            INSERT INTO patient_doctor_conversations (
                patient_id, professional_id, appointment_id, last_message_at, 
                is_active, conversation_type
            ) VALUES ($1, $2, $3, NOW(), true, 'Appointment')
            RETURNING conversation_id;
        `, [
            patients.get(users.get('abhay.raj@example.com').user_id).patient_id,
            professionals.get(users.get('amit.patel@example.com').user_id).professional_id,
            appointments[0].appointment_id
        ]);
        
        const conversation = conversationResult.rows[0];

        // 22. Seed Messages
        console.log('Seeding messages...');
        await client.query(`
            INSERT INTO messages (
                conversation_id, sender_user_id, sender_type, message_content, 
                message_type, sent_at, is_read
            ) VALUES
            ($1, $2, 'Patient', 'Hi, I have been experiencing anxiety lately', 'Text', NOW() - INTERVAL '1 hour', true),
            ($1, $3, 'Doctor', 'I understand. Can you tell me more about your symptoms?', 'Text', NOW() - INTERVAL '45 minutes', true);
        `, [
            conversation.conversation_id,
            users.get('abhay.raj@example.com').user_id,
            users.get('amit.patel@example.com').user_id
        ]);

        // 23. Seed AI Chat Sessions
        console.log('Seeding AI chat sessions...');
        await client.query(`
            INSERT INTO ai_chat_sessions (
                patient_id, started_at, ended_at, session_type, session_summary, 
                escalated_to_professional, crisis_detected
            ) VALUES
            ($1, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', 'Health Query', 
             'Patient inquired about symptoms of depression', false, false),
            ($2, NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours', 'Mental Wellness', 
             'Patient discussed stress management techniques', false, false);
        `, [
            patients.get(users.get('abhay.raj@example.com').user_id).patient_id,
            patients.get(users.get('priya.sharma@example.com').user_id).patient_id
        ]);

        // 24. Seed AI Chat Logs (with new columns)
        console.log('Seeding AI chat logs...');
        await client.query(`
            INSERT INTO ai_chat_logs (
                user_id, message_content, sender, timestamp, ai_agent_type, 
                ai_metadata, media_attachments, media_type
            ) VALUES
            ($1, 'I have been feeling very sad lately and have lost interest in things I used to enjoy', 
             'User', NOW() - INTERVAL '2 hours', 'Mental Wellness Agent', 
             $2, NULL, NULL),
            ($1, 'I understand that you''re feeling sad. This sounds like it could be depression. Have you been experiencing this for more than 2 weeks?', 
             'AI', NOW() - INTERVAL '1 hour 55 minutes', 'Mental Wellness Agent', 
             $3, NULL, NULL);
        `, [
            users.get('abhay.raj@example.com').user_id,
            JSON.stringify({ confidence: 0.8, category: 'depression' }),
            JSON.stringify({ confidence: 0.9, category: 'depression_assessment' })
        ]);

        // 25. Seed Reviews (with new columns)
        console.log('Seeding reviews...');
        await client.query(`
            INSERT INTO reviews (
                patient_id, rating, comment, target_type, target_id, 
                appreciated_aspects, feedback_suggestions, is_verified_visit
            ) VALUES
            ($1, 5, 'Dr. Alok was very helpful and professional.', 'Clinic_Doctor', $2, 
             'Knowledgeable, Patient, Explained well', 'Perhaps more time for each patient', true),
            ($3, 4, 'Good consultation, felt heard and understood.', 'Professional', $4, 
             'Empathetic, Good listener', 'Maybe shorter waiting times', true);
        `, [
            patients.get(users.get('rajesh.kumar@example.com').user_id).patient_id,
            clinicDoctors.get('Dr. Alok Ranjan').clinic_doctor_id,
            patients.get(users.get('priya.sharma@example.com').user_id).patient_id,
            professionals.get(users.get('amit.patel@example.com').user_id).professional_id
        ]);

        // 26. Seed Notification Settings
        console.log('Seeding notification settings...');
        for (const [email, userData] of users.entries()) {
            if (email.includes('Patient') || patients.has(userData.user_id)) {
                await client.query(`
                    INSERT INTO notification_settings (
                        user_id, all_notifications_enabled, appointment_alerts, 
                        incoming_calls, incoming_video_calls, medical_reminders, 
                        vibration_alerts, updated_at
                    ) VALUES ($1, true, true, true, true, true, true, NOW());
                `, [userData.user_id]);
            }
        }

        // 27. Seed Account Settings
        console.log('Seeding account settings...');
        for (const [email, userData] of users.entries()) {
            await client.query(`
                INSERT INTO account_settings (
                    user_id, preferred_language, dark_mode, 
                    notification_preference, biometric_enabled, last_password_change
                ) VALUES ($1, 'English', false, 'All', false, NOW());
            `, [userData.user_id]);
        }

        // 28. Seed Health Articles
        console.log('Seeding health articles...');
        const articleResult = await client.query(`
            INSERT INTO health_articles (
                title, content, content_type, category, author, published_date, 
                thumbnail_url, video_url, duration_minutes, view_count, tags, 
                verified_content, read_time_minutes
            ) VALUES
            ('Managing Anxiety in Daily Life', 
             'Anxiety is a normal emotion characterized by feelings of tension, worried thoughts, and physical changes like increased blood pressure...', 
             'Article', 'Mental Wellness', 'Dr. Meera Sharma', CURRENT_DATE - INTERVAL '5 days', 
             'https://cdn.clinico.app/images/anxiety-thumb.jpg', NULL, 8, 1250, 
             '#MentalHealth #Anxiety #Wellness', true, 5),
            ('Benefits of Regular Exercise', 
             'Regular physical activity is one of the most important things you can do for your health...', 
             'Article', 'Exercise', 'Dr. Rajesh Kumar', CURRENT_DATE - INTERVAL '3 days', 
             'https://cdn.clinico.app/images/exercise-thumb.jpg', NULL, 12, 890, 
             '#Exercise #Health #Fitness', true, 6),
            ('Understanding Sleep Cycles', 
             'Sleep is a complex biological process that is essential for good health...', 
             'Video', 'Sleep', 'Dr. Priya Verma', CURRENT_DATE - INTERVAL '7 days', 
             'https://cdn.clinico.app/images/sleep-thumb.jpg', 
             'https://cdn.clinico.app/videos/sleep-cycles.mp4', 15, 2100, 
             '#Sleep #Health #Wellness', true, 8)
            RETURNING article_id, title;
        `);
        
        const articles = new Map(articleResult.rows.map(a => [a.title, a.article_id]));

        // 29. Seed Article Reads
        console.log('Seeding article reads...');
        await client.query(`
            INSERT INTO article_reads (
                patient_id, article_id, read_at, time_spent_seconds, 
                completed, saved_to_library
            ) VALUES
            ($1, $2, NOW() - INTERVAL '2 days', 320, true, true),
            ($3, $4, NOW() - INTERVAL '1 day', 450, true, false);
        `, [
            patients.get(users.get('abhay.raj@example.com').user_id).patient_id,
            articles.get('Managing Anxiety in Daily Life'),
            patients.get(users.get('priya.sharma@example.com').user_id).patient_id,
            articles.get('Benefits of Regular Exercise')
        ]);

        // 30. Seed Wellness Library
        console.log('Seeding wellness library...');
        await client.query(`
            INSERT INTO wellness_library (patient_id, article_id, saved_at, personal_notes) 
            VALUES ($1, $2, NOW(), 'Very helpful for managing my stress levels');
        `, [
            patients.get(users.get('abhay.raj@example.com').user_id).patient_id,
            articles.get('Managing Anxiety in Daily Life')
        ]);

        // 31. Seed Wellness Thoughts
        console.log('Seeding wellness thoughts...');
        await client.query(`
            INSERT INTO wellness_thoughts (patient_id, article_id, comment, posted_at, is_anonymous) 
            VALUES ($1, $2, 'This article really helped me understand my anxiety better. Thank you!', NOW(), false);
        `, [
            patients.get(users.get('abhay.raj@example.com').user_id).patient_id,
            articles.get('Managing Anxiety in Daily Life')
        ]);

        // 32. Seed Notifications
        console.log('Seeding notifications...');
        await client.query(`
            INSERT INTO notifications (
                user_id, notification_type, title, message, priority, 
                scheduled_time, sent_at, is_read, action_data, icon
            ) VALUES
            ($1, 'Appointment', 'Appointment Reminder', 
             'Your appointment with Dr. Amit Patel is starting in 30 minutes', 
             'Normal', NOW() + INTERVAL '30 minutes', NOW(), false, 
             $2, 'appointment-icon'),
            ($3, 'Medicine', 'Medicine Reminder', 
             'Time to take your Sertraline 50mg', 
             'Urgent', NOW(), NOW(), false, 
             $4, 'pill-icon'),
            ($5, 'Article', 'New Wellness Article', 
             'Check out our latest article on Managing Anxiety in Daily Life', 
             'Low', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', true, 
             $6, 'article-icon');
        `, [
            users.get('abhay.raj@example.com').user_id,
            JSON.stringify({ action: 'view_appointment', appointment_id: appointments[0].appointment_id }),
            users.get('priya.sharma@example.com').user_id,
            JSON.stringify({ action: 'mark_taken', reminder_id: reminder.reminder_id }),
            users.get('rajesh.kumar@example.com').user_id,
            JSON.stringify({ action: 'view_article', article_id: articles.get('Managing Anxiety in Daily Life') })
        ]);

        await client.query('COMMIT');
        console.log('✅ Transaction committed. Database has been successfully seeded!');
        console.log('\n📊 Seeding Summary:');
        console.log(`   - Users: ${users.size}`);
        console.log(`   - Patients: ${patients.size}`);
        console.log(`   - Professionals: ${professionals.size}`);
        console.log(`   - Clinics: ${clinics.size}`);
        console.log(`   - Clinic Doctors: ${clinicDoctors.size}`);
        console.log(`   - Appointments: ${appointments.length}`);
        console.log(`   - Health Articles: ${articles.size}`);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ An error occurred. Transaction has been rolled back.');
        console.error('Error details:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    } finally {
        console.log('Releasing database client...');
        client.release();
        db.end();
        console.log('--- Seeding script finished ---');
    }
};

seedDatabase();