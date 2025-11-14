# Clinico AI Server (Flask)

## 🚀 Installation

### Prerequisites

Ensure **Python 3.x** is installed on your system.

------------------------------------------------------------------------

## 📦 Setup Instructions

### **Step 1: Install Poetry**

``` bash
pip install poetry
```

### **Step 2: Install Dependencies**

``` bash
poetry install --no-root
```

### **Step 3: Run Ingestion Script (One Time Only)**

``` bash
poetry run python ingest.py
```

------------------------------------------------------------------------

## ▶️ Running the Server

Start the Flask server using Poetry:

``` bash
poetry run flask --app main run --port 5001
```

Server will be available at:

    http://localhost:5001

------------------------------------------------------------------------

# 📘 API Documentation

This is the official API reference for the **Clinico AI Orchestrator &
Agents Service**.

------------------------------------------------------------------------

# 🔑 Authentication

Most protected endpoints require a **JWT Token**.

Send using:

    Authorization: Bearer <jwt_token>

The token is normally retrieved from the auth server (`{{node_url}}`).

------------------------------------------------------------------------

# 🤖 AI Agent Endpoints (Authenticated)

## **1. POST /v1/agent/orchestrate**

### Description

Main endpoint for all AI activities:\
- text queries\
- image + text queries\
- multi-step conversation flows\
- mental health crisis detection\
- routing to agents (Health, Mental Wellness, Care Coordination)

### Request Examples

#### **Simple Query**

``` json
{
  "query": "What are the symptoms of diabetes?"
}
```

#### **Image Query**

``` json
{
  "query": "What is this rash on my arm?",
  "image": "data:image/png;base64,{{sample_base64_image}}"
}
```

#### **Multi-step Conversation**

``` json
{
  "query": "virtual",
  "conversation_state": {
    "step": "select_type"
  }
}
```

------------------------------------------------------------------------

## **2. POST /v1/agent/analyze-image**

Analyzes an image independently.

### Request

``` json
{
  "image": "data:image/png;base64,{{sample_base64_image}}",
  "type": "skin"
}
```

Supported `type` values:\
`general`, `prescription`, `skin`, `lab_report`, `xray`

------------------------------------------------------------------------

# 🩺 Health & Monitoring Endpoints (Public)

## **1. GET /v1/health**

Basic health check.

## **2. GET /v1/health/detailed**

Detailed health status including dependent services.

## **3. GET /v1/collections**

Lists all vector DB (ChromaDB) collections.

## **4. GET /v1/metrics**

Summary of request metrics & monitoring.

## **5. GET /v1/metrics/errors**

Recent errors. Optional:

    ?vlimit=5

------------------------------------------------------------------------

# ⚙️ Utility Endpoints (Authenticated)

## **1. GET /v1/rate-limit/status**

Shows rate-limit usage per user.

------------------------------------------------------------------------

# ❌ Error Handling

  Code      Meaning
  --------- -------------------------------------------
  **400**   Bad request (malformed or missing fields)
  **401**   Invalid or expired JWT
  **403**   Missing authentication header
  **500**   Internal server error

------------------------------------------------------------------------

# ✅ You're Ready!

Your Clinico AI Backend is now fully documented and ready to integrate.
