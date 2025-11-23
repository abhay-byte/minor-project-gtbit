# Render Deployment Configuration for Clinico Backend

## Overview
This document provides instructions for deploying the Clinico Express Node.js application to the Render platform in production mode.

## Prerequisites
- A Render account
- Access to the Clinico repository
- Environment variables properly configured

## Deployment Steps

### 1. Create New Web Service on Render
1. Log into your Render dashboard
2. Click "New +" and select "Web Service"
3. Connect to your GitHub/GitLab repository containing the Clinico backend
4. Select the repository with the Clinico backend code

### 2. Configuration Settings

#### Build Settings:
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm run start:prod`
- **Node Version**: Latest LTS (Node 18+)

#### Environment Variables:
Configure the following environment variables in the Render dashboard:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secure_jwt_secret
AI_SERVICE_AUTH_TOKEN=your_ai_service_auth_token
AI_SERVICE_API_KEY=your_ai_service_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. Package.json Scripts
The following scripts have been added to support Render deployment:

```json
{
  "scripts": {
    "build": "echo 'No build step required for Node.js'",
    "start:prod": "NODE_ENV=production node app.js"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### 4. Production Optimizations
The application includes the following production-specific optimizations:

- Security headers in HTTP responses
- Production-specific database pool settings
- Environment-aware configuration
- SSL termination handling
- Connection timeout configurations

### 5. Database Configuration
The PostgreSQL database connection is configured with production-appropriate settings:
- Max pool size: 10 connections
- Min pool size: 2 connections
- Idle timeout: 30 seconds
- Connection timeout: 2 seconds
- Max uses: 7500 (to handle Postgres connection limits)

### 6. Health Check
The application will be automatically monitored by Render. Configure health checks if needed:
- Health Check Path: (Leave blank to use default)

## Troubleshooting

### Common Issues:
1. **Database Connection Failures**: Ensure the DATABASE_URL is properly formatted and accessible
2. **Environment Variables Missing**: Verify all required environment variables are set in Render
3. **Port Binding**: The application will use the PORT environment variable provided by Render

### Logs:
- Check application logs in the Render dashboard under the "Logs" tab
- Look for any startup errors or runtime issues

## Scaling Recommendations
- Start with the free tier for development
- Upgrade to starter/standard tier based on traffic needs
- Monitor database connection usage and adjust pool settings if needed

## Security Considerations
- Store all secrets in Render's environment variables, never in code
- Use strong, unique values for JWT secrets and API keys
- Regularly rotate sensitive credentials
- Enable Render's security features as appropriate

## Additional Notes
- The application listens on the port specified by the `PORT` environment variable
- The `build` script is required by Render but performs no operation for this Node.js application
- The `start:prod` script sets the `NODE_ENV` to production for optimized performance