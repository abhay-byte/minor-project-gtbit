# Complete Database Schema Documentation

## Overview
This document describes the complete database schema for a healthcare platform that connects patients with healthcare professionals, supports both virtual and in-person appointments, includes AI-powered features, and provides comprehensive medical record management.

---

## Extensions

- **uuid-ossp**: Provides UUID generation functions

---

## Custom ENUM Types

### User & Authentication
- **user_role**: `'Patient'`, `'Professional'`, `'NGO'`, `'Admin'`
- **verification_status_enum**: `'Pending'`, `'Verified'`, `'Rejected'`

### Appointments & Consultations
- **appointment_status**: `'Scheduled'`, `'Completed'`, `'Cancelled'`, `'InProgress'`
- **appointment_status_extended**: `'Scheduled'`, `'InProgress'`, `'Completed'`, `'Cancelled'`
- **appointment_type_enum**: `'Virtual'`, `'In-Person'`

### Clinics
- **clinic_type_enum**: `'Clinic'`, `'Hospital'`

### Messaging & Communication
- **sender_type**: `'User'`, `'AI'`
- **sender_type_extended**: `'Patient'`, `'Doctor'`, `'System'`
- **message_type_enum**: `'Text'`, `'Prescription'`, `'Report'`, `'JoinCall'`, `'Submitted'`
- **conversation_type_enum**: `'Appointment'`, `'Follow-up'`, `'Query'`

### Prescriptions & Reminders
- **dosage_form_enum**: `'1 tablet'`, `'1 capsule'`, `'Other'`
- **how_to_take_enum**: `'After food'`, `'Before food'`, `'After breakfast'`, `'Other'`
- **reminder_status_enum**: `'Pending'`, `'Taken'`, `'Missed'`, `'Snoozed'`

### Requests & Reports
- **request_status_enum**: `'Pending'`, `'Submitted'`, `'Reviewed'`
- **upload_method_enum**: `'File'`, `'Camera'`

### AI & Crisis Management
- **session_type_enum**: `'Health Query'`, `'Mental Wellness'`, `'Triage'`, `'Crisis'`
- **crisis_type_enum**: `'Suicidal'`, `'Self-harm'`, `'Severe distress'`
- **crisis_level_enum**: `'Critical'`, `'High'`, `'Moderate'`

### Settings & Preferences
- **notification_preference_enum**: `'All'`, `'Important'`, `'None'`

### Content & Articles
- **content_type_enum**: `'Article'`, `'Video'`
- **article_category_enum**: `'Mental Wellness'`, `'Health Awareness'`, `'Mindfulness'`, `'Exercise'`, `'Sleep'`

### Notifications
- **notification_type_enum**: `'Appointment'`, `'Medicine'`, `'Prescription'`, `'Report'`, `'Article'`, `'AppUpdate'`
- **notification_priority_enum**: `'Urgent'`, `'Normal'`, `'Low'`

---

## Core Tables

### 1. users
**Primary table for all user authentication and basic information**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | SERIAL | PRIMARY KEY | Unique identifier for every user |
| user_id_uuid | UUID | UNIQUE, NOT NULL | UUID version of user_id |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's login email |
| password_hash | VARCHAR(255) | NOT NULL | Hashed password |
| full_name | VARCHAR(255) | NOT NULL | User's full name |
| phone_number | VARCHAR(20) | | Contact number |
| role | user_role | NOT NULL | User's role in system |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| last_sync | TIMESTAMPTZ | | Last synchronization timestamp |
| verified_user | BOOLEAN | DEFAULT FALSE | User verification status |

**Indexes:**
- Primary key on `user_id`
- Unique constraint on `user_id_uuid`

---

### 2. patients
**Extended profile information for users with Patient role**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| patient_id | SERIAL | PRIMARY KEY | Unique identifier for patient profile |
| patient_id_uuid | UUID | DEFAULT gen_random_uuid() | UUID version of patient_id |
| user_id | INT | UNIQUE, NOT NULL, FK → users(user_id) | Links to users table |
| user_id_uuid | UUID | FK → users(user_id_uuid) | UUID foreign key |
| date_of_birth | DATE | | Patient's birth date |
| gender | VARCHAR(50) | | Patient's gender |
| address | VARCHAR(255) | | Primary address |
| blood_group | VARCHAR(10) | | Blood type |
| marital_status | VARCHAR(20) | | Marital status |
| known_allergies | TEXT | | List of allergies |
| chronic_conditions | TEXT | | Ongoing medical conditions |
| current_medications | TEXT | | Currently taking medications |
| lifestyle_notes | TEXT | | Lifestyle and habits notes |
| member_since | TIMESTAMPTZ | DEFAULT NOW() | Membership start date |
| patient_code | VARCHAR(20) | UNIQUE | Unique patient identifier code |
| current_location | TEXT | | Current location name |
| current_full_address | TEXT | | Full current address |

**Foreign Keys:**
- `user_id` → `users(user_id)` ON DELETE CASCADE

**Indexes:**
- `idx_patients_user_id` on `user_id`

---

### 3. professionals
**Extended profile information for healthcare professionals**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| professional_id | SERIAL | PRIMARY KEY | Unique identifier for professional |
| professional_id_uuid | UUID | DEFAULT gen_random_uuid() | UUID version of professional_id |
| user_id | INT | UNIQUE, NOT NULL, FK → users(user_id) | Links to users table |
| user_id_uuid | UUID | FK → users(user_id_uuid) | UUID foreign key |
| specialty | VARCHAR(100) | | Medical specialty |
| credentials | TEXT | | Professional credentials |
| years_of_experience | INT | CHECK >= 0 | Years of experience |
| verification_status | verification_status_enum | NOT NULL, DEFAULT 'Pending' | Admin verification status |
| rating | DECIMAL(3,2) | DEFAULT 0.00 | Average rating |
| total_reviews | INTEGER | DEFAULT 0 | Total number of reviews |
| patients_treated | INTEGER | DEFAULT 0 | Total patients treated |
| languages_spoken | TEXT | | Languages the professional speaks |
| working_hours | TEXT | | Working hours information |
| is_volunteer | BOOLEAN | DEFAULT FALSE | Volunteer status |

**Foreign Keys:**
- `user_id` → `users(user_id)` ON DELETE CASCADE

**Indexes:**
- `idx_professionals_user_id` on `user_id`

---

### 4. ngo_users
**Information for NGO-associated users**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| ngo_user_id | SERIAL | PRIMARY KEY | Unique identifier for NGO user |
| ngo_user_id_uuid | UUID | DEFAULT gen_random_uuid() | UUID version of ngo_user_id |
| user_id | INT | UNIQUE, NOT NULL, FK → users(user_id) | Links to users table |
| user_id_uuid | UUID | FK → users(user_id_uuid) | UUID foreign key |
| ngo_name | VARCHAR(255) | NOT NULL | Name of NGO |
| verification_status | verification_status_enum | NOT NULL, DEFAULT 'Pending' | Admin verification status |

**Foreign Keys:**
- `user_id` → `users(user_id)` ON DELETE CASCADE

**Indexes:**
- `idx_ngo_users_user_id` on `user_id`

---

## Appointment & Consultation Tables

### 5. availability_slots
**Defines when professionals are available for consultations**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| slot_id | SERIAL | PRIMARY KEY | Unique slot identifier |
| slot_id_uuid | UUID | DEFAULT gen_random_uuid() | UUID version of slot_id |
| professional_id | INT | NOT NULL, FK → professionals(professional_id) | Professional offering slot |
| start_time | TIMESTAMPTZ | NOT NULL | Slot start time |
| end_time | TIMESTAMPTZ | NOT NULL | Slot end time |
| is_booked | BOOLEAN | NOT NULL, DEFAULT FALSE | Booking status |
| slot_date | DATE | | Date of the slot |

**Foreign Keys:**
- `professional_id` → `professionals(professional_id)` ON DELETE CASCADE

**Constraints:**
- CHECK: `start_time < end_time`

**Indexes:**
- `idx_availability_slots_professional_id` on `professional_id`

---

### 6. appointments
**Core transactional table for patient-provider appointments**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| appointment_id | SERIAL | PRIMARY KEY | Unique appointment identifier |
| appointment_id_uuid | UUID | DEFAULT gen_random_uuid() | UUID version of appointment_id |
| patient_id | INT | NOT NULL, FK → patients(patient_id) | Patient booking appointment |
| patient_id_uuid | UUID | FK → patients(patient_id_uuid) | UUID foreign key |
| professional_id | INT | FK → professionals(professional_id) | For virtual appointments |
| professional_id_uuid | UUID | FK → professionals(professional_id_uuid) | UUID foreign key |
| clinic_doctor_id | INT | FK → clinic_doctors(clinic_doctor_id) | For in-person appointments |
| clinic_doctor_id_uuid | UUID | FK → clinic_doctors(clinic_doctor_id_uuid) | UUID foreign key |
| appointment_time | TIMESTAMPTZ | NOT NULL | Scheduled appointment time |
| status | appointment_status | NOT NULL, DEFAULT 'Scheduled' | Current appointment status |
| appointment_type | appointment_type_enum | NOT NULL | Virtual or In-Person |
| consultation_link | VARCHAR(255) | | Video call URL for virtual |
| appointment_code | VARCHAR(20) | UNIQUE | Unique appointment code |
| patient_notes | TEXT | | Notes from patient |
| scheduled_at | TIMESTAMPTZ | DEFAULT NOW() | When appointment was scheduled |
| completed_at | TIMESTAMPTZ | | When appointment was completed |
| duration_minutes | INTEGER | | Appointment duration |

**Foreign Keys:**
- `patient_id` → `patients(patient_id)` ON DELETE CASCADE
- `professional_id` → `professionals(professional_id)` ON DELETE SET NULL
- `clinic_doctor_id` → `clinic_doctors(clinic_doctor_id)` ON DELETE SET NULL

**Constraints:**
- CHECK: Virtual appointments must have professional_id and not clinic_doctor_id
- CHECK: In-Person appointments must have clinic_doctor_id and not professional_id
- CHECK: Virtual appointments must have consultation_link

**Indexes:**
- `idx_appointments_patient_id` on `patient_id`
- `idx_appointments_professional_id` on `professional_id`
- `idx_appointments_clinic_doctor_id` on `clinic_doctor_id`

---

### 7. consultations
**Stores output and notes from completed appointments**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| consultation_id | SERIAL | PRIMARY KEY | Unique consultation identifier |
| consultation_id_uuid | UUID | DEFAULT gen_random_uuid() | UUID version of consultation_id |
| appointment_id | INT | UNIQUE, NOT NULL, FK → appointments(appointment_id) | Links to appointment |
| appointment_id_uuid | UUID | FK → appointments(appointment_id_uuid) | UUID foreign key |
| notes | TEXT | | Clinical notes from professional |
| ai_briefing | TEXT | | AI-generated patient summary |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| diagnosis | TEXT | | Diagnosis details |
| doctor_recommendations | TEXT | | Doctor's recommendations |
| follow_up_instructions | TEXT | | Follow-up care instructions |
| prescription_attached | BOOLEAN | DEFAULT FALSE | Whether prescription is attached |

**Foreign Keys:**
- `appointment_id` → `appointments(appointment_id)` ON DELETE CASCADE

---

### 8. prescriptions
**Medications prescribed during consultations**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| prescription_id | SERIAL | PRIMARY KEY | Unique prescription identifier |
| prescription_id_uuid | UUID | DEFAULT gen_random_uuid() | UUID version of prescription_id |
| consultation_id | INT | NOT NULL, FK → consultations(consultation_id) | Links to consultation |
| consultation_id_uuid | UUID | FK → consultations(consultation_id_uuid) | UUID foreign key |
| medication_name | VARCHAR(255) | NOT NULL | Name of medication |
| dosage | VARCHAR(100) | | Dosage amount |
| instructions | TEXT | NOT NULL | How to take medication |
| prescription_code | VARCHAR(20) | | Unique prescription code |
| frequency | VARCHAR(100) | | Dosage frequency |
| duration | VARCHAR(50) | | Treatment duration |
| medication_category | VARCHAR(50) | | Category of medication |
| doctor_notes | TEXT | | Additional notes from doctor |
| prescribed_date | DATE | | Date prescribed |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| prescribed_by_doctor_id | INTEGER | FK → professionals(professional_id) | Prescribing doctor |
| doctor_name | VARCHAR(255) | | Doctor's name |
| doctor_specialty | VARCHAR(50) | | Doctor's specialty |
| clinic_name | VARCHAR(255) | | Clinic name |
| important_notes | TEXT | | Important notes/warnings |

**Foreign Keys:**
- `consultation_id` → `consultations(consultation_id)` ON DELETE CASCADE
- `prescribed_by_doctor_id` → `professionals(professional_id)` ON DELETE SET NULL

**Indexes:**
- `idx_prescriptions_consultation_id` on `consultation_id`

---

### 9. prescription_list
**Manages patient's prescription history**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| list_id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique list identifier |
| patient_id | INTEGER | NOT NULL, FK → patients(patient_id) | Patient identifier |
| prescription_id | INTEGER | NOT NULL, FK → prescriptions(prescription_id) | Prescription identifier |
| condition_treated | VARCHAR(255) | | Medical condition treated |
| medicines_count | INTEGER | | Number of medicines |
| next_followup | DATE | | Next follow-up date |
| prescription_status | VARCHAR(20) | DEFAULT 'Active' | Current status |
| last_viewed | TIMESTAMPTZ | | Last viewed timestamp |

**Foreign Keys:**
- `patient_id` → `patients(patient_id)` ON DELETE CASCADE
- `prescription_id` → `prescriptions(prescription_id)` ON DELETE CASCADE

---

## Medicine Reminder Tables

### 10. medicine_reminders
**Patient medication reminder system**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| reminder_id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique reminder identifier |
| patient_id | INTEGER | NOT NULL, FK → patients(patient_id) | Patient identifier |
| prescription_id | INTEGER | FK → prescriptions(prescription_id) | Related prescription |
| medication_name | VARCHAR(255) | | Name of medication |
| dosage_form | dosage_form_enum | | Form of dosage |
| timing_schedule | TEXT | | When to take medicine |
| how_to_take | how_to_take_enum | | Instructions for taking |
| duration | TEXT | | Duration of treatment |
| doctor_note | TEXT | | Notes from doctor |
| start_date | DATE | | Start date |
| end_date | DATE | | End date |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| next_reminder_time | TIMESTAMPTZ | | Next reminder time |

**Foreign Keys:**
- `patient_id` → `patients(patient_id)` ON DELETE CASCADE
- `prescription_id` → `prescriptions(prescription_id)` ON DELETE SET NULL

---

### 11. reminder_logs
**Tracks reminder delivery and patient response**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| log_id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique log identifier |
| reminder_id | UUID | NOT NULL, FK → medicine_reminders(reminder_id) | Related reminder |
| scheduled_time | TIMESTAMPTZ | NOT NULL | Scheduled reminder time |
| taken_time | TIMESTAMPTZ | | When medicine was taken |
| status | reminder_status_enum | NOT NULL, DEFAULT 'Pending' | Reminder status |
| notes | TEXT | | Additional notes |

**Foreign Keys:**
- `reminder_id` → `medicine_reminders(reminder_id)` ON DELETE CASCADE

---

## Medical Records & Vault Tables

### 12. medical_records
**Patient's digital health document vault**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| record_id | SERIAL | PRIMARY KEY | Unique record identifier |
| record_id_uuid | UUID | DEFAULT gen_random_uuid() | UUID version of record_id |
| patient_id | INT | NOT NULL, FK → patients(patient_id) | Patient owning record |
| patient_id_uuid | UUID | FK → patients(patient_id_uuid) | UUID foreign key |
| document_name | VARCHAR(255) | NOT NULL | Document name |
| document_url | VARCHAR(255) | UNIQUE, NOT NULL | Cloud storage URL |
| document_type | VARCHAR(50) | | Type of document |
| uploaded_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Upload timestamp |
| comments_notes | TEXT | | Comments or notes |
| linked_appointment_id | INTEGER | FK → appointments(appointment_id) | Related appointment |
| uploaded_by_user_id | INTEGER | NOT NULL, FK → users(user_id) | User who uploaded |
| uploaded_by_role | VARCHAR(20) | | Role of uploader |
| report_date | DATE | | Date of report |
| file_format | VARCHAR(20) | | File format |
| file_size_mb | INTEGER | | File size in MB |

**Foreign Keys:**
- `patient_id` → `patients(patient_id)` ON DELETE CASCADE
- `linked_appointment_id` → `appointments(appointment_id)` ON DELETE SET NULL

**Indexes:**
- `idx_medical_records_patient_id` on `patient_id`

---

### 13. prescription_vault
**Stores prescription documents**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| vault_prescription_id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique vault identifier |
| patient_id | INTEGER | NOT NULL, FK → patients(patient_id) | Patient identifier |
| document_url | VARCHAR(255) | | Document URL |
| metadata | TEXT | | Document metadata |
| file_count | INTEGER | DEFAULT 0 | Number of files |

**Foreign Keys:**
- `patient_id` → `patients(patient_id)` ON DELETE CASCADE

---

### 14. lab_report_vault
**Stores laboratory test reports**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| vault_lab_id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique vault identifier |
| patient_id | INTEGER | NOT NULL, FK → patients(patient_id) | Patient identifier |
| document_url | VARCHAR(255) | | Document URL |
| metadata | TEXT | | Document metadata |
| file_count | INTEGER | DEFAULT 0 | Number of files |

**Foreign Keys:**
- `patient_id` → `patients(patient_id)` ON DELETE CASCADE

---

### 15. radiology_vault
**Stores radiology images and reports**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| vault_radiology_id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique vault identifier |
| patient_id | INTEGER | NOT NULL, FK → patients(patient_id) | Patient identifier |
| document_url | VARCHAR(255) | | Document URL |
| metadata | TEXT | | Document metadata |
| file_count | INTEGER | DEFAULT 0 | Number of files |

**Foreign Keys:**
- `patient_id` → `patients(patient_id)` ON DELETE CASCADE

---

### 16. discharge_vault
**Stores discharge summaries**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| vault_discharge_id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique vault identifier |
| patient_id | INTEGER | NOT NULL, FK → patients(patient_id) | Patient identifier |
| document_url | VARCHAR(255) | | Document URL |
| metadata | TEXT | | Document metadata |
| file_count | INTEGER | DEFAULT 0 | Number of files |

**Foreign Keys:**
- `patient_id` → `patients(patient_id)` ON DELETE CASCADE

---

### 17. vaccination_vault
**Stores vaccination records**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| vault_vaccination_id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique vault identifier |
| patient_id | INTEGER | NOT NULL, FK → patients(patient_id) | Patient identifier |
| document_url | VARCHAR(255) | | Document URL |
| metadata | TEXT | | Document metadata |
| file_count | INTEGER | DEFAULT 0 | Number of files |

**Foreign Keys:**
- `patient_id` → `patients(patient_id)` ON DELETE CASCADE

---

### 18. doctor_notes_vault
**Stores doctor's clinical notes**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| vault_notes_id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique vault identifier |
| patient_id | INTEGER | NOT NULL, FK → patients(patient_id) | Patient identifier |
| document_url | VARCHAR(255) | | Document URL |
| metadata | TEXT | | Document metadata |
| file_count | INTEGER | DEFAULT 0 | Number of files |

**Foreign Keys:**
- `patient_id` → `patients(patient_id)` ON DELETE CASCADE

---

### 19. other_documents_vault
**Stores miscellaneous health documents**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| vault_other_id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique vault identifier |
| patient_id | INTEGER | NOT NULL, FK → patients(patient_id) | Patient identifier |
| document_url | VARCHAR(255) | | Document URL |
| metadata | TEXT | | Document metadata |
| file_count | INTEGER | DEFAULT 0 | Number of files |

**Foreign Keys:**
- `patient_id` → `patients(patient_id)` ON DELETE CASCADE

---

## Report Upload Request Tables

### 20. upload_report_requests
**Tracks doctor requests for patients to upload test reports**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| request_id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique request identifier |
| patient_id | INTEGER | NOT NULL, FK → patients(patient_id) | Patient identifier |
| professional_id | INTEGER | NOT NULL, FK → professionals(professional_id) | Requesting professional |
| request_code | VARCHAR(30) | UNIQUE | Unique request code |
| prescription_date | DATE | | Date of prescription |
| requested_tests | TEXT | | Tests requested |
| due_date | DATE | | Due date for upload |
| status | request_status_enum | DEFAULT 'Pending' | Request status |
| additional_notes | TEXT | | Additional notes |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Foreign Keys:**
- `patient_id` → `patients(patient_id)` ON DELETE CASCADE
- `professional_id` → `professionals(professional_id)` ON DELETE CASCADE

---

### 21. uploaded_test_reports
**Stores test reports uploaded by patients**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| upload_id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique upload identifier |
| request_id | UUID | NOT NULL, FK → upload_report_requests(request_id) | Related request |
| test_type | VARCHAR(100) | | Type of test |
| document_url | VARCHAR(255) | | Document URL |
| uploaded_at | TIMESTAMPTZ | DEFAULT NOW() | Upload timestamp |
| upload_method | upload_method_enum | | Method used to upload |

**Foreign Keys:**
- `request_id` → `upload_report_requests(request_id)` ON DELETE CASCADE

---

## Clinic & Discovery Tables

### 22. clinics
**Physical healthcare locations for hyperlocal discovery**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| clinic_id | SERIAL | PRIMARY KEY | Unique clinic identifier |
| clinic_id_uuid | UUID | DEFAULT gen_random_uuid() | UUID version of clinic_id |
| name | VARCHAR(255) | NOT NULL | Clinic name |
| address | TEXT | NOT NULL | Full address |
| latitude | DECIMAL(9,6) | NOT NULL | GPS latitude |
| longitude | DECIMAL(9,6) | NOT NULL | GPS longitude |
| phone_number | VARCHAR(20) | | Contact number |
| type | clinic_type_enum | NOT NULL | Clinic or Hospital |
| facilities | TEXT | | Available facilities |
| operating_hours | TEXT | | Operating hours |
| average_rating | DECIMAL(3,2) | DEFAULT 0.00 | Average rating |
| total_reviews | INTEGER | DEFAULT 0 | Total reviews |
| city | VARCHAR(100) | | City location |
| area | VARCHAR(100) | | Area/locality |
| pincode | VARCHAR(10) | | Postal code |

**Indexes:**
- `idx_clinics_lat_lon` on `(latitude, longitude)`

---

### 23. clinic_doctors
**Doctors working at physical clinics**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| clinic_doctor_id | SERIAL | PRIMARY KEY | Unique clinic doctor identifier |
| clinic_doctor_id_uuid | UUID | DEFAULT gen_random_uuid() | UUID version of clinic_doctor_id |
| clinic_id | INT | NOT NULL, FK → clinics(clinic_id) | Associated clinic |
| clinic_id_uuid | UUID | FK → clinics(clinic_id_uuid) | UUID foreign key |
| full_name | VARCHAR(255) | NOT NULL | Doctor's full name |
| specialty | VARCHAR(100) | | Medical specialty |
| consultation_fee | DECIMAL(10,2) | CHECK >= 0 | Consultation fee |
| qualifications | TEXT | | Professional qualifications |
| available_days | TEXT | | Days available |
| available_hours | TEXT | | Hours available |
| rating | DECIMAL(3,2) | DEFAULT 0.00 | Average rating |
| review_count | INTEGER | DEFAULT 0 | Number of reviews |
| languages | TEXT | | Languages spoken |
| distance_km | VARCHAR(20) | | Distance from user |
| hospital_affiliation | VARCHAR(255) | | Hospital affiliation |
| is_volunteer | BOOLEAN | DEFAULT FALSE | Volunteer status |
| available_today | BOOLEAN | DEFAULT FALSE | Available today |
| available_tomorrow | BOOLEAN | DEFAULT FALSE | Available tomorrow |
| available_this_week | BOOLEAN | DEFAULT FALSE | Available this week |

**Foreign Keys:**
- `clinic_id` → `clinics(clinic_id)` ON DELETE CASCADE

**Indexes:**
- `idx_clinic_doctors_clinic_id` on `clinic_id`

---

### 24. search_history
**Tracks patient search queries**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| search_id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique search identifier |
| patient_id | INTEGER | NOT NULL, FK → patients(patient_id) | Patient identifier |
| search_query | VARCHAR(255) | | Search query text |
| search_filters | TEXT | | Applied filters |
| searched_at | TIMESTAMPTZ | DEFAULT NOW() | Search timestamp |
| location_searched | TEXT | | Location context |
| results_count | INTEGER | | Number of results |

**Foreign Keys:**
- `patient_id` → `patients(patient_id)` ON DELETE CASCADE

---

### 25. saved_locations
**Patient's saved locations for easy access**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| location_id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique location identifier |
| patient_id | INTEGER | NOT NULL, FK → patients(patient_id) | Patient identifier |
| location_name | VARCHAR(10) | | Location label |
| full_address | TEXT | | Complete address |
| latitude | DECIMAL(9,6) | | GPS latitude |
| longitude | DECIMAL(9,6) | | GPS longitude |
| is_current_location | BOOLEAN | DEFAULT FALSE | Current location flag |
| is_default | BOOLEAN | DEFAULT FALSE | Default location flag |
| added_at | TIMESTAMPTZ | DEFAULT NOW() | Addition timestamp |

**Foreign Keys:**
- `patient_id` → `patients(patient_id)` ON DELETE CASCADE

---

## Communication & Messaging Tables

### 26. patient_doctor_conversations
**Conversation threads between patients and doctors**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| conversation_id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique conversation identifier |
| patient_id | INTEGER | NOT NULL, FK → patients(patient_id) | Patient identifier |
| professional_id | INTEGER | NOT NULL, FK → professionals(professional_id) | Professional identifier |
| appointment_id | INTEGER | FK → appointments(appointment_id) | Related appointment |
| last_message_at | TIMESTAMPTZ | | Last message timestamp |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |
| conversation_type | conversation_type_enum | | Type of conversation |

**Foreign Keys:**
- `patient_id` → `patients(patient_id)` ON DELETE CASCADE
- `professional_id` → `professionals(professional_id)` ON DELETE CASCADE
- `appointment_id` → `appointments(appointment_id)` ON DELETE SET NULL

---

### 27. professional_conversations
**Conversation threads from professional's perspective**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| conversation_id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique conversation identifier |
| professional_id | INTEGER | NOT NULL, FK → professionals(professional_id) | Professional identifier |
| patient_id | INTEGER | NOT NULL, FK → patients(patient_id) | Patient identifier |
| appointment_id | INTEGER | FK → appointments(appointment_id) | Related appointment |
| last_message_at | TIMESTAMPTZ | | Last message timestamp |
| is_active | BOOLEAN | DEFAULT TRUE | Active status |

**Foreign Keys:**
- `professional_id` → `professionals(professional_id)` ON DELETE CASCADE
- `patient_id` → `patients(patient_id)` ON DELETE CASCADE
- `appointment_id` → `appointments(appointment_id)` ON DELETE SET NULL

---

### 28. messages
**Individual messages in conversations**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| message_id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique message identifier |
| conversation_id | UUID | NOT NULL, FK → patient_doctor_conversations(conversation_id) | Conversation identifier |
| sender_user_id | INTEGER | NOT NULL, FK → users(user_id) | Sender identifier |
| sender_type | sender_type_extended | NOT NULL | Type of sender |
| message_content | TEXT | | Message text content |
| message_type | message_type_enum | DEFAULT 'Text' | Type of message |
| attachment_url | VARCHAR(255) | | Attachment URL |
| sent_at | TIMESTAMPTZ | DEFAULT NOW() | Send timestamp |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |
| read_at | TIMESTAMPTZ | | Read timestamp |

**Foreign Keys:**
- `conversation_id` → `patient_doctor_conversations(conversation_id)` ON DELETE CASCADE
- `sender_user_id` → `users(user_id)` ON DELETE CASCADE

---

## AI & Chat Tables

### 29. ai_chat_logs
**Conversation history with AI Care Companion**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| log_id | SERIAL | PRIMARY KEY | Unique log identifier |
| log_id_uuid | UUID | DEFAULT gen_random_uuid() | UUID version of log_id |
| user_id | INT | NOT NULL, FK → users(user_id) | User identifier |
| user_id_uuid | UUID | FK → users(user_id_uuid) | UUID foreign key |
| message_content | TEXT | NOT NULL | Message content |
| sender | sender_type | NOT NULL | User or AI |
| timestamp | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Message timestamp |
| ai_agent_type | VARCHAR(50) | | Type of AI agent |
| ai_metadata | JSON | | AI processing metadata |
| media_attachments | TEXT | | Media attachments |
| media_type | VARCHAR(20) | | Type of media |

**Foreign Keys:**
- `user_id` → `users(user_id)` ON DELETE CASCADE

**Indexes:**
- `idx_ai_chat_logs_user_id` on `user_id`

---

### 30. ai_chat_sessions
**AI chat session management**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| session_id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique session identifier |
| patient_id | INTEGER | NOT NULL, FK → patients(patient_id) | Patient identifier |
| started_at | TIMESTAMPTZ | DEFAULT NOW() | Session start time |
| ended_at | TIMESTAMPTZ | | Session end time |
| session_type | session_type_enum | | Type of session |
| session_summary | TEXT | | Session summary |
| escalated_to_professional | BOOLEAN | DEFAULT FALSE | Escalation flag |
| crisis_detected | BOOLEAN | DEFAULT FALSE | Crisis detection flag |
| crisis_type | crisis_type_enum | | Type of crisis |

**Foreign Keys:**
- `patient_id` → `patients(patient_id)` ON DELETE CASCADE

---

### 31. crisis_interventions
**Tracks mental health crisis interventions**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| intervention_id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique intervention identifier |
| session_id | UUID | NOT NULL, FK → ai_chat_sessions(session_id) | Related session |
| patient_id | INTEGER | NOT NULL, FK → patients(patient_id) | Patient identifier |
| crisis_level | crisis_level_enum | | Severity level |
| crisis_keywords | TEXT | | Detected keywords |
| detected_at | TIMESTAMPTZ | DEFAULT NOW() | Detection timestamp |
| helpline_provided | TEXT | | Helpline information |
| action_taken | VARCHAR(100) | | Action taken |
| patient_acknowledged | BOOLEAN | DEFAULT FALSE | Acknowledgment status |
| follow_up_notes | TEXT | | Follow-up notes |

**Foreign Keys:**
- `session_id` → `ai_chat_sessions(session_id)` ON DELETE CASCADE
- `patient_id` → `patients(patient_id)` ON DELETE CASCADE

---

## Review & Feedback Tables

### 32. reviews
**Patient feedback and ratings**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| review_id | SERIAL | PRIMARY KEY | Unique review identifier |
| review_id_uuid | UUID | DEFAULT gen_random_uuid() | UUID version of review_id |
| patient_id | INT | NOT NULL, FK → patients(patient_id) | Reviewing patient |
| patient_id_uuid | UUID | FK → patients(patient_id_uuid) | UUID foreign key |
| rating | INT | NOT NULL, CHECK 1-5 | Rating (1-5 stars) |
| comment | TEXT | | Review comment |
| target_type | VARCHAR(50) | NOT NULL | Entity type being reviewed |
| target_id | INT | NOT NULL | Entity ID being reviewed |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| appreciated_aspects | TEXT | | Positive aspects |
| feedback_suggestions | TEXT | | Improvement suggestions |
| is_verified_visit | BOOLEAN | DEFAULT FALSE | Visit verification status |

**Foreign Keys:**
- `patient_id` → `patients(patient_id)` ON DELETE CASCADE

**Indexes:**
- `idx_reviews_patient_id` on `patient_id`
- `idx_reviews_target` on `(target_type, target_id)`

---

## Settings Tables

### 33. notification_settings
**User notification preferences**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| settings_id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique settings identifier |
| user_id | INTEGER | NOT NULL, FK → users(user_id) | User identifier |
| all_notifications_enabled | BOOLEAN | DEFAULT TRUE | Master notification toggle |
| appointment_alerts | BOOLEAN | DEFAULT TRUE | Appointment notifications |
| incoming_calls | BOOLEAN | DEFAULT TRUE | Call notifications |
| incoming_video_calls | BOOLEAN | DEFAULT TRUE | Video call notifications |
| medical_reminders | BOOLEAN | DEFAULT TRUE | Medicine reminders |
| vibration_alerts | BOOLEAN | DEFAULT TRUE | Vibration setting |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Foreign Keys:**
- `user_id` → `users(user_id)` ON DELETE CASCADE

---

### 34. account_settings
**User account preferences**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| settings_id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique settings identifier |
| user_id | INTEGER | NOT NULL, FK → users(user_id) | User identifier |
| preferred_language | VARCHAR(20) | DEFAULT 'English' | Preferred language |
| dark_mode | BOOLEAN | DEFAULT FALSE | Dark mode preference |
| notification_preference | notification_preference_enum | DEFAULT 'All' | Notification level |
| biometric_enabled | BOOLEAN | DEFAULT FALSE | Biometric authentication |
| last_password_change | TIMESTAMPTZ | DEFAULT NOW() | Last password change |

**Foreign Keys:**
- `user_id` → `users(user_id)` ON DELETE CASCADE

---

## Content & Wellness Tables

### 35. health_articles
**Educational health content**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| article_id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique article identifier |
| title | VARCHAR(255) | NOT NULL | Article title |
| content | TEXT | | Article content |
| content_type | content_type_enum | | Article or Video |
| category | article_category_enum | | Content category |
| author | VARCHAR(255) | | Author name |
| published_date | DATE | | Publication date |
| thumbnail_url | VARCHAR(255) | | Thumbnail image URL |
| video_url | VARCHAR(255) | | Video URL (if video) |
| duration_minutes | INTEGER | | Content duration |
| view_count | INTEGER | DEFAULT 0 | Total views |
| tags | TEXT | | Content tags |
| verified_content | BOOLEAN | DEFAULT FALSE | Verification status |
| read_time_minutes | INTEGER | | Estimated read time |

---

### 36. article_reads
**Tracks user article engagement**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| read_id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique read identifier |
| patient_id | INTEGER | NOT NULL, FK → patients(patient_id) | Patient identifier |
| article_id | UUID | NOT NULL, FK → health_articles(article_id) | Article identifier |
| read_at | TIMESTAMPTZ | DEFAULT NOW() | Read timestamp |
| time_spent_seconds | INTEGER | | Time spent reading |
| completed | BOOLEAN | DEFAULT FALSE | Completion status |
| saved_to_library | BOOLEAN | DEFAULT FALSE | Saved status |

**Foreign Keys:**
- `patient_id` → `patients(patient_id)` ON DELETE CASCADE
- `article_id` → `health_articles(article_id)` ON DELETE CASCADE

---

### 37. wellness_library
**Patient's saved wellness content**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| library_id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique library identifier |
| patient_id | INTEGER | NOT NULL, FK → patients(patient_id) | Patient identifier |
| article_id | UUID | NOT NULL, FK → health_articles(article_id) | Article identifier |
| saved_at | TIMESTAMPTZ | DEFAULT NOW() | Save timestamp |
| personal_notes | TEXT | | Patient's personal notes |

**Foreign Keys:**
- `patient_id` → `patients(patient_id)` ON DELETE CASCADE
- `article_id` → `health_articles(article_id)` ON DELETE CASCADE

---

### 38. wellness_thoughts
**Patient comments and reflections on wellness content**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| thought_id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique thought identifier |
| patient_id | INTEGER | NOT NULL, FK → patients(patient_id) | Patient identifier |
| article_id | UUID | FK → health_articles(article_id) | Related article |
| comment | TEXT | | Comment text |
| posted_at | TIMESTAMPTZ | DEFAULT NOW() | Post timestamp |
| is_anonymous | BOOLEAN | DEFAULT FALSE | Anonymous posting |

**Foreign Keys:**
- `patient_id` → `patients(patient_id)` ON DELETE CASCADE
- `article_id` → `health_articles(article_id)` ON DELETE SET NULL

---

## Notifications Table

### 39. notifications
**System notifications for users**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| notification_id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique notification identifier |
| user_id | INTEGER | NOT NULL, FK → users(user_id) | User identifier |
| notification_type | notification_type_enum | NOT NULL | Type of notification |
| title | VARCHAR(255) | | Notification title |
| message | TEXT | | Notification message |
| priority | notification_priority_enum | DEFAULT 'Normal' | Priority level |
| scheduled_time | TIMESTAMPTZ | | Scheduled delivery time |
| sent_at | TIMESTAMPTZ | | Actual send time |
| is_read | BOOLEAN | DEFAULT FALSE | Read status |
| action_data | JSON | | Action metadata |
| icon | VARCHAR(50) | | Icon identifier |

**Foreign Keys:**
- `user_id` → `users(user_id)` ON DELETE CASCADE

---

## Migration Strategy

### UUID Migration Notes

The database is currently in transition from SERIAL (INTEGER) primary keys to UUID primary keys. The migration strategy includes:

1. **Current State**: All tables use SERIAL primary keys (e.g., `user_id`, `patient_id`)
2. **Transition State**: UUID columns added alongside SERIAL columns (e.g., `user_id_uuid`)
3. **Future State**: UUID columns will eventually replace SERIAL as primary keys

**UUID Columns Added:**
- All major entity tables now have both integer and UUID identifier columns
- UUID foreign key relationships have been established
- Comments indicate migration status on key UUID columns

**Important Notes:**
- Do not remove SERIAL columns yet - they are still the active primary keys
- UUID columns are populated with `gen_random_uuid()` or `uuid_generate_v4()`
- Foreign key constraints exist for both SERIAL and UUID relationships
- A future migration will complete the transition to UUID primary keys

---

## Key Relationships Summary

### User Hierarchy
- `users` (1) → (0..1) `patients`
- `users` (1) → (0..1) `professionals`
- `users` (1) → (0..1) `ngo_users`

### Appointment Flow
- `patients` (1) → (0..*) `appointments`
- `professionals` (1) → (0..*) `appointments` (for virtual)
- `clinic_doctors` (1) → (0..*) `appointments` (for in-person)
- `appointments` (1) → (0..1) `consultations`
- `consultations` (1) → (0..*) `prescriptions`

### Medical Records
- `patients` (1) → (0..*) `medical_records`
- `patients` (1) → (0..*) `prescription_vault`
- `patients` (1) → (0..*) `lab_report_vault`
- `patients` (1) → (0..*) `radiology_vault`
- `patients` (1) → (0..*) `discharge_vault`
- `patients` (1) → (0..*) `vaccination_vault`
- `patients` (1) → (0..*) `doctor_notes_vault`
- `patients` (1) → (0..*) `other_documents_vault`

### Communication
- `patients` (1) → (0..*) `patient_doctor_conversations` ← (*..1) `professionals`
- `patient_doctor_conversations` (1) → (0..*) `messages`

### AI Features
- `users` (1) → (0..*) `ai_chat_logs`
- `patients` (1) → (0..*) `ai_chat_sessions`
- `ai_chat_sessions` (1) → (0..*) `crisis_interventions`

### Discovery
- `clinics` (1) → (0..*) `clinic_doctors`
- `patients` (1) → (0..*) `search_history`
- `patients` (1) → (0..*) `saved_locations`

### Reminders
- `patients` (1) → (0..*) `medicine_reminders`
- `medicine_reminders` (1) → (0..*) `reminder_logs`

### Wellness Content
- `health_articles` (1) → (0..*) `article_reads`
- `health_articles` (1) → (0..*) `wellness_library`
- `health_articles` (1) → (0..*) `wellness_thoughts`

---

## Index Summary

**Performance-Critical Indexes:**
- All foreign key columns are indexed
- Composite index on `clinics(latitude, longitude)` for geo-queries
- Polymorphic review lookup: `reviews(target_type, target_id)`
- User-specific data access indexes on all child tables

---

## Constraints Summary

### Check Constraints
- `professionals.years_of_experience >= 0`
- `clinic_doctors.consultation_fee >= 0`
- `reviews.rating` between 1 and 5
- `availability_slots.start_time < end_time`
- `appointments`: Enforces hybrid appointment logic (Virtual XOR In-Person)
- `appointments`: Consultation link only for virtual appointments

### Unique Constraints
- `users.email`
- `users.user_id_uuid`
- `patients.patient_code`
- `appointments.appointment_code`
- `medical_records.document_url`
- `upload_report_requests.request_code`
- Various UUID primary keys

### Default Values
- Timestamps: `NOW()` for creation times
- Booleans: Typically `FALSE` for flags
- Enums: Sensible defaults (e.g., `'Pending'` for verification status)
- Ratings: `0.00` for averages
- Counters: `0` for counts

---

## Cascade Behaviors

### ON DELETE CASCADE (Data owned by parent)
- All role-specific tables cascade from `users`
- All patient-specific data cascades from `patients`
- All professional-specific data cascades from `professionals`
- Consultations cascade from appointments
- Prescriptions cascade from consultations
- Messages cascade from conversations
- Reminder logs cascade from reminders

### ON DELETE SET NULL (Reference data)
- Appointment professional/clinic_doctor (preserves history)
- Prescription doctor reference
- Medical record appointment link
- Conversation appointment link

---

## Notes for Developers

1. **Hybrid Appointment Model**: The system supports both virtual (with platform professionals) and in-person (with clinic doctors) appointments. Check constraints ensure data integrity.

2. **Polymorphic Reviews**: The `reviews` table uses `target_type` and `target_id` to allow reviews for different entity types (appointments, clinic doctors, etc.).

3. **AI Safety**: Crisis intervention system automatically detects and responds to mental health emergencies with appropriate resources.

4. **Geo-Spatial Features**: Clinics and saved locations use latitude/longitude for map-based discovery. Consider PostGIS for advanced geo-queries.

5. **UUID Migration**: The database is transitioning to UUIDs. Use UUID columns for new integrations where possible, but SERIAL columns remain the active primary keys.

6. **Data Privacy**: Patient medical records and conversations contain sensitive health information. Implement appropriate access controls and encryption.

7. **Enum Extensions**: When adding new enum values, use proper ALTER TYPE statements to avoid recreation of dependent objects.

---

## Version History

- **Version 1**: Initial user and role tables
- **Version 2**: Appointment and consultation workflow
- **Version 3**: Discovery (clinics) and medical records
- **Version 4**: Reviews and AI chat logs
- **Version 5**: Extended features (reminders, vaults, wellness, settings)
- **Version 6**: UUID migration preparation