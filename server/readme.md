# 🚀 Clinico - Backend API Server

This directory contains the complete backend server for the **Clinico** platform, built with **Node.js**, **Express**, and **PostgreSQL**.  
It provides a RESTful API for all application functionalities, including **user authentication**, **profile management**, **appointment booking**, and **hyperlocal clinic discovery**.


## 🧩 Folder Structure

```
server/
├── database/      # Database configuration, Docker files, and management scripts
├── src/           # Application source code (routes, controllers, models)
├── run_server.bat        # Windows smart startup script
└── run_server.sh         # Linux/macOS smart startup script
````


## ⚙️ Requirements

Before you begin, ensure that the following are installed and running:

- **Node.js** (v18 or higher)
- **Docker Desktop**

---

## ▶️ Getting Started

### 1. Configure Your Environment

The server requires a `.env` file to store your secret credentials.  
A template is provided for you.

#### Create the `.env` file

In your terminal, navigate to the `/server` directory and run the command for your operating system:

**For Windows (Command Prompt / PowerShell):**
```bash
copy src\.env.example src\.env
````

**For Linux / macOS:**

```bash
cp src/.env.example src/.env
```

#### Edit the `.env` file

Open the newly created `src/.env` file in your code editor and fill in your unique credentials,
especially your **JWT_SECRET** and your **Cloudinary API keys**.

---

### 2. Run the Server

The smart startup scripts handle everything from checking dependencies
to seeding the database on the first run.

**On Windows:**

```bash
.\run_server.bat
```

**On Linux / macOS:**

```bash
chmod +x run_server.sh
./run_server.sh
```

The server will start automatically, and you can access the API at:
👉 [http://localhost:5000](http://localhost:5000)


## 🌱 Seeded Default Test Data

When you run the setup script for the first time, the database is populated with the following sample data,
which you can use for testing.

### 🔐 Login Credentials

| Role         | Email                                                       | Password    |
| ------------ | ----------------------------------------------------------- | ----------- |
| Patient      | [priya.sharma@example.com](mailto:priya.sharma@example.com) | password123 |
| Professional | [amit.patel@example.com](mailto:amit.patel@example.com)     | password123 |
| Admin        | [admin@clinico.com](mailto:admin@clinico.com)               | password123 |


### 🩺 Sample Professionals

| Name           | Specialty            | Status   |
| -------------- | -------------------- | -------- |
| Dr. Amit Patel | Psychiatrist         | Verified |
| Anjali Singh   | General Practitioner | Verified |


### 🏥 Sample Clinics

| Name                  | Location  |
| --------------------- | --------- |
| City General Hospital | New Delhi |
| Metro Clinic          | Mumbai    |


### 📡 API Endpoint Available

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



## 📘 Related Documentation

* [Database Setup Guide](#)
* [API Source Code Guide](#)

