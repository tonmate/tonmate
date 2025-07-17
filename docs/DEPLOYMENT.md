# Deployment Guide - Tonmate

## Overview

This guide provides comprehensive instructions for deploying the Tonmate platform to production environments. The platform supports multiple deployment strategies including Docker, Vercel, and traditional server deployment.

## Prerequisites

- **Node.js**: Version 20.x or higher
- **Database**: PostgreSQL 14+ (required)
- **Redis**: For caching and session storage (optional but recommended)
- **Domain**: SSL certificate for HTTPS
- **AI API Keys**: OpenAI, Anthropic, or Cohere

## Quick Start

### Option 1: One-Click Setup
```bash
# Clone repository
git clone <repository-url>
cd customer-support-ai-agent

# Complete setup with one command
npm run setup:complete
```

### Option 2: Manual Setup
```bash
# Install dependencies
npm install

# Setup environment
npm run setup:env

# Generate secrets
npm run setup:secrets

# Setup database
npm run db:push

# Start development server
npm run dev
```

## Environment Configuration

### 1. Copy Environment Template
```bash
cp environment.example .env.local
```

### 2. Configure Required Variables

#### Authentication
```env
NEXTAUTH_SECRET=your-32-character-secret
NEXTAUTH_URL=https://your-domain.com
```

#### Database
```env
# Development (PostgreSQL)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tonmate

# Production (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

#### AI Providers
```env
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
COHERE_API_KEY=your-cohere-key
```

#### Security
```env
ENCRYPTION_KEY=your-encryption-key
JWT_SECRET=your-jwt-secret
```

### 3. Validate Configuration
```bash
npm run validate:env
```

## Deployment Methods

### Method 1: Docker Deployment (Recommended)

#### Prerequisites
- Docker 24.x or higher
- Docker Compose v2.x or higher

#### Single Container
```bash
# Build image
npm run docker:build

# Run container
npm run docker:run
```

#### Full Stack with Docker Compose
```bash
# Start all services
npm run docker:compose

# Start with rebuild
npm run docker:compose:build

# View logs
npm run logs:app
npm run logs:db

# Stop services
npm run docker:compose:down
```

#### Docker Compose Services
- **App**: Next.js application
- **Database**: PostgreSQL 15
- **Redis**: Caching and sessions
- **Nginx**: Reverse proxy (optional)

### Method 2: Vercel Deployment

#### Setup
1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Configure environment variables in Vercel dashboard
3. Deploy:
```bash
npm run deploy:vercel
```

#### Vercel Configuration
Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "DATABASE_URL": "@database-url",
    "OPENAI_API_KEY": "@openai-api-key"
  }
}
```

### Method 3: Traditional Server Deployment

#### Ubuntu/Debian Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Install PM2 for process management
sudo npm install -g pm2

# Clone and setup application
git clone <repository-url>
cd customer-support-ai-agent
npm install
npm run build:production

# Start with PM2
pm2 start npm --name "support-agent" -- start
pm2 startup
pm2 save
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/health {
        proxy_pass http://localhost:3000;
        access_log off;
    }
}
```

## Database Setup

### PostgreSQL Setup
```bash
# Create database
sudo -u postgres createdb support_agent

# Create user
sudo -u postgres psql
CREATE USER support_agent WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE support_agent TO support_agent;
\q

# Update DATABASE_URL
DATABASE_URL=postgresql://support_agent:your-password@localhost:5432/support_agent
```

### Database Migration
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or use migrations (recommended for production)
npm run db:migrate
npm run db:deploy
```

## Security Configuration

### 1. Firewall Setup
```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. SSL Certificate
```bash
# Using Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 3. Security Headers
Already configured in middleware. Additional Nginx security:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

## Monitoring and Logging

### Application Monitoring
```bash
# View application logs
npm run logs:app

# Monitor with PM2
pm2 logs
pm2 monit

# Check health
npm run health:check
```

### Database Monitoring
```bash
# Check database status
sudo systemctl status postgresql

# Monitor connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# Database performance
sudo -u postgres psql -c "SELECT * FROM pg_stat_database;"
```

### Log Management
Logs are stored in:
- Application: `/var/log/pm2/`
- Nginx: `/var/log/nginx/`
- PostgreSQL: `/var/log/postgresql/`

## Backup Strategy

### Database Backup
```bash
# Create backup
npm run backup:db

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > /backup/support_agent_$DATE.sql
find /backup -name "support_agent_*.sql" -mtime +7 -delete
```

### File Backup
```bash
# Backup uploads and configuration
tar -czf /backup/app_files_$(date +%Y%m%d).tar.gz \
    /app/uploads \
    /app/.env.local \
    /app/package.json
```

## Performance Optimization

### 1. Enable Caching
```env
# Redis configuration
REDIS_URL=redis://localhost:6379
CACHE_ENABLED=true
```

### 2. Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_knowledge_sources_agent_id ON knowledge_sources(agent_id);
CREATE INDEX idx_conversations_agent_id ON conversations(agent_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
```

### 3. CDN Configuration
For static assets, configure CDN:
```env
NEXT_PUBLIC_CDN_URL=https://cdn.your-domain.com
```

## Scaling Considerations

### Horizontal Scaling
```bash
# Load balancer configuration
upstream support_agent {
    server app1.internal:3000;
    server app2.internal:3000;
    server app3.internal:3000;
}

server {
    location / {
        proxy_pass http://support_agent;
    }
}
```

### Database Scaling
- **Read Replicas**: For read-heavy workloads
- **Connection Pooling**: Use PgBouncer
- **Sharding**: For very large datasets

## Health Checks

### Application Health
```bash
# Health check endpoint
curl -f http://localhost:3000/api/health

# Detailed health check
curl -f http://localhost:3000/api/health?detailed=true
```

### Monitoring Script
```bash
#!/bin/bash
# health-check.sh
HEALTH_URL="http://localhost:3000/api/health"
SLACK_WEBHOOK="your-slack-webhook-url"

if ! curl -f $HEALTH_URL > /dev/null 2>&1; then
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"🚨 Support Agent is down!"}' \
        $SLACK_WEBHOOK
fi
```

## Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database status
sudo systemctl status postgresql

# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

#### Memory Issues
```bash
# Check memory usage
free -h
htop

# Optimize Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

#### SSL Issues
```bash
# Test SSL certificate
openssl s_client -connect your-domain.com:443

# Renew certificate
sudo certbot renew
```

### Debug Mode
```bash
# Enable debug logging
LOG_LEVEL=debug npm start

# Debug specific component
DEBUG=agent:* npm start
```

## Maintenance

### Regular Tasks
1. **Daily**: Monitor logs and health checks
2. **Weekly**: Review performance metrics
3. **Monthly**: Update dependencies and security patches
4. **Quarterly**: Review and rotate secrets

### Update Process
```bash
# 1. Backup current version
npm run backup:db

# 2. Update code
git pull origin main
npm install

# 3. Run migrations
npm run db:migrate

# 4. Build and restart
npm run build:production
pm2 restart support-agent

# 5. Verify deployment
npm run health:check
```

## Support

### Getting Help
- **Documentation**: Check README.md and API.md
- **Logs**: Review application and system logs
- **Community**: GitHub Issues and Discussions
- **Emergency**: Contact system administrator

### Monitoring Alerts
Set up alerts for:
- Application downtime
- Database connection failures
- High memory usage
- SSL certificate expiration
- Disk space usage

---

## Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Backup strategy implemented
- [ ] Monitoring set up

### Post-Deployment
- [ ] Health check passing
- [ ] Application accessible
- [ ] Database connected
- [ ] AI agents working
- [ ] Knowledge processing functional
- [ ] User authentication working

### Production Readiness
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Performance optimized
- [ ] Monitoring configured
- [ ] Backup verified
- [ ] Team trained

---

*This deployment guide is for Tonmate v1.0.0. For updates and additional information, see the project repository.*
