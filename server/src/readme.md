# 🏥 Clinico - Backend API Server

This is the backend server for the **Clinico** platform, built with **Node.js**, **Express**, and **PostgreSQL**.

---

## ⚙️ Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** PostgreSQL (Dockerized)  
- **Authentication:** JWT, bcrypt  
- **File Storage:** Cloudinary  
- **Testing:** Jest  



## 📡 API Endpoint Summary

| **Method** | **Endpoint**                          | **Description**                            | **Protected** |
| ---------- | ------------------------------------- | ------------------------------------------ | ------------- |
| **POST**   | `/api/auth/register`                  | Register a new user.                       | ❌             |
| **POST**   | `/api/auth/login`                     | Log in and receive a JWT.                  | ❌             |
| **GET**    | `/api/users/me`                       | Get the logged-in user's profile.          | ✅             |
| **PUT**    | `/api/users/me`                       | Update the logged-in user's profile.       | ✅             |
| **POST**   | `/api/users/me/records`               | Upload a medical record.                   | ✅             |
| **GET**    | `/api/users/me/records`               | Get all medical records for the user.      | ✅             |
| **DELETE** | `/api/users/me/records/:recordId`     | Delete a specific medical record.          | ✅             |
| **GET**    | `/api/professionals`                  | Get a list of verified professionals.      | ❌             |
| **GET**    | `/api/professionals/:id/availability` | Get available slots for a professional.    | ❌             |
| **POST**   | `/api/appointments`                   | Book a new appointment.                    | ✅             |
| **GET**    | `/api/appointments/me`                | Get appointment history for the user.      | ✅             |
| **POST**   | `/api/appointments/:id/reviews`       | Submit a review for an appointment.        | ✅             |
| **GET**    | `/api/clinics/search`                 | Search for nearby clinics via geolocation. | ❌             |
| **GET**    | `/api/clinics/:id`                    | Get details for a specific clinic.         | ❌             |
| **POST**   | `/api/clinics/doctors/:id/reviews`    | Submit a review for a clinic doctor.       | ✅             |
| **GET**    | `/api/clinics/doctors/:id/reviews`    | Get all reviews for a clinic doctor.       | ❌             |

