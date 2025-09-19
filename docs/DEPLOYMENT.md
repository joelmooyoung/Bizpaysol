# Deployment Guide

## Overview

This guide covers deploying the ACH Processing System to production using the recommended tech stack:
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Supabase

## Prerequisites

- Git repository with your code
- Supabase account
- Railway account  
- Vercel account
- Domain names (optional)

## Database Deployment (Supabase)

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Choose a project name and password
3. Select a region close to your users
4. Wait for the project to be created

### 2. Set Up Database Schema

1. Navigate to the SQL Editor in your Supabase dashboard
2. Copy the contents of `database/schema.sql`
3. Paste and execute the SQL to create tables, indexes, and RLS policies
4. Verify all tables were created successfully

### 3. Configure Environment Variables

Note down these values from your Supabase project settings:
- `SUPABASE_URL`: Your project URL
- `SUPABASE_ANON_KEY`: Anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (keep secret)

## Backend Deployment (Railway)

### 1. Connect Repository

1. Go to [Railway](https://railway.app) and create a new project
2. Connect your GitHub repository
3. Select the backend deployment option
4. Choose the `backend` directory as the root

### 2. Configure Environment Variables

Add these environment variables in Railway:

```env
NODE_ENV=production
PORT=3001

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_very_long_random_jwt_secret_key_here
JWT_EXPIRE=7d

# Encryption Configuration (32 characters)
ENCRYPTION_KEY=your_32_character_encryption_key_here

# ACH Configuration
ACH_IMMEDIATE_DESTINATION=123456789
ACH_IMMEDIATE_ORIGIN=987654321
ACH_COMPANY_NAME=Your Company Name
ACH_COMPANY_ID=1234567890

# SFTP Configuration (optional)
SFTP_HOST=your_sftp_host
SFTP_PORT=22
SFTP_USERNAME=your_sftp_username
SFTP_PASSWORD=your_sftp_password

# Frontend URL for CORS
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### 3. Deploy

1. Railway will automatically deploy when you push to your main branch
2. Note the generated Railway URL (e.g., `https://your-app.railway.app`)
3. Test the health endpoint: `https://your-app.railway.app/health`

### 4. Custom Domain (Optional)

1. In Railway, go to your service settings
2. Add your custom domain
3. Configure DNS records as instructed
4. Enable HTTPS (automatic with Railway)

## Frontend Deployment (Vercel)

### 1. Connect Repository

1. Go to [Vercel](https://vercel.com) and create a new project
2. Import your GitHub repository
3. Select the `frontend` directory as the root directory
4. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 2. Configure Environment Variables

Add these environment variables in Vercel:

```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_APP_NAME=ACH Processing System
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 3. Deploy

1. Click "Deploy" to start the deployment
2. Vercel will build and deploy your application
3. Test the deployment at your Vercel URL

### 4. Custom Domain (Optional)

1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Configure DNS records as instructed
4. HTTPS is automatic with Vercel

## Post-Deployment Configuration

### 1. Update CORS Settings

Update your backend environment variables to include your frontend domain:

```env
FRONTEND_URL=https://your-frontend-domain.com
```

### 2. Create Admin User

1. Use the default admin credentials to log in:
   - Email: `admin@achprocessing.com`
   - Password: `admin123`
2. **Immediately change the password** after first login
3. Create additional users as needed

### 3. Configure System Settings

1. Log in as admin
2. Navigate to Settings
3. Configure:
   - ACH company information
   - SFTP/FTP settings for file transmission
   - Federal holidays for the current year

### 4. Test the System

1. Create a test ACH transaction
2. Generate a NACHA file
3. Validate the file format
4. Test SFTP transmission (if configured)

## Security Considerations

### 1. Environment Variables

- Use strong, unique passwords and keys
- Never commit secrets to your repository
- Rotate JWT secrets regularly
- Use different encryption keys for different environments

### 2. Database Security

- Enable Row Level Security (RLS) policies
- Regular database backups
- Monitor access logs
- Use connection pooling in production

### 3. API Security

- Enable rate limiting
- Monitor for suspicious activity
- Use HTTPS everywhere
- Implement proper logging

### 4. Network Security

- Configure firewalls appropriately
- Use VPN for admin access if needed
- Implement IP whitelisting for SFTP
- Regular security audits

## Monitoring and Maintenance

### 1. Application Monitoring

Set up monitoring for:
- Application uptime
- Response times
- Error rates
- Resource usage

### 2. Database Monitoring

Monitor:
- Connection pool usage
- Query performance
- Storage usage
- Backup status

### 3. Log Management

Configure logging for:
- Authentication attempts
- Transaction processing
- File generation
- System errors

### 4. Backup Strategy

Implement:
- Daily database backups
- File storage backups
- Configuration backups
- Disaster recovery procedures

## Scaling Considerations

### 1. Database Scaling

- Monitor connection limits
- Consider read replicas for reporting
- Implement connection pooling
- Archive old transaction data

### 2. API Scaling

- Railway auto-scales based on demand
- Monitor resource usage
- Consider caching strategies
- Implement database connection pooling

### 3. File Storage

- Consider cloud storage for NACHA files
- Implement file retention policies
- Monitor storage usage
- Consider CDN for static assets

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check FRONTEND_URL environment variable
   - Verify domain configuration
   - Check browser console for specific errors

2. **Database Connection Issues**
   - Verify Supabase credentials
   - Check connection string format
   - Monitor connection pool usage

3. **Authentication Problems**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Verify user roles and permissions

4. **NACHA File Issues**
   - Validate transaction data
   - Check ACH configuration
   - Verify business day calculations

### Health Checks

Monitor these endpoints:
- `GET /health` - API health check
- Database connectivity test
- SFTP connection test (if configured)

### Performance Optimization

1. **Database**
   - Add indexes for frequent queries
   - Optimize query patterns
   - Consider materialized views for reports

2. **API**
   - Implement response caching
   - Optimize payload sizes
   - Use compression

3. **Frontend**
   - Implement lazy loading
   - Optimize bundle sizes
   - Use Next.js optimizations

## Support and Maintenance

### Regular Tasks

- [ ] Monitor system health
- [ ] Review security logs
- [ ] Update dependencies
- [ ] Backup verification
- [ ] Performance monitoring
- [ ] User access review

### Monthly Tasks

- [ ] Security audit
- [ ] Database optimization
- [ ] Certificate renewal check
- [ ] Dependency updates
- [ ] Performance review

### Quarterly Tasks

- [ ] Disaster recovery test
- [ ] Security penetration test
- [ ] Compliance review
- [ ] Capacity planning
- [ ] Documentation updates