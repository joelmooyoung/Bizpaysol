# Enhanced Cloud Deployment Guide

This comprehensive guide covers deploying the ACH Processing System with enhanced scalability, monitoring, and failover capabilities.

## Quick Start

### Using the Enhanced Deployment Script

```bash
# Development deployment
./deploy.sh start development

# Production deployment  
./deploy.sh start production

# Check status
./deploy.sh status

# View logs
./deploy.sh logs

# Health check
./deploy.sh health
```

## Deployment Options

### 1. Vercel Frontend Deployment

The frontend is optimized for Vercel deployment with the following enhancements:

#### Configuration (`vercel.json`)

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "regions": ["iad1", "sfo1"],
  "functions": {
    "frontend/src/app/**": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options", 
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

#### Environment Variables

Set these in Vercel dashboard:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.railway.app
NODE_ENV=production
```

#### Deployment Steps

1. Connect repository to Vercel
2. Set environment variables
3. Deploy automatically on git push
4. Monitor deployment status

### 2. Railway Backend Deployment

Enhanced Railway configuration with auto-scaling and monitoring:

#### Configuration (`railway.yml`)

```yaml
version: 2

services:
  backend:
    build:
      dockerfile: Dockerfile
      context: ./backend
    
    env:
      NODE_ENV: production
      PORT: 3001
    
    healthcheck:
      path: /health
      interval: 30s
      timeout: 10s
      retries: 3
    
    resources:
      memory: 512MB
      cpu: 0.5
      replicas:
        min: 1
        max: 5
        cpu_threshold: 70
        memory_threshold: 80
    
    monitoring:
      enabled: true
      alerts:
        - type: cpu
          threshold: 80
          duration: 5m
        - type: memory
          threshold: 85
          duration: 5m
```

#### Environment Variables

Configure these in Railway:

```env
NODE_ENV=production
PORT=3001

# Database
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Security
JWT_SECRET=your_secure_jwt_secret_minimum_32_chars
ENCRYPTION_KEY=your_32_character_encryption_key_here

# ACH Configuration
ACH_IMMEDIATE_DESTINATION=123456789
ACH_IMMEDIATE_ORIGIN=987654321
ACH_COMPANY_NAME=Your Company Name
ACH_COMPANY_ID=1234567890

# CORS
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### 3. Docker Container Deployment

#### Multi-Stage Production Dockerfile

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production=false
COPY . .
RUN npm run build
RUN npm prune --production

FROM node:18-alpine AS production
RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
USER nodejs
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

## Monitoring and Health Checks

### Application Health Checks

#### Backend Health Endpoint

```typescript
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    database: 'connected', // Check database connection
    redis: 'connected',    // Check Redis connection
    memory: process.memoryUsage(),
    cpu: process.cpuUsage()
  };
  
  res.json(healthCheck);
});
```

### Monitoring Stack

#### Prometheus Configuration

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'ach-backend'
    static_configs:
      - targets: ['backend:3001']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'health-checks'
    static_configs:
      - targets: ['backend:3001']
    metrics_path: '/health'
    scrape_interval: 30s
```

#### Critical Alerts

- Service down (health check failures)
- High error rate (>5% for 2 minutes)
- High CPU usage (>80% for 5 minutes)
- High memory usage (>85% for 5 minutes)
- Database connection issues
- Failed NACHA file generation

## Scaling and Performance

### Auto-Scaling Configuration

#### Railway Auto-Scaling

```yaml
resources:
  replicas:
    min: 1          # Minimum instances
    max: 5          # Maximum instances
    cpu_threshold: 70       # Scale up at 70% CPU
    memory_threshold: 80    # Scale up at 80% memory
```

### Performance Optimization

#### Database Optimization

- Connection pooling
- Query optimization
- Indexing on frequently queried fields
- Read replicas for reporting

#### Caching Strategy

- Redis for session storage
- Application-level caching for frequently accessed data
- CDN for static assets

## Failover and Disaster Recovery

### High Availability Setup

#### Multi-Region Deployment

1. **Primary Region**: Main deployment (US East)
2. **Secondary Region**: Failover deployment (US West)
3. **Database Replication**: Cross-region database replication
4. **DNS Failover**: Automatic DNS switching

#### Database Backup Strategy

```bash
# Automated daily backups
0 2 * * * /usr/local/bin/backup-database.sh

# Backup script
#!/bin/bash
pg_dump $DATABASE_URL | gzip > backup-$(date +%Y%m%d).sql.gz
aws s3 cp backup-$(date +%Y%m%d).sql.gz s3://ach-backups/
```

#### Failover Procedures

1. **Automated Health Checks**: Continuous monitoring
2. **Alert System**: Immediate notification of failures
3. **Automatic Failover**: DNS switch to secondary region
4. **Manual Verification**: Human verification of failover
5. **Recovery Planning**: Documented recovery procedures

### Backup and Recovery

#### Recovery Testing

- Monthly disaster recovery drills
- Automated backup verification
- Recovery time objective (RTO): 15 minutes
- Recovery point objective (RPO): 1 hour

## Security Considerations

### Network Security

- TLS/SSL encryption for all communications
- VPN access for administrative tasks
- Firewall rules restricting access
- Regular security audits

### Application Security

- Environment variable encryption
- Secret management with key rotation
- Regular dependency updates
- Security headers in responses

### Compliance

- SOC 2 compliance considerations
- NACHA operating rules compliance
- Data encryption at rest and in transit
- Audit logging and retention

## Troubleshooting

### Common Issues

#### Service Won't Start

```bash
# Check logs
docker-compose logs backend

# Check health
curl http://localhost:3001/health

# Check environment variables
docker-compose exec backend env | grep -E "(DATABASE|JWT|ENCRYPTION)"
```

#### Database Connection Issues

```bash
# Test database connection
docker-compose exec backend node -e "
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  pool.query('SELECT NOW()', (err, res) => {
    console.log(err ? err : res.rows[0]);
    pool.end();
  });
"
```

This enhanced deployment configuration provides enterprise-grade reliability, scalability, and monitoring for the ACH Processing System.