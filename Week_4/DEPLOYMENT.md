# Deployment Guide for YouTube Clone

This guide explains the DevOps files added for production deployment.

## Files Added

### Frontend Files

- **`front-end/Dockerfile`**: Multi-stage Docker build for React app with Nginx
- **`front-end/nginx.conf`**: Nginx configuration for serving React SPA
- **`front-end/.env.example`**: Example environment variables for frontend
- **`front-end/src/config.js`**: Centralized API configuration (you need to use this in your components)

### Backend Files

- **`back-end/Dockerfile.prod`**: Production Dockerfile with Gunicorn

### Root Files

- **`docker-compose.prod.yml`**: Production docker-compose configuration

## Important: Application Code Changes Required

### You MUST update your React components to use the API configuration:

**In your React components, replace hardcoded API URLs with:**

```javascript
import API_CONFIG from '../config';

// Example: Instead of fetch('http://localhost:8000/api/videos/')
fetch(API_CONFIG.endpoints.videos);

// For dynamic endpoints:
fetch(API_CONFIG.endpoints.videoDetail(videoId));
```

**Search for all API calls in your React components and update them to use `API_CONFIG`.**

## Environment Variables

### Frontend (.env in front-end directory)

```env
REACT_APP_API_URL=http://your-domain.com:8000
```

### Backend (update back-end/.env for production)

```env
# Database (AWS RDS)
POSTGRES_HOST=your-rds-endpoint.rds.amazonaws.com
POSTGRES_PORT=5432
POSTGRES_DB=ytclone_production
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password

# Django
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com,ec2-ip-address

# Email (AWS SES)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-ses-smtp-username
EMAIL_HOST_PASSWORD=your-ses-smtp-password
DEFAULT_FROM_EMAIL=noreply@your-domain.com
```

## Deployment Steps

1. **Update React components** to use API_CONFIG
2. **Configure environment variables** for production
3. **Build and run** with docker-compose:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

## Notes

- Frontend runs on port 80 (HTTP)
- Backend API runs on port 8000
- For production, add SSL/HTTPS with a reverse proxy (Nginx or load balancer)
- Media files and static files are persisted in Docker volumes
