// src/scripts/seed.js
require('dotenv').config({ path: '../.env' }); // Adjusted path to find .env in the parent src folder
const db = require('../config/db'); // Adjusted path to the db config
const bcrypt = require('bcrypt');

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
                medical_records, reviews, ai_chat_logs
            CASCADE;
        `);

        // 2. Hash passwords
        console.log('Hashing user passwords...');
        const salt = await bcrypt.genSalt(10);
        const passwords = {
            default: await bcrypt.hash('password123', salt),
            admin: await bcrypt.hash('admin123', salt),
        };

        // 3. Seed Users
        console.log('Seeding users...');
        const userResult = await client.query(`
            INSERT INTO users (email, password_hash, full_name, phone_number, role) VALUES
            ('abhay.raj@example.com', $1, 'Abhay Raj', '9876543210', 'Patient'),
            ('priya.sharma@example.com', $1, 'Priya Sharma', '9876543211', 'Patient'),
            ('rajesh.kumar@example.com', $1, 'Rajesh Kumar', '9876543212', 'Patient'),
            ('amit.patel@example.com', $1, 'Dr. Amit Patel', '9876543213', 'Professional'),
            ('anjali.singh@example.com', $1, 'Dr. Anjali Singh', '9876543214', 'Professional'),
            ('vikram.verma@example.com', $1, 'Dr. Vikram Verma', '9876543215', 'Professional'),
            ('ngo.helpline@example.com', $1, 'Health Alliance NGO', '9876543220', 'NGO'),
            ('admin@clinico.com', $2, 'Admin User', '9876543230', 'Admin')
            RETURNING user_id, email;
        `, [passwords.default, passwords.admin]);

        // Helper to easily find IDs from the returned data
        const users = new Map(userResult.rows.map(u => [u.email, u.user_id]));

        // 4. Seed role-specific tables and get their new IDs
        console.log('Seeding user roles (patients, professionals, NGOs)...');
        const patientResult = await client.query(`
            INSERT INTO patients (user_id, date_of_birth, gender, address)
            SELECT user_id, '2000-01-15'::date, 'Male', '123 Health St, New Delhi' FROM users WHERE email = 'abhay.raj@example.com'
            UNION ALL
            SELECT user_id, '1995-05-22'::date, 'Female', '456 Wellness Ave, New Delhi' FROM users WHERE email = 'priya.sharma@example.com'
            UNION ALL
            SELECT user_id, '1988-11-30'::date, 'Male', '789 Care Lane, Mumbai' FROM users WHERE email = 'rajesh.kumar@example.com'
            RETURNING patient_id, user_id;
        `);
        const patients = new Map(patientResult.rows.map(p => [p.user_id, p.patient_id]));

        const professionalResult = await client.query(`
            INSERT INTO professionals (user_id, specialty, credentials, years_of_experience, verification_status)
            SELECT user_id, 'Psychiatrist', 'MD, MBBS', 8, 'Verified'::verification_status_enum FROM users WHERE email = 'amit.patel@example.com'
            UNION ALL
            SELECT user_id, 'General Practitioner', 'MBBS', 5, 'Verified'::verification_status_enum FROM users WHERE email = 'anjali.singh@example.com'
            UNION ALL
            SELECT user_id, 'Cardiologist', 'MD, DM Cardiology', 12, 'Pending'::verification_status_enum FROM users WHERE email = 'vikram.verma@example.com'
            RETURNING professional_id, user_id;
        `);
        const professionals = new Map(professionalResult.rows.map(p => [p.user_id, p.professional_id]));

        await client.query(`
            INSERT INTO ngo_users (user_id, ngo_name, verification_status) VALUES
            ($1, 'Health Alliance India', 'Verified');
        `, [users.get('ngo.helpline@example.com')]);


        // 5. Seed Clinics and Doctors
        console.log('Seeding clinics and clinic doctors...');
        const clinicResult = await client.query(`
            INSERT INTO clinics (name, address, latitude, longitude, phone_number, type) VALUES
            ('City General Hospital', '456 Wellness Ave, New Delhi', 28.6145, 77.2105, '011-123-4567', 'Hospital'),
            ('Metro Clinic', '789 Care Lane, Mumbai', 19.0760, 72.8777, '022-987-6543', 'Clinic')
            RETURNING clinic_id, name;
        `);
        const clinics = new Map(clinicResult.rows.map(c => [c.name, c.clinic_id]));

        await client.query(`
            INSERT INTO clinic_doctors (clinic_id, full_name, specialty, consultation_fee) VALUES
            ($1, 'Dr. Alok Ranjan', 'Cardiologist', 800.00),
            ($2, 'Dr. Suresh Nair', 'Psychiatrist', 600.00);
        `, [clinics.get('City General Hospital'), clinics.get('Metro Clinic')]);


        // 6. Seed Appointments & related records
        console.log('Seeding appointments and consultations...');
        
        const patientAbhayId = patients.get(users.get('abhay.raj@example.com'));
        const patientPriyaId = patients.get(users.get('priya.sharma@example.com'));
        const patientRajeshId = patients.get(users.get('rajesh.kumar@example.com'));
        
        const profAmitId = professionals.get(users.get('amit.patel@example.com'));
        const profAnjaliId = professionals.get(users.get('anjali.singh@example.com'));
        const profVikramId = professionals.get(users.get('vikram.verma@example.com'));

        await client.query(`
            INSERT INTO appointments (patient_id, professional_id, appointment_time, status, appointment_type, consultation_link) VALUES
            ($1, $4, NOW() + INTERVAL '3 days', 'Scheduled', 'Virtual', 'https://meet.clinico.app/abc-123-xyz'),
            ($2, $5, NOW() + INTERVAL '5 days', 'Scheduled', 'Virtual', 'https://meet.clinico.app/def-456-uvw'),
            ($3, $6, NOW() - INTERVAL '2 days', 'Completed', 'Virtual', 'https://meet.clinico.app/ghi-789-rst');
        `, [patientAbhayId, patientPriyaId, patientRajeshId, profAmitId, profAnjaliId, profVikramId]);


        // Add a consultation for the completed appointment
        await client.query(`
            INSERT INTO consultations (appointment_id, notes, ai_briefing)
            SELECT appointment_id, 'Patient reports mild anxiety. Prescribed coping strategies.', 'AI Summary: Patient mentioned stress.'
            FROM appointments WHERE status = 'Completed';
        `);

        // 7. Seed AI Chat Logs
        console.log('Seeding AI chat logs...');
        await client.query(`
            INSERT INTO ai_chat_logs (user_id, message_content, sender, "timestamp") VALUES
            ($1, 'I have a sore throat.', 'User', NOW() - INTERVAL '5 minutes'),
            ($1, 'Sorry to hear that. Have you had a fever?', 'AI', NOW() - INTERVAL '4 minutes');
        `, [users.get('abhay.raj@example.com')]);


        await client.query('COMMIT');
        console.log('✅ Transaction committed. Database has been successfully seeded!');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ An error occurred. Transaction has been rolled back.');
        console.error(error);
        process.exit(1); // Exit with an error code
    } finally {
        console.log('Releasing database client...');
        client.release();
        // Close the database pool to allow the script to exit gracefully
        db.end();
        console.log('--- Seeding script finished ---');
    }
};

seedDatabase();
