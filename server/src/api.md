# Clinico API Documentation

This document provides a comprehensive overview of all available API endpoints in the Clinico backend server, including detailed information about request/response formats, authentication requirements, and usage examples.

## Table of Contents
1. [CORS Configuration](#cors-configuration)
2. [General Endpoints](#general-endpoints)
3. [Authentication Endpoints](#authentication-endpoints)
4. [User Endpoints](#user-endpoints)
5. [Professional Endpoints](#professional-endpoints)
6. [Appointment Endpoints](#appointment-endpoints)
7. [Consultation Endpoints](#consultation-endpoints)
8. [Clinic Endpoints](#clinic-endpoints)
9. [Prescription Endpoints](#prescription-endpoints)
9. [Vault Endpoints](#vault-endpoints)
10. [Review Endpoints](#review-endpoints)
11. [Medical Profile Endpoints](#medical-profile-endpoints)

## CORS Configuration

The Clinico API is configured to allow cross-origin requests from frontend applications. This enables the frontend to communicate with the backend API server.

**CORS Settings:**
- **Allowed Origins**: By default, requests are allowed from `http://localhost:5173` (Vite default port). Multiple origins can be configured using the `FRONTEND_URL` environment variable.
- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Allowed Headers**: Content-Type, Authorization, X-Requested-With
- **Credentials**: Enabled (cookies and authentication headers are allowed)

**Environment Configuration:**
The CORS origin can be configured using the `FRONTEND_URL` environment variable in your `.env` file. For multiple origins, separate them with commas:

```
FRONTEND_URL="http://localhost:5173,https://clinicofrontend.onrender.com"
```

**Example Request with CORS Headers:**
```
Origin: http://localhost:5173
Access-Control-Request-Method: GET
Access-Control-Request-Headers: Content-Type, Authorization
```

**Expected Response Headers:**
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Allow-Credentials: true
```

## General Endpoints

### GET /api/health
Check if the API server is running and healthy.

**Request:**
- Headers: None required
- Body: None
- Authentication: Not required

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-23T10:30:00.000Z",
  "uptime": 3600,
 "service": "Clinico API",
  "version": "1.0.0"
}
```

**Response (503 Service Unavailable):**
```json
{
  "status": "unhealthy",
  "timestamp": "2025-01-23T10:30:00.000Z",
  "error": "Database connection failed"
}
```

### GET /api
Get API information and available routes.

**Request:**
- Headers: None required
- Body: None
- Authentication: Not required

**Response (200 OK):**
```json
{
  "message": "Welcome to Clinico API",
  "version": "1.0.0",
  "status": "running",
 "timestamp": "2025-01-23T10:30:00.000Z",
  "endpoints": {
    "health": {
      "path": "/api/health",
      "method": "GET",
      "description": "Health check endpoint",
      "example_request": {},
      "example_response": {
        "status": "healthy",
        "timestamp": "2025-01-23T10:30:00.000Z",
        "uptime": 3600,
        "service": "Clinico API",
        "version": "1.0.0"
      }
    },
    "auth": {
      "path": "/api/auth",
      "methods": ["POST /register", "POST /login"],
      "description": "Authentication endpoints",
      "example_request": {
        "register": {
          "email": "user@example.com",
          "password": "securepassword",
          "full_name": "John Doe",
          "phone_number": "1234567890",
          "role": "Patient"
        },
        "login": {
          "email": "user@example.com",
          "password": "securepassword"
        }
      },
      "example_response": {
        "success": true,
        "message": "Login successful",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
          "user_id": 1,
          "email": "user@example.com",
          "full_name": "John Doe",
          "role": "Patient"
        }
      }
    },
    "users": {
      "path": "/api/users",
      "methods": ["GET /me", "PUT /me", "POST /me/records", "GET /me/records", "DELETE /me/records/:recordId"],
      "description": "User management endpoints",
      "example_request": {
        "update_profile": {
          "fullName": "John Smith",
          "phoneNumber": "0987654321"
        }
      },
      "example_response": {
        "message": "Profile updated successfully."
      }
    },
    "professionals": {
      "path": "/api/professionals",
      "methods": ["GET /", "GET /me/dashboard", "GET /:id/availability", "PUT /me/profile", "POST /availability/batch", "GET /:id/profile"],
      "description": "Professional management endpoints",
      "example_request": {
        "create_profile": {
          "specialty": "Cardiology",
          "credentials": "MD, PhD",
          "years_of_experience": 10,
          "languages_spoken": "English, Spanish"
        }
      },
      "example_response": {
        "message": "Professional profile created successfully.",
        "professional_id": 1
      }
    },
    "appointments": {
      "path": "/api/appointments",
      "methods": ["POST /", "GET /me"],
      "description": "Appointment booking and management endpoints",
      "example_request": {
        "book_appointment": {
          "slotId": 1,
          "patientNotes": "Patient has high blood pressure"
        }
      },
      "example_response": {
        "message": "Appointment booked successfully!",
        "appointmentId": 1
      }
    },
    "clinics": {
      "path": "/api/clinics",
      "methods": ["GET /search", "GET /:id", "GET /:id/doctors", "POST /doctors/:doctorId/reviews", "GET /doctors/:doctorId/reviews", "GET /doctors/:doctorId/reviews/stats", "POST /search-history", "GET /search-history"],
      "description": "Clinic discovery and management endpoints",
      "example_request": {
        "search_clinics": {
          "lat": 28.6139,
          "lon": 77.2090,
          "radius": 5,
          "specialty": "Cardiology"
        }
      },
      "example_response": {
        "count": 5,
        "radius_km": 5,
        "location": {
          "lat": 28.6139,
          "lon": 77.2090
        },
        "clinics": [
          {
            "clinic_id": 1,
            "name": "ABC Clinic",
            "address": "123 Main St, New Delhi",
            "distance": 1.2
          }
        ]
      }
    },
    "prescriptions": {
      "path": "/api/prescriptions",
      "methods": ["GET /me", "GET /me/:prescriptionId", "GET /lists", "GET /reminders", "GET /reminders/:reminderId/logs"],
      "description": "Prescription management endpoints",
      "example_request": {},
      "example_response": [
        {
          "prescription_id": 1,
          "medication_name": "Aspirin",
          "dosage": "10mg",
          "frequency": "Once daily",
          "duration": "7 days",
          "prescribed_date": "2025-01-20"
        }
      ]
    },
    "reviews": {
      "path": "/api/reviews",
      "methods": ["POST /", "PUT /:reviewId", "DELETE /:reviewId", "GET /me", "GET /:reviewId"],
      "description": "Review management endpoints",
      "example_request": {
        "create_review": {
          "target_type": "Professional",
          "target_id": 1,
          "rating": 5,
          "comment": "Excellent doctor, very helpful",
          "appreciated_aspects": "Professionalism and care"
        }
      },
      "example_response": {
        "success": true,
        "message": "Review submitted successfully",
        "review": {
          "review_id": 1,
          "patient_id": 1,
          "target_type": "Professional",
          "target_id": 1,
          "rating": 5,
          "comment": "Excellent doctor, very helpful",
          "created_at": "2025-01-23T10:30:00.000Z"
        }
      }
    },
    "vault": {
      "path": "/api/vault",
      "methods": ["POST /:vaultType/upload", "GET /:vaultType"],
      "description": "Medical document vault endpoints",
      "example_request": {
        "upload_document": {
          "documentFile": "file",
          "documentName": "Lab Report",
          "documentType": "Lab Report"
        }
      },
      "example_response": {
        "message": "Document uploaded to vault successfully.",
        "vaultId": 1,
        "documentUrl": "https://example.com/document/1"
      }
    },
    "chat": {
      "path": "/api/chat",
      "methods": ["GET /history", "DELETE /history", "GET /stats"],
      "description": "AI chat endpoints",
      "example_request": {},
      "example_response": {
        "messages": [
          {
            "log_id": 1,
            "message_content": "Hello, how can I help you?",
            "sender": "AI",
            "timestamp": "2025-01-23T10:30:00.000Z"
          }
        ],
        "total": 1,
        "limit": 50,
        "offset": 0
      }
    }
  },
  "documentation": "https://github.com/abhay-byte/minor-project-gtbit/blob/main/server/src/api.md"
}
```

## Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required, min 8 chars)",
  "full_name": "string (required)",
  "phone_number": "string (optional)",
  "role": "enum: Patient | Professional | NGO | Admin (required)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "JWT token string",
  "user": {
    "user_id": "integer",
    "email": "string",
    "full_name": "string",
    "role": "string",
    "created_at": "timestamp"
  }
}
```

### POST /api/auth/login
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "JWT token string",
  "user": {
    "user_id": "integer",
    "email": "string",
    "full_name": "string",
    "role": "string"
  }
}
```

## User Endpoints

All user endpoints require authentication via JWT token in the Authorization header.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

### GET /api/users/me
Get the logged-in user's profile.

**Response:**
```json
{
  "user_id": "integer",
  "user_id_uuid": "UUID string (nullable)",
  "email": "string",
  "full_name": "string",
  "phone_number": "string",
  "role": "string",
  "created_at": "timestamp",
  "patient_id": "integer (if role is Patient)",
  "patient_id_uuid": "UUID string (if role is Patient)",
  "date_of_birth": "date (if role is Patient)",
  "gender": "string (if role is Patient)",
  "address": "string (if role is Patient)",
  "blood_group": "string (if role is Patient)",
  "marital_status": "string (if role is Patient)",
  "known_allergies": "text (if role is Patient)",
  "chronic_conditions": "text (if role is Patient)",
  "current_medications": "text (if role is Patient)",
  "lifestyle_notes": "text (if role is Patient)",
  "member_since": "timestamp (if role is Patient)",
  "patient_code": "string (if role is Patient)",
  "current_location": "text (if role is Patient)",
  "current_full_address": "text (if role is Patient)",
  "professional_id": "integer (if role is Professional)",
  "professional_id_uuid": "UUID string (if role is Professional)",
  "specialty": "string (if role is Professional)",
  "credentials": "string (if role is Professional)",
  "years_of_experience": "integer (if role is Professional)",
  "verification_status": "enum (if role is Professional)",
  "rating": "decimal (if role is Professional)",
  "total_reviews": "integer (if role is Professional)",
  "patients_treated": "integer (if role is Professional)",
  "languages_spoken": "text (if role is Professional)",
  "working_hours": "text (if role is Professional)",
  "is_volunteer": "boolean (if role is Professional)",
  "ngo_user_id": "integer (if role is NGO)",
  "ngo_user_id_uuid": "UUID string (if role is NGO)",
  "ngo_name": "string (if role is NGO)"
}
```

### PUT /api/users/me
Update the logged-in user's profile.

**Request Body:**
```json
{
  "fullName": "string (optional)",
  "phoneNumber": "string (optional)",
  "address": "string (optional)",
  "gender": "string (optional)",
  "blood_group": "string (optional)",
  "marital_status": "string (optional)",
  "known_allergies": "text (optional)",
  "chronic_conditions": "text (optional)",
  "current_medications": "text (optional)",
  "lifestyle_notes": "text (optional)",
  "current_location": "text (optional)",
  "current_full_address": "text (optional)",
  "specialty": "string (optional)",
  "credentials": "string (optional)",
  "languages_spoken": "text (optional)",
  "working_hours": "text (optional)",
  "is_volunteer": "boolean (optional)"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully."
}
```

### POST /api/users/me/records
Upload a medical record.

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer {jwt_token}
```

**Form Data:**
- `documentFile`: file (required)
- `documentName`: string (required)
- `documentType`: string (required)
- `commentsNotes`: string (optional)
- `linkedAppointmentId`: integer (optional)
- `reportDate`: date (optional)
- `fileFormat`: string (optional)
- `fileSizeMb`: integer (optional)

**Response:**
```json
{
  "message": "Medical record uploaded successfully.",
  "record": {
    "recordId": "integer",
    "documentName": "string",
    "documentType": "string",
    "documentUrl": "string"
  }
}
```

### GET /api/users/me/records
Get all medical records for the user.

**Response:**
```json
[
  {
    "record_id": "integer",
    "document_name": "string",
    "document_type": "string",
    "document_url": "string",
    "uploaded_at": "timestamp",
    "comments_notes": "text",
    "report_date": "date",
    "file_format": "string",
    "file_size_mb": "integer"
  }
]
```

### DELETE /api/users/me/records/:recordId
Delete a specific medical record.

**Response:**
```json
{
  "message": "Medical record deleted successfully."
}
```

## Professional Endpoints

All professional endpoints are public (no authentication required).

### GET /api/professionals
Get all verified professionals, with optional filtering by specialty.

**Query Parameters:**
- `specialty`: string (optional) - Filter by specialty

**Response:**
```json
[
  {
    "professional_id": "integer",
    "full_name": "string",
    "specialty": "string",
    "credentials": "string",
    "years_of_experience": "integer",
    "rating": "decimal",
    "total_reviews": "integer",
    "patients_treated": "integer",
    "languages_spoken": "text",
    "working_hours": "text",
    "is_volunteer": "boolean"
  }
]
```

### GET /api/professionals/me/dashboard

Fetches aggregated statistics for the logged-in professional's dashboard.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:**
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

### GET /api/professionals/:id/availability
Get available slots for a specific professional.

**Path Parameter:**
- `id`: integer (required) - Professional ID

**Response:**
```json
[
  {
    "slot_id": "integer",
    "start_time": "timestamp",
    "end_time": "timestamp"
  }
]
```

### PUT /api/professionals/me/profile

Creates or updates a professional's profile information.

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "specialty": "string (optional)",
  "credentials": "string (optional)",
  "years_of_experience": "integer (optional)",
  "languages_spoken": "text (optional)",
  "working_hours": "text (optional)",
  "is_volunteer": "boolean (optional)"
}
```

**Response:**
```json
{
  "message": "Professional profile created successfully.",
  "professional_id": "integer"
}
```

Or for update:
```json
{
  "message": "Professional profile updated successfully.",
  "professional_id": "integer"
}
```

### POST /api/professionals/availability/batch

Generate recurring availability slots for a professional.

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "days_of_week": ["string (required)", "Array of day names (e.g., Monday, Tuesday)"],
  "start_time": "string (required, format: HH:MM:SS)",
  "end_time": "string (required, format: HH:MM:SS)",
  "slot_duration_minutes": "integer (required, positive number)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Slots generated successfully",
  "slots_created": 48
}
```

### GET /api/professionals/:id/profile

Get complete profile information for a specific doctor by ID.

**Path Parameter:**
- `id`: integer (required) - Doctor ID

**Response:**
```json
{
  "success": true,
  "data": {
    "doctor": {
      "id": "integer",
      "full_name": "string",
      "email": "string",
      "phone_number": "string",
      "specialty": "string",
      "credentials": "string",
      "years_of_experience": "integer",
      "verification_status": "string",
      "is_volunteer": "boolean",
      "languages_spoken": ["string"],
      "working_hours": "string",
      "rating": "float",
      "total_reviews": "integer",
      "patients_treated": "integer",
      "completed_appointments": "integer",
      "upcoming_appointments": "integer",
      "today_appointments": "integer",
      "availability": [
        {
          "slot_id": "integer",
          "start_time": "timestamp",
          "end_time": "timestamp",
          "is_booked": "boolean",
          "slot_date": "date"
        }
      ]
    }
  }
}
```

## Appointment Endpoints

All appointment endpoints require authentication.

### POST /api/appointments
Book a new appointment.

**Request Body:**
```json
{
  "slotId": "integer (required)",
  "appointmentCode": "string (optional)",
  "patientNotes": "string (optional)",
  "durationMinutes": "integer (optional)"
}
```

**Response:**
```json
{
  "message": "Appointment booked successfully!",
  "appointmentId": "integer"
}
```

### GET /api/appointments/me
Get appointment history for the user.

**Query Parameters:**
- `status`: string (optional) - 'upcoming' or 'past'

**Response:**
```json
[
  {
    "appointment_id": "integer",
    "appointment_time": "timestamp",
    "status": "enum",
    "appointment_type": "enum",
    "appointment_code": "string",
    "patient_notes": "string",
    "scheduled_at": "timestamp",
    "completed_at": "timestamp",
    "duration_minutes": "integer",
    "professional_name": "string (for patient)",
    "specialty": "string (for patient)",
    "patient_name": "string (for professional)"
  }
]
```

### PUT /api/appointments/:id/cancel
Cancel an appointment and release the associated time slot.

**Path Parameter:**
- `id`: integer (required) - Appointment ID

**Request:**
- Method: `PUT`
- Headers:
  ```
  Authorization: Bearer {jwt_token}
  Content-Type: application/json
  ```
- Authentication: Required (Patient or Professional)

**Request Body:**
```json
{
  "reason": "string (optional) - Cancellation reason"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "appointment": {
    "appointment_id": 102,
    "appointment_id_uuid": "uuid-string",
    "status": "Cancelled",
    "cancelled_at": "2025-01-23T10:30:00.000Z",
    "cancellation_reason": "Emergency surgery required",
    "slot_released": true
  }
}
```

**Response (403 Forbidden):**
```json
{
  "error": "You are not authorized to cancel this appointment"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Appointment not found"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Appointment is already cancelled or completed"
}
```

## Consultation Endpoints

All consultation endpoints require authentication and are restricted to professionals.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

### POST /api/consultations
Save clinical outcome after appointment completion.

**Request:**
- Method: `POST`
- Headers:
  ```
  Authorization: Bearer {jwt_token}
  Content-Type: application/json
  ```
- Authentication: Required (Professional only)

**Request Body:**
```json
{
  "appointment_id": 102,
  "diagnosis": "string (required) - Primary diagnosis",
  "doctor_recommendations": "string (required) - Treatment recommendations",
  "follow_up_instructions": "string (optional) - Follow-up care instructions",
  "notes": "string (optional) - Clinical notes",
  "ai_briefing": "string (optional) - AI-generated patient summary"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Consultation record created successfully",
  "consultation": {
    "consultation_id": 205,
    "consultation_id_uuid": "uuid-string",
    "appointment_id": 102,
    "diagnosis": "Acute Bronchitis",
    "doctor_recommendations": "Steam inhalation, rest.",
    "follow_up_instructions": "Visit again if fever persists > 3 days.",
    "notes": "Patient presented with dry cough.",
    "prescription_attached": false,
    "created_at": "2025-11-19T10:30:00Z"
 }
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Appointment not found or not completed"
}
```

**Response (403 Forbidden):**
```json
{
  "error": "You are not authorized to create consultation for this appointment"
}
```

**Response (409 Conflict):**
```json
{
  "error": "Consultation record already exists for this appointment"
}
```

---

### POST /api/prescriptions
Issue a new prescription during or after consultation.

**Request:**
- Method: `POST`
- Headers:
  ```
  Authorization: Bearer {jwt_token}
  Content-Type: application/json
  ```
- Authentication: Required (Professional only)

**Request Body:**
```json
{
  "consultation_id": 205,
  "medication_name": "string (required)",
  "dosage": "string (required)",
  "frequency": "string (required)",
  "duration": "string (required)",
  "medication_category": "string (optional)",
  "instructions": "string (required) - How to take",
  "doctor_notes": "string (optional)",
  "important_notes": "string (optional) - Warnings/precautions"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Prescription created successfully",
  "prescription": {
    "prescription_id": 301,
    "prescription_id_uuid": "uuid-string",
    "consultation_id": 205,
    "medication_name": "Azithromycin",
    "dosage": "500mg",
    "frequency": "Once daily",
    "duration": "5 days",
    "medication_category": "Antibiotic",
    "doctor_notes": "Complete the full course",
    "important_notes": "May cause slight drowsiness",
    "prescribed_date": "2025-11-19",
    "is_active": true,
    "prescribed_by_doctor_id": 10,
    "doctor_name": "Dr. Smith",
    "doctor_specialty": "General Physician"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Consultation not found"
}
```

**Response (403 Forbidden):**
```json
{
  "error": "You are not authorized to prescribe for this consultation"
}
```

---

### POST /api/upload-report-requests
Request patient to upload specific lab test reports.

**Request:**
- Method: `POST`
- Headers:
  ```
  Authorization: Bearer {jwt_token}
  Content-Type: application/json
  ```
- Authentication: Required (Professional only)

**Request Body:**
```json
{
  "patient_id": 55,
  "consultation_id": 205,
  "requested_tests": "string (required) - Comma-separated test names",
  "due_date": "date (required) - YYYY-MM-DD",
  "additional_notes": "string (optional) - Special instructions"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Report request sent to patient",
  "request": {
    "request_id": "uuid-string",
    "request_code": "REQ-2025-889",
    "patient_id": 55,
    "professional_id": 10,
    "requested_tests": "CBC, Lipid Profile, HbA1c",
    "due_date": "2025-11-25",
    "status": "Pending",
    "additional_notes": "Fasting required for 12 hours before test",
    "created_at": "2025-11-19T10:30:00Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Invalid patient ID or due date"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Patient not found"
}
```

---

## Clinic Endpoints

Public clinic endpoints do not require authentication, while review endpoints require authentication.

### GET /api/clinics/search
Search for nearby clinics via geolocation.

**Query Parameters:**
- `lat`: float (required) - Latitude
- `lon`: float (required) - Longitude
- `radius`: float (optional, default: 5) - Search radius in km
- `specialty`: string (optional) - Filter by specialty
- `type`: string (optional) - Filter by clinic type (Clinic or Hospital)
- `available_today`: boolean (optional) - Filter by availability today
- `min_rating`: float (optional) - Minimum rating filter
- `city`: string (optional) - Filter by city
- `area`: string (optional) - Filter by area

**Response:**
```json
{
  "count": "integer",
  "radius_km": "float",
  "location": {
    "lat": "float",
    "lon": "float"
  },
  "clinics": [
    {
      "clinic_id": "integer",
      "clinic_id_uuid": "UUID string (nullable)",
      "name": "string",
      "address": "string",
      "latitude": "float",
      "longitude": "float",
      "phone_number": "string",
      "type": "string",
      "facilities": "text",
      "operating_hours": "text",
      "average_rating": "decimal",
      "total_reviews": "integer",
      "city": "string",
      "area": "string",
      "pincode": "string",
      "distance": "float (km)",
      "doctor_count": "integer"
    }
  ]
}
```

### GET /api/clinics/:id
Get details for a specific clinic.

**Path Parameter:**
- `id`: integer (required) - Clinic ID

**Response:**
```json
{
  "clinic_id": "integer",
  "clinic_id_uuid": "UUID string (nullable)",
  "name": "string",
  "address": "string",
  "latitude": "float",
  "longitude": "float",
  "phone_number": "string",
  "type": "string",
  "facilities": "text",
  "operating_hours": "text",
  "average_rating": "decimal",
  "total_reviews": "integer",
  "city": "string",
  "area": "string",
  "pincode": "string",
  "doctors": [
    {
      "clinic_doctor_id": "integer",
      "clinic_doctor_id_uuid": "UUID string (nullable)",
      "full_name": "string",
      "specialty": "string",
      "consultation_fee": "integer",
      "qualifications": "text",
      "available_days": "text",
      "available_hours": "text",
      "rating": "decimal",
      "review_count": "integer",
      "languages": "text",
      "distance_km": "string",
      "hospital_affiliation": "string",
      "is_volunteer": "boolean",
      "available_today": "boolean",
      "available_tomorrow": "boolean",
      "available_this_week": "boolean"
    }
  ],
  "doctor_count": "integer"
}
```

### GET /api/clinics/:id/doctors
Get doctors for a specific clinic.

**Path Parameter:**
- `id`: integer (required) - Clinic ID

**Query Parameters:**
- `specialty`: string (optional) - Filter by specialty
- `available_today`: boolean (optional) - Filter by availability today
- `min_rating`: float (optional) - Minimum rating filter

**Response:**
```json
{
  "clinic_id": "integer",
  "count": "integer",
  "doctors": [
    {
      "clinic_doctor_id": "integer",
      "clinic_doctor_id_uuid": "UUID string (nullable)",
      "full_name": "string",
      "specialty": "string",
      "consultation_fee": "integer",
      "qualifications": "text",
      "available_days": "text",
      "available_hours": "text",
      "rating": "decimal",
      "review_count": "integer",
      "languages": "text",
      "distance_km": "string",
      "hospital_affiliation": "string",
      "is_volunteer": "boolean",
      "available_today": "boolean",
      "available_tomorrow": "boolean",
      "available_this_week": "boolean"
    }
  ]
}
```

### POST /api/clinics/doctors/:doctorId/reviews
Submit a review for a clinic doctor.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Path Parameter:**
- `doctorId`: integer (required) - Doctor ID

**Request Body:**
```json
{
  "rating": "integer (1-5, required)",
  "comment": "string (optional)",
  "appreciated_aspects": "text (optional)",
  "feedback_suggestions": "text (optional)",
  "is_verified_visit": "boolean (optional, default: false)"
}
```

**Response:**
```json
{
  "message": "Review submitted successfully.",
  "review": {
    "review_id": "integer",
    "review_id_uuid": "UUID string (nullable)",
    "created_at": "timestamp"
  }
}
```

### GET /api/clinics/doctors/:doctorId/reviews
Get all reviews for a clinic doctor.

**Path Parameter:**
- `doctorId`: integer (required) - Doctor ID

**Query Parameters:**
- `limit`: integer (optional, default: 50)
- `offset`: integer (optional, default: 0)
- `min_rating`: float (optional) - Minimum rating filter

**Response:**
```json
{
  "total": "integer",
  "average_rating": "float",
  "limit": "integer",
  "offset": "integer",
  "reviews": [
    {
      "review_id": "integer",
      "review_id_uuid": "UUID string (nullable)",
      "patient_id": "integer",
      "rating": "integer",
      "comment": "string",
      "appreciated_aspects": "text",
      "feedback_suggestions": "text",
      "is_verified_visit": "boolean",
      "created_at": "timestamp",
      "author": "string"
    }
  ]
}
```

### GET /api/clinics/doctors/:doctorId/reviews/stats
Get review statistics for a clinic doctor.

**Path Parameter:**
- `doctorId`: integer (required) - Doctor ID

**Response:**
```json
{
  "total_reviews": "integer",
  "average_rating": "decimal",
  "five_star": "integer",
  "four_star": "integer",
  "three_star": "integer",
  "two_star": "integer",
  "one_star": "integer",
  "verified_reviews": "integer"
}
```

### POST /api/clinics/search-history
Save a search history entry.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Request Body:**
```json
{
  "search_query": "string (optional)",
  "search_filters": "json (optional)",
  "location_searched": "string (optional)",
  "results_count": "integer (optional)"
}
```

**Response:**
```json
{
  "message": "Search history saved.",
  "search_id": "integer"
}
```

### GET /api/clinics/search-history
Get the patient's search history.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Query Parameters:**
- `limit`: integer (optional, default: 20)

**Response:**
```json
{
  "count": "integer",
  "searches": [
    {
      "search_id": "integer",
      "search_query": "string",
      "search_filters": "json",
      "location_searched": "string",
      "results_count": "integer",
      "searched_at": "timestamp"
    }
  ]
}
```

## Prescription Endpoints

All prescription endpoints require authentication.

### GET /api/prescriptions/me
Get all prescriptions for the logged-in patient.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:**
```json
[
  {
    "prescription_id": "integer",
    "prescription_code": "string",
    "medication_name": "string",
    "dosage": "string",
    "frequency": "string",
    "duration": "string",
    "medication_category": "string",
    "doctor_notes": "text",
    "prescribed_date": "date",
    "is_active": "boolean",
    "prescribed_by_doctor_id": "integer",
    "doctor_name": "string",
    "doctor_specialty": "string",
    "clinic_name": "string",
    "important_notes": "text",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

### GET /api/prescriptions/me/:prescriptionId
Get a specific prescription by ID.

**Path Parameter:**
- `prescriptionId`: integer (required) - Prescription ID

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:**
```json
{
  "prescription_id": "integer",
  "prescription_code": "string",
  "medication_name": "string",
  "dosage": "string",
  "frequency": "string",
  "duration": "string",
  "medication_category": "string",
  "doctor_notes": "text",
  "prescribed_date": "date",
  "is_active": "boolean",
  "prescribed_by_doctor_id": "integer",
  "doctor_name": "string",
  "doctor_specialty": "string",
  "clinic_name": "string",
  "important_notes": "text",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### GET /api/prescriptions/lists
Get prescription lists for the logged-in patient.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:**
[
  {
    "list_id": "UUID",
    "prescription_id": "integer",
    "condition_treated": "string",
    "medicines_count": "integer",
    "next_followup": "date",
    "prescription_status": "string",
    "last_viewed": "timestamp",
    "medication_name": "string",
    "dosage": "string",
    "frequency": "string"
  }
]
```

### GET /api/prescriptions/reminders
Get medicine reminders for the logged-in patient.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:**
```json
[
  {
    "reminder_id": "UUID",
    "prescription_id": "integer",
    "medication_name": "string",
    "dosage_form": "enum: 1 tablet | 1 capsule | Other",
    "timing_schedule": "text",
    "how_to_take": "enum: After food | Before food | After breakfast | Other",
    "duration": "text",
    "doctor_note": "text",
    "start_date": "date",
    "end_date": "date",
    "is_active": "boolean",
    "next_reminder_time": "timestamp"
  }
]
```

### GET /api/prescriptions/reminders/:reminderId/logs
Get reminder logs for a specific medicine reminder.

**Path Parameter:**
- `reminderId`: UUID (required) - Reminder ID

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response:**
```json
[
  {
    "log_id": "UUID",
    "scheduled_time": "timestamp",
    "taken_time": "timestamp",
    "status": "enum: Pending | Taken | Missed | Snoozed",
    "notes": "text",
    "created_at": "timestamp"
  }
]
```

## Vault Endpoints

All vault endpoints require authentication.

### POST /api/vault/:vaultType/upload
Upload a document to the medical vault.

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer {jwt_token}
```

**Path Parameter:**
- `vaultType`: string (required) - One of: prescription, lab_report, radiology, discharge, vaccination, doctor_notes, other

**Form Data:**
- `documentFile`: file (required)
- `metadata`: json string (optional)

**Response:**
```json
{
  "message": "Document uploaded to vault successfully.",
  "vaultId": "integer",
  "documentUrl": "string"
}
```

### GET /api/vault/:vaultType
Get all documents from a specific vault type.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Path Parameter:**
- `vaultType`: string (required) - One of: prescription, lab_report, radiology, discharge, vaccination, doctor_notes, other

**Response:**
```json
[
  {
    "vault_id": "integer",
    "document_url": "string",
    "metadata": "json",
    "file_count": "integer",
    "created_at": "timestamp"
  }
]
```


## Review Endpoints

All review endpoints require authentication via JWT token.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

### POST /api/reviews
Submit a new review for a professional, clinic doctor, or other entity.

**Request Body:**
```json
{
  "target_type": "string (required) - Entity type: 'Professional' | 'ClinicDoctor' | 'Clinic' | 'Appointment'",
  "target_id": "integer (required) - ID of the entity being reviewed",
  "rating": "integer (required, 1-5) - Star rating",
  "comment": "string (optional) - Review text",
  "appreciated_aspects": "string (optional) - Positive aspects",
  "feedback_suggestions": "string (optional) - Improvement suggestions",
  "is_verified_visit": "boolean (optional, default: false) - Whether visit was verified"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "review": {
    "review_id": "integer",
    "review_id_uuid": "UUID string",
    "patient_id": "integer",
    "target_type": "string",
    "target_id": "integer",
    "rating": "integer",
    "comment": "string",
    "appreciated_aspects": "string",
    "feedback_suggestions": "string",
    "is_verified_visit": "boolean",
    "created_at": "timestamp"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid rating (must be 1-5) or missing required fields
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User is not a patient or trying to review their own service
- `404 Not Found`: Target entity doesn't exist
- `409 Conflict`: User has already reviewed this entity

---

### PUT /api/reviews/:reviewId
Update an existing review.

**Path Parameter:**
- `reviewId`: integer (required) - Review ID to update

**Request Body:**
```json
{
  "rating": "integer (optional, 1-5) - Updated star rating",
  "comment": "string (optional) - Updated review text",
  "appreciated_aspects": "string (optional) - Updated positive aspects",
  "feedback_suggestions": "string (optional) - Updated improvement suggestions",
  "is_verified_visit": "boolean (optional) - Updated verification status"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review updated successfully",
  "review": {
    "review_id": "integer",
    "review_id_uuid": "UUID string",
    "patient_id": "integer",
    "target_type": "string",
    "target_id": "integer",
    "rating": "integer",
    "comment": "string",
    "appreciated_aspects": "string",
    "feedback_suggestions": "string",
    "is_verified_visit": "boolean",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid rating or no fields provided for update
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User doesn't own this review
- `404 Not Found`: Review doesn't exist

---

### DELETE /api/reviews/:reviewId
Delete a review.

**Path Parameter:**
- `reviewId`: integer (required) - Review ID to delete

**Response:**
```json
{
  "success": true,
  "message": "Review deleted successfully",
  "deleted_review_id": "integer"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User doesn't own this review
- `404 Not Found`: Review doesn't exist

---

### GET /api/reviews/me
Get all reviews submitted by the logged-in user.

**Query Parameters:**
- `target_type`: string (optional) - Filter by entity type
- `limit`: integer (optional, default: 50, max: 100)
- `offset`: integer (optional, default: 0)
- `order_by`: string (optional, default: 'created_at') - Sort field: 'created_at' | 'rating'
- `order_direction`: string (optional, default: 'DESC') - Sort direction: 'ASC' | 'DESC'

**Response:**
```json
{
  "success": true,
  "total": "integer",
  "limit": "integer",
  "offset": "integer",
  "reviews": [
    {
      "review_id": "integer",
      "review_id_uuid": "UUID string",
      "target_type": "string",
      "target_id": "integer",
      "target_name": "string - Name of reviewed entity",
      "rating": "integer",
      "comment": "string",
      "appreciated_aspects": "string",
      "feedback_suggestions": "string",
      "is_verified_visit": "boolean",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
}
```

---

### GET /api/reviews/:reviewId
Get details of a specific review.

**Path Parameter:**
- `reviewId`: integer (required) - Review ID

**Response:**
```json
{
  "success": true,
  "review": {
    "review_id": "integer",
    "review_id_uuid": "UUID string",
    "patient_id": "integer",
    "patient_name": "string",
    "target_type": "string",
    "target_id": "integer",
    "target_name": "string",
    "rating": "integer",
    "comment": "string",
    "appreciated_aspects": "string",
    "feedback_suggestions": "string",
    "is_verified_visit": "boolean",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

**Error Responses:**
- `404 Not Found`: Review doesn't exist

---

## Medical Profile Endpoints

All medical profile endpoints require authentication via JWT token.

**Headers:**
```
Authorization: Bearer {jwt_token}
```

### GET /api/patients/:id/medical-profile
Retrieve complete medical history for consultation reference.

**Path Parameter:**
- `id`: integer (required) - Patient ID

**Response:**
```json
{
  "success": true,
  "data": {
    "patient": {
      "patient_id": "integer",
      "patient_id_uuid": "UUID string",
      "user_id": "integer",
      "full_name": "string",
      "email": "string",
      "phone_number": "string",
      "date_of_birth": "date",
      "gender": "string",
      "address": "string",
      "blood_group": "string",
      "marital_status": "string",
      "known_allergies": "text",
      "chronic_conditions": "text",
      "current_medications": "text",
      "lifestyle_notes": "text",
      "member_since": "timestamp",
      "patient_code": "string",
      "current_location": "text",
      "current_full_address": "text"
    },
    "appointments": [
      {
        "appointment_id": "integer",
        "appointment_id_uuid": "UUID string",
        "appointment_time": "timestamp",
        "status": "enum",
        "appointment_type": "enum",
        "appointment_code": "string",
        "patient_notes": "string",
        "scheduled_at": "timestamp",
        "completed_at": "timestamp",
        "duration_minutes": "integer",
        "professional_name": "string",
        "specialty": "string"
      }
    ],
    "consultations": [
      {
        "consultation_id": "integer",
        "consultation_id_uuid": "UUID string",
        "appointment_id": "integer",
        "notes": "text",
        "ai_briefing": "text",
        "created_at": "timestamp",
        "diagnosis": "text",
        "doctor_recommendations": "text",
        "follow_up_instructions": "text",
        "prescription_attached": "boolean"
      }
    ],
    "prescriptions": [
      {
        "prescription_id": "integer",
        "prescription_id_uuid": "UUID string",
        "medication_name": "string",
        "dosage": "string",
        "instructions": "text",
        "prescription_code": "string",
        "frequency": "string",
        "duration": "string",
        "medication_category": "string",
        "doctor_notes": "text",
        "prescribed_date": "date",
        "is_active": "boolean",
        "doctor_name": "string",
        "doctor_specialty": "string",
        "clinic_name": "string",
        "important_notes": "text",
        "consultation_id": "integer",
        "consultation_notes": "text"
      }
    ],
    "medical_records": [
      {
        "record_id": "integer",
        "record_id_uuid": "UUID string",
        "document_name": "string",
        "document_type": "string",
        "document_url": "string",
        "uploaded_at": "timestamp",
        "comments_notes": "text",
        "report_date": "date",
        "file_format": "string",
        "file_size_mb": "integer",
        "linked_appointment_code": "string"
      }
    ],
    "medicine_reminders": [
      {
        "reminder_id": "UUID",
        "medication_name": "string",
        "dosage_form": "enum: 1 tablet | 1 capsule | Other",
        "timing_schedule": "text",
        "how_to_take": "enum: After food | Before food | After breakfast | Other",
        "duration": "text",
        "doctor_note": "text",
        "start_date": "date",
        "end_date": "date",
        "is_active": "boolean",
        "next_reminder_time": "timestamp"
      }
    ],
    "ai_chat_sessions": [
      {
        "session_id": "UUID",
        "started_at": "timestamp",
        "ended_at": "timestamp",
        "session_type": "enum: Health Query | Mental Wellness | Triage | Crisis",
        "session_summary": "text",
        "escalated_to_professional": "boolean",
        "crisis_detected": "boolean",
        "crisis_type": "enum: Suicidal | Self-harm | Severe distress"
      }
    ]
 }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid patient ID
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User doesn't have permission to access patient medical profile
- `404 Not Found`: Patient doesn't exist
- `500 Internal Server Error`: Server error while fetching medical profile

---

Common status codes:
- 400: Bad Request (validation error)
- 401: Unauthorized (invalid/expired token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource doesn't exist)
- 409: Conflict (duplicate email during registration)
- 429: Too Many Requests (rate limit exceeded)
- 500: Internal Server Error