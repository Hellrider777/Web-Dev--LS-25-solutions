# 🚀 YouTube Clone - Deployment Guide

## 📋 Overview
Your YouTube Clone application is now fully configured with environment variables for easy deployment across different environments (development, staging, production).

## 🔧 Environment Setup

### Step 1: Create .env File
1. Copy the content from `environment_variables.txt`
2. Create a new file named `.env` in the `back-end` directory
3. Paste the environment variables into the `.env` file

### Step 2: Configure Environment Variables

#### 🏠 **Development Environment**
```bash
# .env file for development
POSTGRES_DB=ytclone_adhana
POSTGRES_USER=postgres
POSTGRES_PASSWORD=adhana0809
POSTGRES_HOST=localhost
POSTGRES_PORT=5433

SECRET_KEY=django-insecure--c$f)+=82+^8#^(6#9@)^t1x(nex$=t(&gq1of_*+4bh0s^!og
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,web,testserver

EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

#### 🌐 **Production Environment**
```bash
# .env file for production
POSTGRES_DB=your_production_db_name
POSTGRES_USER=your_production_db_user
POSTGRES_PASSWORD=your_secure_production_password
POSTGRES_HOST=your-production-db-host.com
POSTGRES_PORT=5432

SECRET_KEY=your-super-secret-production-key-here-make-it-long-and-random
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-email-password
```

## 🎯 Deployment Methods

### Method 1: Local Development
```bash
cd back-end
python manage.py runserver 8000
```

### Method 2: Docker Development
```bash
cd back-end
docker-compose up -d
```

### Method 3: Production with Docker
```bash
# Update .env for production
cd back-end
docker-compose -f docker-compose.prod.yml up -d
```

## 🔐 Security Best Practices

### 1. **Secret Key**
- Generate a new secret key for production
- Use Django's `get_random_secret_key()` function
- Never commit secret keys to version control

### 2. **Database Security**
- Use strong, unique passwords
- Enable SSL/TLS connections
- Restrict database access by IP

### 3. **Environment Variables**
- Never commit `.env` files to version control
- Use different `.env` files for different environments
- Keep production secrets secure

## 🏗️ Platform-Specific Deployment

### 🌊 **Heroku Deployment**
```bash
# Set environment variables
heroku config:set SECRET_KEY="your-secret-key"
heroku config:set DEBUG=False
heroku config:set POSTGRES_HOST="your-heroku-postgres-host"
heroku config:set POSTGRES_DB="your-heroku-db-name"
heroku config:set POSTGRES_USER="your-heroku-db-user"
heroku config:set POSTGRES_PASSWORD="your-heroku-db-password"
heroku config:set ALLOWED_HOSTS="your-app.herokuapp.com"
```

### ☁️ **AWS/DigitalOcean/VPS Deployment**
```bash
# Create .env file on server
scp .env user@server:/path/to/app/
# Or set environment variables in server configuration
export SECRET_KEY="your-secret-key"
export DEBUG=False
# ... other variables
```

### 🐳 **Docker Production Setup**
Create `docker-compose.prod.yml`:
```yaml
version: '3.9'

services:
  web:
    build: .
    command: gunicorn youtube_auth.wsgi:application --bind 0.0.0.0:8000
    volumes:
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    ports:
      - "8000:8000"
    env_file:
      - .env
    depends_on:
      - db

  db:
    image: postgres:14
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    env_file:
      - .env

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - static_volume:/app/staticfiles
      - media_volume:/app/media
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - web

volumes:
  postgres_data:
  static_volume:
  media_volume:
```

## 📊 Environment Variable Reference

| Variable | Description | Development | Production |
|----------|-------------|-------------|------------|
| `SECRET_KEY` | Django secret key | Default key | Strong random key |
| `DEBUG` | Debug mode | `True` | `False` |
| `POSTGRES_HOST` | Database host | `localhost` | Production DB host |
| `POSTGRES_PORT` | Database port | `5433` | `5432` |
| `POSTGRES_DB` | Database name | `ytclone_adhana` | Production DB name |
| `POSTGRES_USER` | Database user | `postgres` | Production DB user |
| `POSTGRES_PASSWORD` | Database password | `adhana0809` | Strong password |
| `ALLOWED_HOSTS` | Allowed hosts | `localhost,127.0.0.1` | `yourdomain.com` |
| `EMAIL_BACKEND` | Email backend | `console` | `smtp` |

## 🧪 Testing Different Environments

### Development Testing
```bash
cd back-end
python manage.py test
python manage.py runserver 8000
```

### Production Testing
```bash
# Test with production settings
cd back-end
DEBUG=False python manage.py check --deploy
python manage.py collectstatic --noinput
```

## 🚨 Troubleshooting

### Common Issues:
1. **Database Connection Error**: Check `POSTGRES_HOST` and `POSTGRES_PORT`
2. **Static Files Not Loading**: Run `python manage.py collectstatic`
3. **Email Not Sending**: Verify `EMAIL_HOST` and credentials
4. **Secret Key Error**: Ensure `SECRET_KEY` is set and not empty

### Environment-Specific Issues:
- **Development**: Ensure PostgreSQL is running on port 5433
- **Docker**: Check container connectivity and port mappings
- **Production**: Verify all environment variables are set correctly

## 📝 Checklist for Deployment

### Before Deployment:
- [ ] Create production `.env` file with secure values
- [ ] Generate new `SECRET_KEY` for production
- [ ] Set `DEBUG=False` for production
- [ ] Configure production database
- [ ] Set up proper `ALLOWED_HOSTS`
- [ ] Configure email backend
- [ ] Test migrations on staging environment

### After Deployment:
- [ ] Run `python manage.py migrate`
- [ ] Run `python manage.py collectstatic`
- [ ] Create superuser: `python manage.py createsuperuser`
- [ ] Test registration and login functionality
- [ ] Verify email verification system
- [ ] Check admin panel access

## 🎉 Success!
Your YouTube Clone is now environment-ready and can be deployed to any platform with proper configuration management! 