-- seed.sql
-- Run after all migrations. Inserts sample data for development.

BEGIN;

-- Clear existing dev data (careful in non-dev)
TRUNCATE TABLE "AIChatLogs","Reviews","Prescriptions","Consultations","Appointments","AvailabilitySlots","MedicalRecords","ClinicDoctors","Clinics","NgoUsers","Professionals","Patients","Users" RESTART IDENTITY CASCADE;

-- Users (Patients, Professionals, NGO)
INSERT INTO "Users"(name,email,password_hash,role)
VALUES
('Aman Kumar','aman.kumar@example.com','dev_hashed_pw','patient'),
('Priya Gupta','priya.gupta@example.com','dev_hashed_pw','patient'),
('Dr. Neha Sharma','neha.sharma@example.com','dev_hashed_pw','professional'),
('Dr. Rohit Verma','rohit.verma@example.com','dev_hashed_pw','professional'),
('Care Support NGO','care.support@example.com','dev_hashed_pw','ngo');

-- Map user_id -> Patients/Professionals/NgoUsers
INSERT INTO "Patients"(user_id,date_of_birth,gender,blood_group,contact_number)
VALUES
(1,'1994-04-21','Female','A+','+919900000001'),
(2,'1988-11-12','Male','O-','+919900000002');

INSERT INTO "Professionals"(user_id,specialization,license_number,experience_years,qualifications,contact_number)
VALUES
(3,'General Physician','LIC-GP-1001',6,'MBBS, MD','+919800000003'),
(4,'Pediatrician','LIC-PED-2002',8,'MBBS, DCH','+919800000004');

INSERT INTO "NgoUsers"(user_id,organization_name,registration_number,address,contact_number)
VALUES
(5,'Care Support NGO','REG-2025-999','Sector 12, Sample City','+919700000005');

-- Clinics
INSERT INTO "Clinics"(name,address,city,state,postal_code,country,latitude,longitude,phone_number,website)
VALUES
('GreenHealth Clinic','12 MG Road, Central','New Delhi','Delhi','110001','India',28.613939,77.209021,'+911112223333','https://greenhealth.example.com'),
('Lakeside Medical Center','45 Lake Street','Mumbai','Maharashtra','400001','India',19.076090,72.877426,'+912223334444','https://lakeside.example.com');

-- ClinicDoctors
 
INSERT INTO "ClinicDoctors"(clinic_id,professional_id,department)
VALUES
(1,1,'General Medicine'),
(2,2,'Pediatrics');

-- AvailabilitySlots for each professional (2 slots each)
INSERT INTO "AvailabilitySlots"(professional_id,start_time,end_time,slot_type,is_booked)
VALUES
(1,'2025-10-15 09:00+05:30','2025-10-15 09:30+05:30','in_person',FALSE),
(1,'2025-10-15 10:00+05:30','2025-10-15 10:30+05:30','teleconsult',FALSE),
(2,'2025-10-16 11:00+05:30','2025-10-16 11:30+05:30','in_person',FALSE),
(2,'2025-10-16 12:00+05:30','2025-10-16 12:30+05:30','teleconsult',FALSE);

-- Appointments (link patient 1 with professional 1 using slot 1)
INSERT INTO "Appointments"(patient_id,professional_id,clinic_id,slot_id,status,reason)
VALUES
(1,1,1,1,'scheduled','Fever and cold checkup'),
(2,2,2,3,'scheduled','Child routine checkup');

-- Mark slot as booked for the first appointment
UPDATE "AvailabilitySlots" SET is_booked = TRUE WHERE id = 1;

-- Consultations
INSERT INTO "Consultations"(appointment_id,start_time,end_time,notes,diagnosis,follow_up_date)
VALUES
(1,'2025-10-15 09:00+05:30','2025-10-15 09:20+05:30','Patient had mild fever, advised rest and fluids','Viral fever','2025-10-22'),
(2,'2025-10-16 11:00+05:30','2025-10-16 11:25+05:30','Routine pediatric check; vaccines up-to-date','Healthy','NULL');

-- Prescriptions
INSERT INTO "Prescriptions"(consultation_id,medicine_name,dosage,instructions,duration_days)
VALUES
(1,'Paracetamol 500mg','1-1-1 as needed','After food if stomach upset',3);

-- MedicalRecords
INSERT INTO "MedicalRecords"(patient_id,record_date,title,description,record_type,file_url)
VALUES
(1,'2025-09-01','Blood Test Results','CBC normal','lab',NULL),
(2,'2024-12-10','X-Ray Chest','No abnormality detected','imaging',NULL);

-- Reviews
INSERT INTO "Reviews"(patient_id,clinic_id,appointment_id,rating,title,comment)
VALUES
(1,1,1,5,'Excellent Visit','Friendly staff and quick consultation'),
(2,2,2,4,'Good Care','Pediatrician explained clearly');

-- AIChatLogs
INSERT INTO "AIChatLogs"(user_id,session_id,user_message,assistant_response,metadata)
VALUES
(1,gen_random_uuid(),'How do I book an appointment?','Use the available slots on the professional profile to book an appointment.', '{"source":"seed"}');

COMMIT;
