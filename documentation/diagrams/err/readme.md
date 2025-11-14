### **Overview of the Clinico Database Schema**

This ER diagram outlines the complete data structure for the Clinico platform. The design is centered around a flexible **core user model**, a powerful **hybrid appointment system**, and distinct modules for handling patient data, hyperlocal discovery, and user interactions.

```mermaid
erDiagram
    %% Core User & Authentication
    users ||--o| patients : "is_a"
    users ||--o| professionals : "is_a"
    users ||--o| ngo_users : "is_a"
    users {
        uuid user_id PK
        varchar email UK
        varchar password_hash
        varchar full_name
        varchar phone_number
        enum role "Patient, Professional, NGO"
        timestamp created_at
        timestamp last_sync "For profile sync"
        boolean verified_user "Email/phone verification"
    }

    patients {
        uuid patient_id PK
        uuid user_id FK
        date date_of_birth
        varchar gender
        text address
        varchar blood_group "B+, A+, etc"
        varchar marital_status
        text known_allergies "Penicillin, Sulfa drugs"
        text chronic_conditions "Hypertension, etc"
        text current_medications "Amlodipine 5mg daily"
        text lifestyle_notes "Non-smoker, exercises"
        timestamp member_since
        varchar patient_code "PT-2025-1847"
        varchar current_location "New Delhi, India"
        text current_full_address "123, Block A, Sector 14, Dwarka, New Delhi - 110078"
    }

    professionals {
        uuid professional_id PK
        uuid user_id FK
        varchar specialty "Psychiatrist, Cardiologist"
        text credentials "MBBS, MD, ABC Hospital"
        integer years_of_experience
        enum verification_status "Pending, Verified"
        decimal rating "4.7"
        integer total_reviews
        integer patients_treated "100+"
        text languages_spoken "Hindi, English"
        text working_hours "10:30am-12:30pm, 4:30pm-7:30pm"
        boolean is_volunteer
    }

    ngo_users {
        uuid ngo_user_id PK
        uuid user_id FK
        varchar ngo_name
        enum verification_status "Pending, Verified"
    }

    %% Appointments & Scheduling
    patients ||--o{ appointments : "books"
    professionals ||--o{ appointments : "conducts"
    clinic_doctors ||--o{ appointments : "conducts"
    appointments ||--o| consultations : "produces"
    appointments {
        uuid appointment_id PK
        uuid patient_id FK
        uuid professional_id FK "Nullable"
        uuid clinic_doctor_id FK "Nullable"
        timestamp appointment_time
        enum status "Scheduled, InProgress, Completed, Cancelled"
        enum appointment_type "Virtual, In-Person"
        varchar consultation_link "Video call URL"
        varchar appointment_code "APT-9847"
        text patient_notes "Reason for visit"
        timestamp scheduled_at
        timestamp completed_at
        integer duration_minutes
    }

    professionals ||--o{ availability_slots : "defines"
    availability_slots {
        uuid slot_id PK
        uuid professional_id FK
        timestamp start_time
        timestamp end_time
        boolean is_booked
        date slot_date
    }

    %% Consultations & Care
    consultations ||--o{ prescriptions : "includes"
    consultations {
        uuid consultation_id PK
        uuid appointment_id FK
        text clinical_notes
        text diagnosis
        text ai_briefing "AI-generated summary"
        text doctor_recommendations
        text follow_up_instructions
        timestamp created_at
        boolean prescription_attached
    }

    prescriptions {
        uuid prescription_id PK
        uuid consultation_id FK
        varchar prescription_code "DRX-2034"
        varchar medication_name "Amoxicillin, Paracetamol"
        varchar dosage "500mg, 650mg, 1 tab"
        varchar frequency "3 times a day, As needed"
        varchar duration "5 days, 7 days"
        text instructions "After meals, For fever/pain"
        enum medication_category "Antibiotic, Analgesic"
        text doctor_notes "Complete full course, Take with water"
        date prescribed_date "09 Nov 2025"
        boolean is_active
        uuid prescribed_by_doctor_id FK
        varchar doctor_name "Dr. Lorem Ipsum"
        varchar doctor_specialty "MD, General Physician"
        varchar clinic_name "Lorem Clinic, Delhi"
        text important_notes "Complete the full course of antibiotics, Take medicines as per prescribed schedule, Contact doctor if symptoms persist or worsen"
    }

    %% Prescription List & Management
    patients ||--o{ prescription_list : "views"
    prescription_list {
        uuid list_id PK
        uuid patient_id FK
        uuid prescription_id FK
        varchar condition_treated "Fever & Throat Infection"
        integer medicines_count "3 medicines"
        date next_followup "16 Nov 2025"
        enum prescription_status "Active, Completed, Expired"
        timestamp last_viewed
    }

    %% Medicine Reminders & Adherence
    patients ||--o{ medicine_reminders : "sets"
    prescriptions ||--o{ medicine_reminders : "linked_to"
    medicine_reminders {
        uuid reminder_id PK
        uuid patient_id FK
        uuid prescription_id FK "Nullable"
        varchar medication_name "Paracetamol 500mg, Amoxicillin 250mg"
        enum dosage_form "1 tablet, 1 capsule"
        text timing_schedule "Morning 8:00 AM, Afternoon 2:00 PM, Night 8:00 PM"
        enum how_to_take "After food, Before food, After breakfast"
        varchar duration "5 days (Nov 10 - Nov 15), 7 days (Nov 10 - Nov 17)"
        text doctor_note "Take with plenty of water, Complete full course"
        date start_date
        date end_date
        boolean is_active
        timestamp next_reminder_time
    }

    medicine_reminders ||--o{ reminder_logs : "tracks"
    reminder_logs {
        uuid log_id PK
        uuid reminder_id FK
        timestamp scheduled_time
        timestamp taken_time "Nullable"
        enum status "Pending, Taken, Missed, Snoozed"
        text notes
    }

    %% Health Records & Documents
    patients ||--o{ medical_records : "owns"
    medical_records {
        uuid record_id PK
        uuid patient_id FK
        varchar document_name "CBC Report - 09 Nov 2025"
        varchar document_url "Cloud storage link"
        enum document_type "Lab Report (CBC), Prescription, Radiology, Vaccination, Discharge, Doctor Notes, Other"
        text comments_notes "Normal, Slightly elevated creatinine, High cholesterol"
        uuid linked_appointment_id FK "Nullable"
        uuid uploaded_by_user_id FK
        enum uploaded_by_role "Self, Doctor"
        date report_date "Date test was conducted"
        timestamp uploaded_at
        varchar file_format "PDF, JPG, PNG"
        integer file_size_mb
    }

    %% Medical Vault Categories
    patients ||--o{ prescription_vault : "stores"
    prescription_vault {
        uuid vault_prescription_id PK
        uuid patient_id FK
        varchar document_url
        text metadata
        integer file_count "12 files"
    }

    patients ||--o{ lab_report_vault : "stores"
    lab_report_vault {
        uuid vault_lab_id PK
        uuid patient_id FK
        varchar document_url
        text metadata
        integer file_count "8 files"
    }

    patients ||--o{ radiology_vault : "stores"
    radiology_vault {
        uuid vault_radiology_id PK
        uuid patient_id FK
        varchar document_url
        text metadata
        integer file_count "5 files"
    }

    patients ||--o{ discharge_vault : "stores"
    discharge_vault {
        uuid vault_discharge_id PK
        uuid patient_id FK
        varchar document_url
        text metadata
        integer file_count "3 files"
    }

    patients ||--o{ vaccination_vault : "stores"
    vaccination_vault {
        uuid vault_vaccination_id PK
        uuid patient_id FK
        varchar document_url
        text metadata
        integer file_count "15 files"
    }

    patients ||--o{ doctor_notes_vault : "stores"
    doctor_notes_vault {
        uuid vault_notes_id PK
        uuid patient_id FK
        varchar document_url
        text metadata
        integer file_count "7 files"
    }

    patients ||--o{ other_documents_vault : "stores"
    other_documents_vault {
        uuid vault_other_id PK
        uuid patient_id FK
        varchar document_url
        text metadata
        integer file_count "4 files"
    }

    %% Upload Report Requests
    patients ||--o{ upload_report_requests : "receives"
    professionals ||--o{ upload_report_requests : "sends"
    upload_report_requests {
        uuid request_id PK
        uuid patient_id FK
        uuid professional_id FK
        varchar request_code "PRX-2025-1109-01"
        date prescription_date
        text requested_tests "CBC, BMP, X-ray"
        date due_date
        enum status "Pending, Submitted, Reviewed"
        text additional_notes
        timestamp created_at
    }

    upload_report_requests ||--o{ uploaded_test_reports : "fulfills"
    uploaded_test_reports {
        uuid upload_id PK
        uuid request_id FK
        enum test_type "CBC, BMP, X-ray"
        varchar document_url
        timestamp uploaded_at
        enum upload_method "File, Camera"
    }

    %% Hyperlocal Discovery with Advanced Search
    clinics ||--o{ clinic_doctors : "employs"
    clinics {
        uuid clinic_id PK
        varchar name "ABC Hospital, XYZ Clinic"
        text address "123 Lorem Street, Connaught Place"
        decimal latitude
        decimal longitude
        varchar phone_number
        enum clinic_type "Clinic, Hospital"
        text facilities "Emergency, Lab, Pharmacy"
        text operating_hours
        decimal average_rating
        integer total_reviews
        varchar city "New Delhi"
        varchar area "Connaught Place, Dwarka"
        varchar pincode "110078"
    }

    clinic_doctors {
        uuid clinic_doctor_id PK
        uuid clinic_id FK
        varchar full_name "Dr. Lorem Ipsum"
        varchar specialty "Cardiologist, Dermatologist, Psychiatrist"
        decimal consultation_fee
        text qualifications "MBBS, MD"
        text available_days "Mon-Fri"
        text available_hours "9:00 AM - 5:00 PM"
        decimal rating "4.7, 4.2, 3.9, 3.8"
        integer review_count
        text languages "English, Hindi"
        decimal distance_km "1.6 km, 2.2 km, 5.6 km, 7.1 km"
        varchar hospital_affiliation "ABC Hospital, XYZ Hospital"
        boolean is_volunteer
        boolean available_today
        boolean available_tomorrow
        boolean available_this_week
    }

    %% Search & Filter Configuration
    patients ||--o{ search_history : "performs"
    search_history {
        uuid search_id PK
        uuid patient_id FK
        varchar search_query "Psychiatrist Doctor, Dermatologist Near Me"
        text search_filters "Distance, Specialization, Rating"
        timestamp searched_at
        varchar location_searched "New Delhi, India"
        integer results_count
    }

    %% Location Management
    patients ||--o{ saved_locations : "saves"
    saved_locations {
        uuid location_id PK
        uuid patient_id FK
        varchar location_name "Home, Office"
        text full_address "123, Block A, Sector 14, Dwarka, New Delhi - 110078"
        decimal latitude
        decimal longitude
        boolean is_current_location
        boolean is_default
        timestamp added_at
    }

    %% Communication & Messaging
    patients ||--o{ patient_doctor_conversations : "participates_in"
    professionals ||--o{ professional_conversations : "participates_in"
    patient_doctor_conversations {
        uuid conversation_id PK
        uuid patient_id FK
        uuid professional_id FK
        uuid appointment_id FK "Nullable"
        timestamp last_message_at
        boolean is_active
        enum conversation_type "Appointment, Follow-up, Query"
    }

    professional_conversations {
        uuid conversation_id PK
        uuid professional_id FK
        uuid patient_id FK
        uuid appointment_id FK "Nullable"
        timestamp last_message_at
        boolean is_active
    }

    patient_doctor_conversations ||--o{ messages : "contains"
    professional_conversations ||--o{ messages : "contains"
    messages {
        uuid message_id PK
        uuid conversation_id FK
        uuid sender_user_id FK
        enum sender_type "Patient, Doctor, System"
        text message_content
        enum message_type "Text, Prescription, Report, JoinCall, Submitted"
        varchar attachment_url "Nullable"
        timestamp sent_at
        boolean is_read
        timestamp read_at
    }

    %% AI Chat & Assistance
    patients ||--o{ ai_chat_sessions : "initiates"
    ai_chat_sessions {
        uuid session_id PK
        uuid patient_id FK
        timestamp started_at
        timestamp ended_at
        enum session_type "Health Query, Mental Wellness, Triage, Crisis"
        text session_summary
        boolean escalated_to_professional
        boolean crisis_detected
        enum crisis_type "Suicidal, Self-harm, Severe distress"
    }

    ai_chat_sessions ||--o{ ai_chat_logs : "contains"
    ai_chat_logs {
        uuid log_id PK
        uuid session_id FK
        uuid user_id FK
        text message_content
        enum sender "User, AI"
        timestamp timestamp
        text ai_agent_type "Orchestrator, Mental Wellness, Health Inquiry"
        json ai_metadata "Confidence, sources, etc"
        text media_attachments "Image URLs, document URLs"
        enum media_type "Image, Document, None"
    }

    %% AI Crisis Management
    ai_chat_sessions ||--o| crisis_interventions : "triggers"
    crisis_interventions {
        uuid intervention_id PK
        uuid session_id FK
        uuid patient_id FK
        enum crisis_level "Critical, High, Moderate"
        text crisis_keywords "Suicidal thoughts, self-harm"
        timestamp detected_at
        text helpline_provided "102, Crisis counsellor numbers"
        enum action_taken "Helpline shown, Counsellor connected, Urgent appointment"
        boolean patient_acknowledged
        text follow_up_notes
    }

    %% Reviews & Feedback
    patients ||--o{ reviews : "writes"
    reviews {
        uuid review_id PK
        uuid patient_id FK
        enum target_type "Appointment, Clinic_Doctor, Professional"
        uuid target_id "Polymorphic FK"
        integer rating "1-5"
        text comment
        text appreciated_aspects "Friendly, Explained well, Quick response"
        text feedback_suggestions
        timestamp created_at
        boolean is_verified_visit
    }

    %% Notifications
    users ||--o{ notifications : "receives"
    notifications {
        uuid notification_id PK
        uuid user_id FK
        enum notification_type "Appointment, Medicine, Prescription, Report, Article, AppUpdate"
        varchar title "Appointment starting soon, Medicine Reminder"
        text message "Your appointment with Dr. Riya Patel starts in 30"
        enum priority "Urgent, Normal, Low"
        timestamp scheduled_time
        timestamp sent_at
        boolean is_read
        json action_data "Deep link info, IDs"
        varchar icon "video icon, pill icon, etc"
    }

    %% Notification Settings
    users ||--|| notification_settings : "configures"
    notification_settings {
        uuid settings_id PK
        uuid user_id FK
        boolean all_notifications_enabled
        boolean appointment_alerts
        boolean incoming_calls
        boolean incoming_video_calls
        boolean medical_reminders
        boolean vibration_alerts
        timestamp updated_at
    }

    %% Account & Settings
    users ||--|| account_settings : "has"
    account_settings {
        uuid settings_id PK
        uuid user_id FK
        varchar preferred_language "English, Hindi"
        boolean dark_mode
        enum notification_preference "All, Important, None"
        boolean biometric_enabled
        timestamp last_password_change
    }

    %% Wellness & Health Education
    health_articles {
        uuid article_id PK
        varchar title "Mindfulness in 5 Minutes, Yoga for Stress Relief"
        text content
        enum content_type "Article, Video"
        enum category "Mental Wellness, Health Awareness, Mindfulness, Exercise, Sleep"
        varchar author "Dr. Meera Sharma"
        date published_date
        varchar thumbnail_url
        varchar video_url "For video content"
        integer duration_minutes "5 min, 12 min"
        integer view_count
        text tags "#MentalHealth, #Mindfulness, #BreathingExercises"
        boolean verified_content
        integer read_time_minutes "5 min read, 6 min read"
    }

    patients ||--o{ article_reads : "reads"
    article_reads {
        uuid read_id PK
        uuid patient_id FK
        uuid article_id FK
        timestamp read_at
        integer time_spent_seconds
        boolean completed
        boolean saved_to_library
    }

    patients ||--o{ wellness_library : "saves"
    wellness_library {
        uuid library_id PK
        uuid patient_id FK
        uuid article_id FK
        timestamp saved_at
        text personal_notes
    }

    patients ||--o{ wellness_thoughts : "shares"
    wellness_thoughts {
        uuid thought_id PK
        uuid patient_id FK
        uuid article_id FK
        text comment
        timestamp posted_at
        boolean is_anonymous
    }
```

---

# 🏥 Clinico Platform — Database Schema Architecture

## 📘 Overview

This database schema is designed as a **robust, scalable foundation** for the Clinico Telehealth Platform.  
It supports patient care, professional collaboration, and AI-assisted health management.

### 🧩 Core Principles

- **Centralized User Identity:**  
  A single `users` table handles authentication, with role-specific tables (`patients`, `professionals`, `ngo_users`) storing profile data.

- **Transactional Core:**  
  The `appointments`, `consultations`, and `prescriptions` tables form the heart of the system, tracking every step of the care journey.

- **Patient-Centric Data:**  
  Health records, medication reminders, and wellness tracking all link directly to each patient.

- **Detailed Logging & Auditing:**  
  Logs such as `reminder_logs`, `ai_chat_logs`, and `notifications` provide full visibility into user activity and system events.

---

## 1️⃣ Core User & Authentication

### `users`
**Purpose:** Master table for all user accounts and authentication.

**Attributes:**
- `user_id` – Unique identifier  
- `email`, `phone_number` – Unique login credentials  
- `password_hash` – Securely stored password  
- `full_name` – User’s name  
- `role` – Defines user type (`Patient`, `Professional`, `NGO`)  
- `last_sync` – Last data sync timestamp  
- `verified_user` – Verification status  

**Relationships:**
- One-to-one with `patients`, `professionals`, or `ngo_users`

---

### `patients`
**Purpose:** Stores personal and medical data for patient users.

**Attributes:**
- `user_id (FK)`  
- `date_of_birth`, `gender`, `marital_status`  
- `address`, `current_location`, `current_full_address`  
- `blood_group`, `known_allergies`, `chronic_conditions`, `current_medications`, `lifestyle_notes`  
- `patient_code` – e.g., `PT-2025-1847`  
- `member_since`

**Relationships:**
- One-to-one with `users`
- Central hub for appointments, records, and reminders

---

### `professionals`
**Purpose:** Contains verified information about healthcare providers.

**Attributes:**
- `specialty`, `credentials`, `years_of_experience`  
- `verification_status` – (`Pending`, `Verified`)  
- `rating`, `total_reviews`, `patients_treated`  
- `languages_spoken`, `working_hours`  
- `is_volunteer`

---

### `ngo_users`
**Purpose:** Stores data for NGO representatives and partner organizations.

---

## 2️⃣ Appointments & Scheduling

### `appointments`
**Purpose:** Central record for all scheduled sessions.

**Attributes:**
- `professional_id (FK)` / `clinic_doctor_id (FK)`  
- `status` – (`Scheduled`, `InProgress`, `Completed`, `Cancelled`)  
- `appointment_code`, `patient_notes`  
- `scheduled_at`, `completed_at`, `duration_minutes`

---

### `availability_slots`
**Purpose:** Defines professional availability for virtual consultations.

**Attributes:**
- `start_time`, `end_time`  
- `is_booked` – Prevents double-booking

---

## 3️⃣ Consultations, Prescriptions & Care

### `consultations`
**Purpose:** Stores medical details from completed appointments.

**Attributes:**
- `clinical_notes`, `diagnosis`  
- `ai_briefing` – AI-generated summary  
- `doctor_recommendations`, `follow_up_instructions`

**Relationships:**
- One-to-one with a completed `appointments` record

---

### `prescriptions`
**Purpose:** Structured record of each prescribed medication.

**Attributes:**
- `medication_name`, `dosage`, `frequency`, `duration`, `instructions`  
- `medication_category` – e.g., `Antibiotic`  
- `doctor_name`, `clinic_name` (denormalized fields)  
- `important_notes`

---

### `prescription_list`
**Purpose:** Header or grouping record for a prescription event.

**Attributes:**
- `condition_treated`, `medicines_count`, `next_followup`  
- `prescription_status`

---

## 4️⃣ Medicine Reminders & Adherence

### `medicine_reminders`
**Purpose:** Defines a patient’s medicine intake schedule.

**Attributes:**
- `timing_schedule`, `how_to_take`, `duration`, `start_date`, `end_date`

---

### `reminder_logs`
**Purpose:** Logs reminder notifications and adherence tracking.

**Attributes:**
- `scheduled_time`, `taken_time`  
- `status` – (`Pending`, `Taken`, `Missed`, `Snoozed`)

**Relationships:**
- Many-to-one with `medicine_reminders`

---

## 5️⃣ Health Records, Documents & Requests

### `medical_records`
**Purpose:** Central repository for uploaded medical documents.

**Attributes:**
- `document_type` – (`Lab Report`, `Prescription`, `Vaccination`, etc.)  
- `linked_appointment_id` (optional)  
- `uploaded_by_user_id`, `uploaded_by_role`

---

### Medical Vault Tables (`prescription_vault`, `lab_report_vault`, etc.)
**Purpose:** Optimized summary tables for quick document category counts.

---

### `upload_report_requests` & `uploaded_test_reports`
**Purpose:** Workflow for requesting and submitting test reports.

**Flow:**
1. Doctor creates a `upload_report_requests` record.  
2. Patient uploads linked `uploaded_test_reports`.  
3. Request status updates from `Pending` → `Submitted`.

---

## 6️⃣ Hyperlocal Discovery & Search

### `clinics` & `clinic_doctors`
**Purpose:** External clinic and doctor directory.

**Attributes:**
- Location: `latitude`, `longitude`, `city`, `area`, `pincode`  
- `consultation_fee`, `available_days`, `rating`, `facilities`

---

### `search_history` & `saved_locations`
**Purpose:** Stores past searches and favorite patient locations.

---

## 7️⃣ Communication & Messaging

### `patient_doctor_conversations` & `messages`
**Purpose:** Core chat system between patients and doctors.

**Attributes (messages):**
- `sender_type` – (`Patient`, `Doctor`, `System`)  
- `message_type` – (`Text`, `Prescription`, `JoinCall`, etc.)  

**Structure:**  
One conversation channel (`patient_doctor_conversations`) → Many `messages`.

---

## 8️⃣ AI Chat & Assistance

### `ai_chat_sessions` & `ai_chat_logs`
**Purpose:** Stores interactions with AI health assistant.

**Attributes (sessions):**
- `session_type`, `session_summary`  
- `escalated_to_professional`, `crisis_detected`

---

### `crisis_interventions`
**Purpose:** Logs critical mental health detection events.

**Attributes:**
- `crisis_keywords`, `helpline_provided`, `acknowledged_by_user`

---

## 9️⃣ Reviews, Notifications & Settings

### `reviews`
**Purpose:** Captures patient feedback for doctors or clinics.

**Attributes:**
- `target_type`, `target_id` (polymorphic)  
- `appreciated_aspects` – (`Friendly`, `Good Listener`, etc.)

---

### `notifications` & `notification_settings`
**Purpose:** Manages alerts and user preferences for communication.

---

### `account_settings`
**Purpose:** Stores UI and general preferences such as:
- `dark_mode`, `preferred_language`, `biometric_enabled`

---

## 🔟 Wellness & Health Education

### `health_articles`
**Purpose:** CMS for educational and awareness content.

**Attributes:**
- `title`, `category`, `author`, `thumbnail_url`, `duration_minutes`, `tags`

---

### `article_reads`, `wellness_library`, `wellness_thoughts`
**Purpose:** Track engagement and user activity.

| Table | Function |
|--------|-----------|
| `article_reads` | Tracks article views |
| `wellness_library` | Manages saved articles |
| `wellness_thoughts` | Enables commenting |

---

## 🧱 Summary Diagram (Conceptual)

```
[users]
 ├── [patients]
 │     ├── [appointments] → [consultations] → [prescriptions]
 │     ├── [medical_records]
 │     ├── [medicine_reminders] → [reminder_logs]
 │     └── [reviews]
 ├── [professionals]
 │     ├── [availability_slots]
 │     └── [appointments]
 ├── [ai_chat_sessions] → [ai_chat_logs]
 ├── [notifications] → [notification_settings]
 └── [health_articles] → [article_reads] / [wellness_library]
```

---

## 🧠 Design Highlights

- **Fully normalized** for flexibility and analytics  
- **Role-based expansion** through one-to-one relationships  
- **Event-driven logging** for audits and user engagement tracking  
- **Hybrid scheduling model** supports both virtual & clinic-based consultations  
- **AI & human care synergy** through integrated chat and escalation flow  

---

© 2025 Clinico — *Healthcare Simplified.*
