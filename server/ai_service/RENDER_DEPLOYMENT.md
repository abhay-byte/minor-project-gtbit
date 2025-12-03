# Render Deployment Configuration for Clinico AI Service

## Overview
This document provides instructions for deploying the Clinico Flask AI service to the Render platform. This service handles AI chat functionality and uses ChromaDB for vector storage.

## Prerequisites
- A Render account
- Access to the Clinico repository
- Environment variables properly configured
- ChromaDB files committed to GitHub in the `server/ai_service/db/` directory

## Deployment Steps

### 1. Create New Web Service on Render
1. Log into your Render dashboard
2. Click "New +" and select "Web Service"
3. Connect to your GitHub/GitLab repository containing the Clinico backend
4. Select the repository with the Clinico backend code

### 2. Configuration Settings

#### Build Settings:
- **Environment**: Python
- **Build Command**: `./server/ai_service/build.sh`
- **Start Command**: `./server/ai_service/start.sh`
- **Python Version**: 3.11

#### Environment Variables:
Configure the following environment variables in the Render dashboard:

```
PYTHON_VERSION=3.11
POETRY_VERSION=latest
PYTHONUNBUFFERED=1
PORT=10000  # Automatically set by Render
OLLAMA_BASE_URL=https://your-ollama-service.onrender.com  # If using external Ollama
```

### 3. Important Notes About Database Handling

#### The Build vs Runtime Issue
**Problem**: On Render, build artifacts do NOT transfer to runtime containers. Even though the ChromaDB files exist in Git and are verified during build, they're not available when the service starts because build and runtime are separate containers.

#### Solution: Database Download at Runtime
Our `start.sh` script automatically downloads the ChromaDB files from GitHub at runtime:
- Downloads `chroma.sqlite3` from the GitHub repository
- Downloads all collection directories and their files
- Verifies the database exists before starting the application

**GitHub URL**: `https://github.com/abhay-byte/minor-project-gtbit/tree/api/server/ai_service/db/`

### 4. Expected Deployment Flow

#### First Deploy
```
1. Build Phase (1-2 min):
   ✅ Install dependencies
   ✅ Build completes

2. Deploy/Start Phase (30-60 sec):
   📥 Download chroma.sqlite3 (~7MB)
   📥 Download collection directories
   ✅ Verify database
   🚀 Start Gunicorn
   ✅ Service available
```

#### Subsequent Deploys / Restarts
```
Same as first deploy:
- Database downloaded fresh each time
- Takes 30-60 seconds
- Consistent and reliable
```

### 5. Health Check
Configure health check in Render dashboard:
- **Health Check Path**: `/v1/health`

### 6. Scaling Recommendations
- Start with the free tier for development
- Upgrade to starter/standard tier based on traffic needs
- Monitor memory usage as the AI service can be memory-intensive

## Troubleshooting

### Common Issues:

1. **Database Download Failures**: Verify that the ChromaDB files exist in the GitHub repository at `server/ai_service/db/`

2. **Timeout Issues**: Increase timeout settings if the database download takes longer than expected

3. **Environment Variables Missing**: Ensure all required environment variables are set in Render

### Logs:
- Check application logs in the Render dashboard under the "Logs" tab
- Look for database download progress and any startup errors

## Security Considerations
- Store all secrets in Render's environment variables, never in code
- Use strong, unique values for any API keys
- Regularly rotate sensitive credentials
- Enable Render's security features as appropriate

## Additional Notes
- The service will automatically download the latest database from GitHub on each startup
- The application uses Gunicorn with 2 workers for production performance
- Database files are version-controlled in Git and downloaded at runtime for reliability