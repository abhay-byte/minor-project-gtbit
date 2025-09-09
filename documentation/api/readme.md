# Clinico API Documentation v1.0

**Base URL:** `https://api.clinico.app/v1`

Welcome to the comprehensive API documentation for the Clinico platform. This document outlines all available endpoints, required parameters, and expected response formats.

## **Authentication**

All endpoints listed below, except where noted, are protected and require a **JSON Web Token (JWT)**. The token must be included in the `Authorization` header.

**Header Format:** `Authorization: Bearer <YOUR_JWT_TOKEN>`

---

## 1. Authentication (`/auth`)

Handles user registration, login, and session management.

### `POST /auth/register`
*   **Description:** Registers a new user. Publicly accessible.
*   **Request Body:**
    ```json
    {
      "fullName": "Tejaswini Singh",
      "email": "tejaswini.s@example.com",
      "password": "Password@123",
      "phoneNumber": "9876543210",
      "role": "Patient" // Enum: "Patient", "Professional", "NGO"
    }
    ```
*   **Responses:**
    *   **`201 Created`**: Success.
        ```json
        {
          "message": "User registered successfully.",
          "user": { "userId": 1, "fullName": "Tejaswini Singh", "role": "Patient" },
          "token": "a.very.long.jwt.token"
        }
        ```
    *   **`400 Bad Request`**: Validation error (e.g., weak password, invalid email).
        ```json
        { "error": "Password must be at least 8 characters long and contain a number." }
        ```
    *   **`409 Conflict`**: Email or phone number already exists.
        ```json
        { "error": "An account with this email already exists." }
        ```

### `POST /auth/login`
*   **Description:** Authenticates an existing user. Publicly accessible.
*   **Request Body:**
    ```json
    {
      "email": "tejaswini.s@example.com",
      "password": "Password@123"
    }
    ```
*   **Responses:**
    *   **`200 OK`**: Success.
        ```json
        {
          "message": "Login successful.",
          "user": { "userId": 1, "fullName": "Tejaswini Singh", "role": "Patient" },
          "token": "a.very.long.jwt.token"
        }
        ```
    *   **`401 Unauthorized`**: Invalid email or password.
        ```json
        { "error": "Invalid credentials provided." }
        ```

---

## 2. Users (`/users`)

Endpoints for managing user-specific data.

### `GET /users/me`
*   **Description:** Fetches the complete profile of the currently authenticated user.
*   **Authorization:** `Patient`, `Professional`, `NGO`, `Admin`
*   **Responses:**
    *   **`200 OK`**: Success.
        ```json
        // Example for a 'Professional' user
        {
          "userId": 2,
          "fullName": "Dr. Bhumika Choudhary",
          "email": "bhumika.c@example.com",
          "phoneNumber": "9509211123",
          "role": "Professional",
          "createdAt": "2025-01-15T10:00:00Z",
          "professionalDetails": {
            "professionalId": 1,
            "specialty": "Psychiatrist",
            "credentials": "MD, License #12345",
            "yearsOfExperience": 8,
            "verificationStatus": "Verified"
          }
        }
        ```
    *   **`404 Not Found`**: User's detailed profile (e.g., patientDetails) doesn't exist.

### `PUT /users/me`
*   **Description:** Updates the profile of the currently authenticated user.
*   **Authorization:** `Patient`, `Professional`, `NGO`, `Admin`
*   **Request Body:** *Fields are optional. Only include fields to be updated.*
    ```json
    {
      "fullName": "Dr. B. Choudhary",
      "phoneNumber": "9509211123"
    }
    ```
*   **Responses:**
    *   **`200 OK`**: Success. Returns the updated user object.
    *   **`400 Bad Request`**: Validation error.

---

## 3. Professionals (`/professionals`)

### `GET /professionals`
*   **Description:** Fetches a list of verified volunteer professionals for patients to browse.
*   **Authorization:** `Patient`
*   **Query Parameters:** `?specialty=Psychiatrist`, `?page=1`, `?limit=10`
*   **Responses:**
    *   **`200 OK`**: Success.
        ```json
        {
          "data": [
            {
              "professionalId": 1,
              "fullName": "Dr. Bhumika Choudhary",
              "specialty": "Psychiatrist",
              "yearsOfExperience": 8
            }
          ],
          "pagination": { "totalPages": 5, "currentPage": 1 }
        }
        ```

### `GET /professionals/:id/availability`
*   **Description:** Fetches all available (un-booked) time slots for a specific professional.
*   **Authorization:** `Patient`
*   **Responses:**
    *   **`200 OK`**: Success.
        ```json
        [
          { "slotId": 101, "startTime": "2025-10-20T09:00:00Z", "endTime": "2025-10-20T09:30:00Z" },
          { "slotId": 102, "startTime": "2025-10-20T10:00:00Z", "endTime": "2025-10-20T10:30:00Z" }
        ]
        ```

### `POST /professionals/me/availability`
*   **Description:** Allows an authenticated professional to add new availability slots.
*   **Authorization:** `Professional`
*   **Request Body:**
    ```json
    {
      "slots": [
        { "startTime": "2025-10-21T14:00:00Z", "endTime": "2025-10-21T14:30:00Z" },
        { "startTime": "2025-10-21T15:00:00Z", "endTime": "2025-10-21T15:30:00Z" }
      ]
    }
    ```
*   **Responses:**
    *   **`201 Created`**: Success. Returns the created slot objects.
    *   **`409 Conflict`**: Slot time overlaps with an existing slot.

---

## 4. Appointments (`/appointments`)

### `POST /appointments`
*   **Description:** Books a new appointment for the authenticated patient.
*   **Authorization:** `Patient`, `NGO` (if facilitating)
*   **Request Body:**
    ```json
    {
      "appointmentType": "Virtual", // Enum: "Virtual", "In-Person"
      "professionalId": 5,          // Required for "Virtual"
      "clinicDoctorId": null,       // Required for "In-Person"
      "appointmentTime": "2025-10-20T09:00:00Z",
      "slotId": 101                 // Required for "Virtual" to book the slot
    }
    ```
*   **Responses:**
    *   **`201 Created`**: Success. Returns the new appointment object.
    *   **`400 Bad Request`**: Invalid request (e.g., missing required ID for type).
    *   **`409 Conflict`**: The requested time slot is no longer available.

### `GET /appointments/me`
*   **Description:** Fetches a list of all appointments for the authenticated user.
*   **Authorization:** `Patient`, `Professional`
*   **Query Parameters:** `?status=upcoming` (default), `?status=past`
*   **Responses:**
    *   **`200 OK`**: Success. Returns an array of appointment objects.

### `GET /appointments/:id`
*   **Description:** Fetches details of a single appointment.
*   **Authorization:** `Patient`, `Professional` (must be a participant)
*   **Responses:**
    *   **`200 OK`**: Success. Returns the detailed appointment object, including consultation notes if completed.
    *   **`403 Forbidden`**: User is not a participant in this appointment.
    *   **`404 Not Found`**: Appointment ID does not exist.

### `PUT /appointments/:id/cancel`
*   **Description:** Cancels an upcoming appointment.
*   **Authorization:** `Patient`, `Professional` (must be a participant)
*   **Responses:**
    *   **`200 OK`**: Success. Returns the updated appointment with status "Cancelled".
    *   **`400 Bad Request`**: Cannot cancel an appointment that has already started or is completed.

---

## 5. Consultations (`/consultations`)

### `POST /consultations`
*   **Description:** Creates a consultation record after a call is completed.
*   **Authorization:** `Professional`
*   **Request Body:**
    ```json
    {
      "appointmentId": 123,
      "notes": "Patient reports symptoms consistent with mild viral infection. Advised rest and hydration.",
      "prescriptions": [
        { "medicationName": "Paracetamol", "dosage": "500mg", "instructions": "Take one tablet every 6 hours as needed." }
      ]
    }
    ```
*   **Responses:**
    *   **`201 Created`**: Success.
    *   **`400 Bad Request`**: Appointment is not in a "Completed" state.
    *   **`409 Conflict`**: A consultation record for this appointment already exists.

---

## 6. Hyperlocal Discovery (`/clinics`)

### `GET /clinics/search`
*   **Description:** Searches for local clinics/hospitals. Publicly accessible.
*   **Query Parameters:** `?lat=28.6139&lon=77.2090&radius=5&specialty=Dentist&minRating=4`
*   **Responses:**
    *   **`200 OK`**: Success. Returns an array of clinic objects matching the criteria.

### `GET /clinics/:id`
*   **Description:** Fetches details for a single clinic or hospital, including its list of doctors. Publicly accessible.
*   **Responses:**
    *   **`200 OK`**: Success.
    *   **`404 Not Found`**: Clinic ID does not exist.

---

## 7. AI Care Companion (`/ai`)

### `POST /ai/chat`
*   **Description:** Sends a message to the AI Care Companion.
*   **Authorization:** `Patient`
*   **Request Body:**
    ```json
    {
      "message": "I have a skin rash on my arm",
      "imageUrl": "data:image/jpeg;base64,..." // Optional, Base64 encoded image
    }
    ```
*   **Responses:**
    *   **`200 OK`**: Success.
        ```json
        {
          "response": "I see the image you've sent. While I cannot diagnose, rashes can have many causes. It would be best to speak with a dermatologist. Would you like me to help you find one nearby or book a virtual consultation?",
          "suggestedAction": {
            "type": "SEARCH_LOCAL",
            "specialty": "Dermatologist"
          }
        }
        ```
    *   **`502 Bad Gateway`**: AI service is down or not responding.


---

# Clinico AI Service: API & Agent Endpoints

**Version:** 1.0.0
**Primary Service URL:** `/api/ai`

This document details the public-facing API for the AI Care Companion and the internal architecture of the specialized AI agents that power it.

---

## **1. Public-Facing API Endpoint (`/ai`)**

This is the **only endpoint** that the frontend (Flutter App) will ever call. The backend's AI gateway is responsible for receiving this request and orchestrating the necessary calls to the internal AI agent services.

### `POST /ai/chat`
*   **Description:** The universal endpoint for all user interactions with the AI Care Companion. It handles text, images, and context from the ongoing conversation.
*   **Authorization:** `Patient`, `NGO` (on behalf of a patient)
*   **Request Body:**
    ```json
    {
      "sessionId": "a-unique-session-id-for-this-conversation",
      "message": "I've been feeling very stressed and can't sleep",
      "imageUrl": null // e.g., "data:image/jpeg;base64,..." if user uploads a photo
    }
    ```
*   **Success Response (200 OK):** The response is dynamic and structured to guide the frontend on what to display.
    ```json
    {
      // The text to display to the user
      "response": "It sounds like you're going through a tough time. Stress and lack of sleep are challenging. Sometimes guided exercises can help. Would you like to try a 5-minute breathing exercise, or would you prefer I help you find a mental health professional to talk to?",
      
      // Structured suggestions for the UI to render as buttons or quick replies
      "suggestedActions": [
        {
          "type": "GUIDED_EXERCISE",
          "label": "Try Breathing Exercise",
          "payload": { "exerciseId": "breathing_5min" }
        },
        {
          "type": "SEARCH_PROFESSIONAL",
          "label": "Find a Professional",
          "payload": { "specialty": "Psychiatrist" }
        }
      ]
    }
    ```
*   **Error Response (`502 Bad Gateway`):** If the internal AI services are unreachable.

---

## **2. Internal AI Agent Endpoints & Responsibilities**

These are the internal microservices or functions that the backend's API gateway calls. **The frontend never calls these directly.** They are powered by Google Gemini and a specialized Python backend.

### `Internal: /agents/orchestrator`
*   **Trigger:** Called by the `/ai/chat` endpoint on every user message.
*   **Responsibility:** This is the "brain" of the operation.
    1.  **Receives** the user's message and session ID.
    2.  **Analyzes** the user's intent using a Gemini prompt. (Is this a simple question? A request to book? A mental health crisis?).
    3.  **Delegates** the task by calling the appropriate specialized agent.
    4.  **Synthesizes** the response from the specialist agent into the final JSON structure for the frontend.

### `Internal: /agents/health-inquiry`
*   **Trigger:** Called by the **Orchestrator** when the user asks a general health question (e.g., "What are the symptoms of the flu?").
*   **Responsibility:** Provides safe, accurate, and sourced medical information.
    1.  **Receives** the user's query from the Orchestrator.
    2.  **Performs RAG:**
        *   **Retrieves** relevant, verified medical information from the **Vector Database (Pinecone)**.
        *   **Augments** a Gemini prompt with this retrieved context.
    3.  **Generates** a response that is grounded in the provided context, adding disclaimers like "I am not a doctor...".
    4.  **Returns** the structured response to the Orchestrator.

### `Internal: /agents/mental-wellness`
*   **Trigger:** Called by the **Orchestrator** when the user expresses feelings of stress, anxiety, sadness, etc.
*   **Responsibility:** Provides empathetic support and guided self-help.
    1.  **Receives** the user's message.
    2.  **Crisis Detection:** First, it uses a specialized Gemini prompt to check for any signs of a severe mental health crisis. **If a crisis is detected, it immediately returns a high-priority response with helpline numbers.**
    3.  **Empathetic Response:** Generates a supportive, non-judgmental response.
    4.  **Suggests Self-Help:** Offers relevant guided exercises (like breathing or mindfulness) by providing structured `suggestedActions` in its response.
    5.  **Returns** the response to the Orchestrator.

### `Internal: /agents/care-coordinator`
*   **Trigger:** Called by the **Orchestrator** when the user expresses a clear intent to see a doctor.
*   **Responsibility:** Navigates the user through the booking process.
    1.  **Receives** the user's request (e.g., "I need to find a dermatologist").
    2.  **Clarifies Needs:** Asks clarifying questions if needed (e.g., "Are you looking for an in-person visit or a virtual consultation?").
    3.  **Generates Actionable Suggestions:** Creates structured `suggestedActions` that the frontend can use to directly initiate a search on the map or filter the telehealth provider list.
    4.  **Returns** the response to the Orchestrator.

### `Internal: /agents/pre-consultation-briefer`
*   **Trigger:** Called by a separate backend process (not the chat gateway) shortly before a scheduled doctor's appointment.
*   **Responsibility:** Creates the AI-powered summary for the doctor.
    1.  **Receives** the `patientId` and `appointmentId`.
    2.  **Fetches** the recent `AI_Chat_Logs` for that patient from the PostgreSQL database.
    3.  **Summarizes:** Sends the entire chat history to Gemini with a specialized prompt: *"Summarize the following patient-AI conversation into a concise clinical brief for a doctor. Focus on stated symptoms, duration, and the patient's primary concerns."*
    4.  **Saves** the generated summary to the database, associated with the appointment, so the doctor's dashboard can display it.