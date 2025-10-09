# Clinico Platform: Data Dictionary Documentation

**Version:** 1.0.0

Welcome to the Clinico Data Dictionary. This document provides a detailed explanation of the database schema, designed to help frontend developers understand the structure of the data they will be sending to and receiving from the API.

---

## **Core Principle: Normalization**

Our database is "normalized," which means data is split into multiple tables to avoid duplication. For example, when you fetch an `Appointment`, it won't contain the full doctor's profile. Instead, it will contain a `professionalId`. Your application will then need to use this ID to fetch the full details for that professional from the `/professionals/:id` endpoint if needed. This keeps our API responses lean and fast.

---

## **Table-by-Table Breakdown**

### 1. `Users`
This is the central table for anyone who can log in. Every Patient, Professional, and NGO has a corresponding entry here.

| Column | Data Type | Description & Possible Values | Example |
| :--- | :--- | :--- | :--- |
| `user_id` | Integer | **Primary Key.** The unique identifier for every user. | `101` |
| `email` | String | **Unique.** The user's login email. Must be a valid email format. | `"abhay.raj@example.com"` |
| `password_hash` | String | **(Backend Only)** Never sent to the frontend. | |
| `full_name` | String | The user's full name. | `"Abhay Raj"` |
| `phone_number`| String | The user's contact phone number. | `"9876543210"` |
| `role` | Enum (String) | Defines the user's role and permissions. **Crucial for UI logic.**<br>- `"Patient"`<br>- `"Professional"`<br>- `"NGO"`<br>- `"Admin"` | `"Patient"` |
| `created_at` | DateTime | Timestamp of when the account was created (ISO 8601 format). | `"2025-10-26T10:00:00Z"` |

---

### 2. `Patients`
Stores extra information for users with the `Patient` role. Linked one-to-one with the `Users` table.

| Column | Data Type | Description & Possible Values | Example |
| :--- | :--- | :--- | :--- |
| `patient_id` | Integer | **Primary Key.** | `201` |
| `user_id` | Integer | **Foreign Key.** Links to `Users.user_id`. | `101` |
| `date_of_birth`| Date | The patient's date of birth. Format: `YYYY-MM-DD`. | `"2000-01-15"` |
| `gender` | String | The patient's self-identified gender. | `"Male"` |
| `address` | String | The patient's physical address. | `"123 Health St, New Delhi"` |

---

### 3. `Professionals`
Stores extra information for users with the `Professional` role.

| Column | Data Type | Description & Possible Values | Example |
| :--- | :--- | :--- | :--- |
| `professional_id`| Integer | **Primary Key.** | `301` |
| `user_id` | Integer | **Foreign Key.** Links to `Users.user_id`. | `102` |
| `specialty` | String | The doctor's area of expertise. | `"Psychiatrist"` |
| `credentials` | String | Doctor's qualifications and license info. | `"MD, MBBS, License #12345"` |
| `years_of_experience`| Integer | Number of years in practice. | `8` |
| `verification_status`| Enum (String) | The admin verification status. The UI should only show verified doctors to patients.<br>- `"Pending"`<br>- `"Verified"`<br>- `"Rejected"` | `"Verified"` |

---

### 4. `Appointments`
The core transactional table, linking patients to care providers.

| Column | Data Type | Description & Possible Values | Example |
| :--- | :--- | :--- | :--- |
| `appointment_id` | Integer | **Primary Key.** | `401` |
| `patient_id` | Integer | **Foreign Key.** Links to `Patients.patient_id`. | `201` |
| `professional_id`| Integer | **(Nullable) Foreign Key.** Links to `Professionals.professional_id`. Used for **virtual** appointments. | `301` |
| `clinic_doctor_id`| Integer | **(Nullable) Foreign Key.** Links to `Clinic_Doctors.clinic_doctor_id`. Used for **in-person** appointments. | `null` |
| `appointment_time`| DateTime | The scheduled start time of the appointment (ISO 8601). | `"2025-11-15T14:00:00Z"` |
| `status` | Enum (String) | The current state of the appointment. **Drives UI state.**<br>- `"Scheduled"`<br>- `"Completed"`<br>- `"Cancelled"` | `"Scheduled"` |
| `appointment_type`| Enum (String) | Distinguishes between the two types of care.<br>- `"Virtual"`<br>- `"In-Person"` | `"Virtual"` |
| `consultation_link`| String | **(Nullable)** A unique URL for the video call, generated upon booking a virtual appointment. | `"https://meet.clinico.app/xyz-abc-123"` |

---

### 5. `Consultations`
Stores the output of a completed appointment.

| Column | Data Type | Description & Possible Values | Example |
| :--- | :--- | :--- | :--- |
| `consultation_id`| Integer | **Primary Key.** | `501` |
| `appointment_id` | Integer | **Foreign Key.** Links to `Appointments.appointment_id`. | `401` |
| `notes` | String (Text) | The detailed clinical notes written by the doctor. | `"Patient reports symptoms of mild anxiety..."` |
| `ai_briefing` | String (Text) | The AI-generated summary of the patient's chat history, provided to the doctor before the call. | `"Summary: Patient mentioned stress..."` |

---

### 6. `Prescriptions`
Stores medications prescribed during a consultation. A single consultation can have multiple prescriptions.

| Column | Data Type | Description & Possible Values | Example |
| :--- | :--- | :--- | :--- |
| `prescription_id`| Integer | **Primary Key.** | `601` |
| `consultation_id`| Integer | **Foreign Key.** Links to `Consultations.consultation_id`. | `501` |
| `medication_name`| String | The name of the medication. | `"Paracetamol"` |
| `dosage` | String | The dosage instructions. | `"500mg"` |
| `instructions` | String (Text) | How the patient should take the medication. | `"Take one tablet every 6 hours as needed for fever."` |

---

### 7. `Clinics` & `Clinic_Doctors`
Powers the hyperlocal discovery map. These are separate from the platform's volunteer `Professionals`.

#### `Clinics`
| Column | Data Type | Description & Possible Values | Example |
| :--- | :--- | :--- | :--- |
| `clinic_id` | Integer | **Primary Key.** | `701` |
| `name` | String | The name of the clinic or hospital. | `"City General Hospital"` |
| `address` | String | The full address of the location. | `"456 Wellness Ave, New Delhi"` |
| `latitude` | Decimal | GPS coordinate for map pin placement. | `28.6145` |
| `longitude` | Decimal | GPS coordinate for map pin placement. | `77.2105` |
| `type` | Enum (String)| Distinguishes between location types.<br>- `"Clinic"`<br>- `"Hospital"` | `"Hospital"` |

#### `Clinic_Doctors`
| Column | Data Type | Description & Possible Values | Example |
| :--- | :--- | :--- | :--- |
| `clinic_doctor_id`| Integer | **Primary Key.** | `801` |
| `clinic_id` | Integer | **Foreign Key.** Links to `Clinics.clinic_id`. | `701` |
| `full_name` | String | The doctor's name. | `"Dr. Alok Ranjan"` |
| `specialty` | String | The doctor's specialty. | `"Cardiologist"` |
| `consultation_fee`| Decimal | The fee for an in-person visit. | `800.00` |

---

### 8. `AI_Chat_Logs`
Stores the conversation history for the AI Care Companion.

| Column | Data Type | Description & Possible Values | Example |
| :--- | :--- | :--- | :--- |
| `log_id` | Integer | **Primary Key.** | `901` |
| `user_id` | Integer | **Foreign Key.** Links to `Users.user_id`. | `101` |
| `message_content`| String (Text) | The text of the message sent. | `"I have a sore throat"` |
| `sender` | Enum (String)| Who sent the message. **Used to align chat bubbles.**<br>- `"User"`<br>- `"AI"` | `"User"` |
| `timestamp` | DateTime | When the message was sent (ISO 8601). | `"2025-10-26T11:30:00Z"` |