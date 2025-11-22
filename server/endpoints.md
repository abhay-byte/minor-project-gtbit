## 1\. Professional Portal (Doctor Management)

The provided documentation lists public professional search but lacks the private endpoints for doctors to manage their practice.

### `GET /api/professionals/me/dashboard`

Fetches the aggregated statistics for the logged-in professional's dashboard.

  * **Tables:** `professionals`, `appointments`, `reviews`
  * **Response:**
    ```json
    {
      "rating": 4.85,
      "total_reviews": 150,
      "patients_treated": 1200,
      "verification_status": "Verified",
      "is_volunteer": true,
      "appointments_today_count": 8,
      "pending_reports_count": 3
    }
    ```

### `POST /api/availability/batch`

Allows the doctor to generate recurring availability slots (e.g., "Every Monday 9-5").

  * **Tables:** `availability_slots`
  * **Request Body:**
    ```json
    {
      "days_of_week": ["Monday", "Wednesday"],
      "start_time": "09:00:00",
      "end_time": "17:00:00",
      "slot_duration_minutes": 30
    }
    ```
  * **Response:**
    ```json
    {
      "message": "Slots generated successfully",
      "slots_created": 48
    }
    ```

### `POST /api/appointments/:id/cancel`

Allows a doctor (or patient) to cancel an appointment and free up the slot.

  * **Tables:** `appointments`, `availability_slots`
  * **Request Body:**
    ```json
    {
      "reason": "Emergency surgery required"
    }
    ```
  * **Response:**
    ```json
    {
      "appointment_id": 102,
      "status": "Cancelled",
      "slot_released": true
    }
    ```

-----

## 2\. Consultation Workflow (Active Call)

The provided documentation has appointment booking but lacks the endpoints for **conducting** the consultation (saving notes, diagnosis, etc.).

### `GET /api/patients/:id/medical-profile`

Used by the doctor to view the patient's history inside the consultation room.

  * **Tables:** `patients`, `medical_records`, `prescriptions`
  * **Response:**
    ```json
    {
      "patient_id": 55,
      "blood_group": "O+",
      "chronic_conditions": "Hypertension, Asthma",
      "known_allergies": "Penicillin",
      "current_medications": "Aspirin 75mg",
      "lifestyle_notes": "Sedentary, Non-smoker",
      "past_records": [
        {
           "record_id_uuid": "uuid-string",
           "document_type": "Lab Report",
           "document_url": "https://...",
           "report_date": "2025-10-01"
        }
      ]
    }
    ```

### `POST /api/consultations`

Saves the clinical outcome of an appointment.

  * **Tables:** `consultations`, `appointments`
  * **Request Body:**
    ```json
    {
      "appointment_id": 102,
      "diagnosis": "Acute Bronchitis",
      "doctor_recommendations": "Steam inhalation, rest.",
      "follow_up_instructions": "Visit again if fever persists > 3 days.",
      "notes": "Patient presented with dry cough."
    }
    ```
  * **Response:**
    ```json
    {
      "consultation_id_uuid": "uuid-string",
      "created_at": "2025-11-19T10:30:00Z"
    }
    ```

### `POST /api/prescriptions` (Doctor Issue)

Allows the doctor to issue a new prescription (different from the patient `GET` view).

  * **Tables:** `prescriptions`
  * **Request Body:**
    ```json
    {
      "consultation_id": 205,
      "medication_name": "Azithromycin",
      "dosage": "500mg",
      "frequency": "Once daily before food",
      "duration": "5 days",
      "medication_category": "Antibiotic",
      "doctor_notes": "Complete the full course",
      "important_notes": "May cause slight drowsiness"
    }
    ```
  * **Response:**
    ```json
    {
      "prescription_id_uuid": "uuid-string",
      "is_active": true
    }
    ```

### `POST /api/upload-report-requests`

Allows the doctor to request a specific lab test from the patient.

  * **Tables:** `upload_report_requests`
  * **Request Body:**
    ```json
    {
      "patient_id": 55,
      "requested_tests": "CBC, Lipid Profile, HbA1c",
      "due_date": "2025-11-25",
      "additional_notes": "Fasting required"
    }
    ```
  * **Response:**
    ```json
    {
      "request_id": "uuid-string",
      "request_code": "REQ-2025-889",
      "status": "Pending"
    }
    ```

-----

## 3\. Chat & Messaging System

The provided documentation does not include any chat functionality.

### `GET /api/conversations`

Fetches the list of active conversations for the user (Patient or Doctor).

  * **Tables:** `patient_doctor_conversations` (or `professional_conversations`)
  * **Response:**
    ```json
    [
      {
        "conversation_id": "uuid-string",
        "other_user_name": "Dr. Sharma",
        "last_message_at": "2025-11-19T09:15:00Z",
        "is_active": true,
        "conversation_type": "Appointment"
      }
    ]
    ```

### `GET /api/conversations/:id/messages`

Fetches the message history for a specific thread.

  * **Tables:** `messages`
  * **Response:**
    ```json
    [
      {
        "message_id": "uuid-string",
        "sender_type": "Doctor",
        "message_content": "Please share your previous report.",
        "message_type": "Text",
        "attachment_url": null,
        "sent_at": "2025-11-19T09:10:00Z",
        "is_read": true
      }
    ]
    ```

### `POST /api/conversations/:id/messages`

Sends a new message.

  * **Tables:** `messages`, `patient_doctor_conversations`
  * **Request Body:**
    ```json
    {
      "message_content": "Here is the report you asked for.",
      "message_type": "Text" // or "Report"
    }
    ```
  * **Response:**
    ```json
    {
      "message_id": "uuid-string",
      "sent_at": "2025-11-19T09:12:00Z"
    }
    ```

-----

## 4\. AI Care Companion

The provided documentation does not include the AI Agent endpoints.

### `POST /v1/agent/orchestrate`

The central endpoint for the AI triage and health assistant.

  * **Tables:** `ai_chat_logs`, `ai_chat_sessions`, `crisis_interventions`
  * **Request Body:**
    ```json
    {
      "query": "I have a sharp pain in my left chest.",
      "session_id": "optional-uuid-string",
      "image_url": "optional-string"
    }
    ```
  * **Response:**
    ```json
    {
      "reply": "This could be serious. Are you experiencing shortness of breath?",
      "action": "triage_escalation",
      "session_id": "uuid-string",
      "crisis_detected": true
    }
    ```

### `GET /api/ai/sessions`

Retrieves history of AI conversations.

  * **Tables:** `ai_chat_sessions`
  * **Response:**
    ```json
    [
      {
        "session_id": "uuid-string",
        "started_at": "2025-11-18T14:00:00Z",
        "session_summary": "User asked about migraine relief.",
        "session_type": "Health Query"
      }
    ]
    ```

-----

## 5\. WebRTC Signaling (Video Calls)

Endpoints required to set up the video room.

### `POST /api/signaling/room`

Generates a meeting room when an appointment is about to start.

  * **Tables:** `appointments` (Updates `consultation_link`)
  * **Request Body:**
    ```json
    {
      "appointment_id": 102
    }
    ```
  * **Response:**
    ```json
    {
      "room_id": "uuid-room-id",
      "consultation_link": "https://clinico.com/room/uuid-room-id"
    }
    ```

### `GET /api/signaling/validate/:roomId`

Validates if the user is allowed to join the video call.

  * **Tables:** `appointments`
  * **Response:**
    ```json
    {
      "is_valid": true,
      "role": "Patient",
      "identity_name": "Abhay Raj"
    }
    ```

-----

## 6\. Miscellaneous Missing Functionality

### `POST /api/reminders/:id/log`

Used by the patient to mark a specific medicine reminder as "Taken".

  * **Tables:** `reminder_logs`
  * **Request Body:**
    ```json
    {
      "status": "Taken", // Enum: 'Taken', 'Missed', 'Snoozed'
      "taken_time": "2025-11-19T08:05:00Z",
      "notes": "Taken with water"
    }
    ```
  * **Response:**
    ```json
    {
      "log_id": "uuid-string",
      "status": "Taken"
    }
    ```

### `GET /api/notifications`

Fetches in-app notifications.

  * **Tables:** `notifications`
  * **Response:**
    ```json
    [
      {
        "notification_id": "uuid-string",
        "title": "Appointment Reminder",
        "message": "Your appointment is in 15 minutes.",
        "notification_type": "Appointment",
        "is_read": false,
        "sent_at": "2025-11-19T09:45:00Z"
      }
    ]
    ```