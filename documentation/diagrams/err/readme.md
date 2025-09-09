### **Overview of the Clinico Database Schema**

This ER diagram outlines the complete data structure for the Clinico platform. The design is centered around a flexible **core user model**, a powerful **hybrid appointment system**, and distinct modules for handling patient data, hyperlocal discovery, and user interactions.

![alt text](https://raw.githubusercontent.com/abhay-byte/minor-project-gtbit/main/documentation/diagrams/err/er.svg)

---

### **Entity & Attribute Breakdown**

The database is composed of several key entities, grouped by their function.

#### **1. Core User & Role Management**

This group of entities handles the identity and specific roles of everyone using the platform.

*   **`users` (The Core Identity)**
    *   **Purpose:** This is the central table for all individuals who can log in. It stores the common, essential information.
    *   **Attributes:**
        *   `user_id (PK)`: A unique number that identifies each user in the system.
        *   `email (UK)`: The user's unique email, used for login and communication.
        *   `password_hash`: The user's password, stored securely as a hash, not in plain text.
        *   `full_name`: The user's full name.
        *   `phone_number`: The user's contact number.
        *   `role`: Defines what type of user this is (e.g., 'Patient', 'Professional', 'NGO'). This determines their permissions and which other tables they connect to.
        *   `created_at`: A timestamp of when the user account was created.
    *   **Relationships:**
        *   A single `users` record can be linked to **one** `patients` record, **one** `professionals` record, or **one** `ngo_users` record, depending on their role.

*   **`patients`**
    *   **Purpose:** Stores additional information specific only to users with the 'Patient' role.
    *   **Attributes:**
        *   `patient_id (PK)`: The unique identifier for the patient record.
        *   `user_id (FK)`: Links directly to the corresponding entry in the `users` table.
        *   `date_of_birth`, `gender`, `address`: Basic demographic and contact information.

*   **`professionals`**
    *   **Purpose:** Stores details for the volunteer healthcare professionals on the platform.
    *   **Attributes:**
        *   `professional_id (PK)`: The unique identifier for the professional record.
        *   `user_id (FK)`: Links to the corresponding entry in the `users` table.
        *   `specialty`, `credentials`, `years_of_experience`: Professional qualifications.
        *   `verification_status`: Tracks whether an admin has verified their credentials ('Pending', 'Verified').

*   **`ngo_users`**
    *   **Purpose:** Contains information for users associated with an NGO partner.
    *   **Attributes:**
        *   `ngo_user_id (PK)`: The unique ID for the NGO user.
        *   `user_id (FK)`: Links to the corresponding `users` record.
        *   `ngo_name`: The name of the organization they represent.
        *   `verification_status`: Tracks the status of the NGO partnership.

#### **2. The Appointment & Consultation Core**

This is the transactional heart of the system, managing all aspects of scheduling and care delivery.

*   **`appointments`**
    *   **Purpose:** The central table that records every scheduled meeting between a patient and a care provider. It's designed to be "hybrid."
    *   **Attributes:**
        *   `appointment_id (PK)`: A unique ID for each appointment.
        *   `patient_id (FK)`: Links to the `patients` table to identify who booked the appointment.
        *   `professional_id (FK)`: **(Nullable)** Links to the `professionals` table. This is filled for a **virtual telehealth** consultation.
        *   `clinic_doctor_id (FK)`: **(Nullable)** Links to the `clinic_doctors` table. This is filled for an **in-person** visit.
        *   `appointment_time`: The scheduled date and time.
        *   `status`: The current state of the appointment (e.g., 'Scheduled', 'Completed', 'Cancelled').
        *   `appointment_type`: Specifies whether the appointment is 'Virtual' or 'In-Person'.
        *   `consultation_link`: A URL for the video call, only for virtual appointments.
    *   **Relationships:**
        *   A `patients` record can have **many** `appointments`.
        *   It links to either a `professionals` record or a `clinic_doctors` record, but not both.
        *   A completed appointment can result in **one** `consultations` record.

*   **`availability_slots`**
    *   **Purpose:** Allows platform `professionals` to define when they are free for virtual consultations.
    *   **Attributes:**
        *   `slot_id (PK)`: A unique ID for each time slot.
        *   `professional_id (FK)`: Links to the professional who set this availability.
        *   `start_time`, `end_time`: Defines the duration of the available slot.
        *   `is_booked`: A boolean that is flipped to `true` when an `appointment` is scheduled in this slot.

*   **`consultations`**
    *   **Purpose:** Stores the details and notes from a completed appointment.
    *   **Attributes:**
        *   `consultation_id (PK)`: Unique ID for the consultation record.
        *   `appointment_id (FK)`: Links back to the specific `appointments` record.
        *   `notes`: The clinical notes written by the doctor during the session.
    *   **Relationships:**
        *   A consultation can have **many** `prescriptions`.

*   **`prescriptions`**
    *   **Purpose:** Stores details of medications prescribed during a consultation.
    *   **Attributes:**
        *   `prescription_id (PK)`: Unique ID for each prescribed item.
        *   `consultation_id (FK)`: Links to the `consultations` record where this was prescribed.
        *   `medication_name`, `dosage`, `instructions`: The details of the prescription.

#### **3. Patient-Specific Data**

*   **`medical_records`**
    *   **Purpose:** A digital vault for patients to upload and store their health documents.
    *   **Attributes:**
        *   `record_id (PK)`: A unique ID for each uploaded document.
        *   `patient_id (FK)`: Links to the `patients` record of the owner.
        *   `document_name`, `document_url` (link to cloud storage), `document_type`, `uploaded_at`.

#### **4. Hyperlocal Discovery System**

This group of entities powers the "Find a Doctor" map feature.

*   **`clinics`**
    *   **Purpose:** Stores information about physical healthcare locations (clinics, hospitals).
    *   **Attributes:**
        *   `clinic_id (PK)`: A unique ID for each physical location.
        *   `name`, `address`, `latitude`, `longitude`, `phone_number`, `type` ('Clinic' or 'Hospital').
    *   **Relationships:**
        *   A single `clinics` record can have **many** `clinic_doctors`.

*   **`clinic_doctors`**
    *   **Purpose:** Stores information about specific doctors who work at a physical `clinic`. This is distinct from the platform's volunteer `professionals`.
    *   **Attributes:**
        *   `clinic_doctor_id (PK)`: A unique ID for this doctor at this clinic.
        *   `clinic_id (FK)`: Links to the `clinics` table where they work.
        *   `full_name`, `specialty`, `consultation_fee`.

#### **5. Feedback & Interaction**

These entities store data generated from user interactions.

*   **`reviews`**
    *   **Purpose:** A flexible table to store patient feedback and ratings.
    *   **Attributes:**
        *   `review_id (PK)`: A unique ID for the review.
        *   `patient_id (FK)`: Links to the patient who wrote the review.
        *   `rating` (1-5), `comment`.
        *   `target_type` & `target_id`: **(Polymorphic Relationship)** These two fields work together. `target_type` could be 'Appointment' or 'Clinic_Doctor', and `target_id` would be the corresponding ID. This allows a single reviews table to handle feedback for different things.

*   **`ai_chat_logs`**
    *   **Purpose:** Stores the conversation history between a user and the AI Care Companion.
    *   **Attributes:**
        *   `log_id (PK)`: Unique ID for each message.
        *   `user_id (FK)`: Links to the `users` table.
        *   `message_content`: The text of the message.
        *   `sender`: Who sent the message ('User' or 'AI').
        *   `timestamp`: When the message was sent.