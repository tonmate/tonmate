# VPS Deployment with GitHub Actions

This document explains how to deploy the Tonmate platform to your VPS using GitHub Actions workflows that replicate your existing GitLab CI/CD pattern.

## Overview

We have created three GitHub Actions workflows for VPS deployment:

1. **`build.yml`** - Builds and pushes Docker images to registry
2. **`deploy-server.yml`** - Deploys to VPS via SSH (manual trigger)
3. **`migrations.yml`** - Runs database migrations (manual trigger)

## Required Setup

### 1. GitHub Secrets

Navigate to your repository → **Settings** → **Secrets and variables** → **Actions**

#### **Repository Secrets:**
| Secret Name | Description | Example |
|-------------|-------------|---------|
| `SSH_PRIVATE_KEY` | Private SSH key for VPS access | `-----BEGIN RSA PRIVATE KEY-----...` |
| `SSH_USER` | SSH username for VPS | `deploy` |
| `VPS_HOST` | VPS hostname or IP | `your-server.com` |
| `DEPLOYMENTS_ACCESS_TOKEN` | GitHub token for deployments repo | `ghp_xxxx` |
| `GITHUB_TOKEN` | GitHub Container Registry auth | Auto-provided by GitHub |
| `SENTRY_AUTH_TOKEN` | Sentry auth token (optional) | `sntrys_xxxx` |

#### **Application Secrets:**
| Secret Name | Description |
|-------------|-------------|
| `DATABASE_URL` | Production database URL |
| `NEXTAUTH_SECRET` | NextAuth secret |
| `OPENAI_API_KEY` | OpenAI API key |
| `JWT_SECRET` | JWT secret |
| `ENCRYPTION_KEY` | Encryption key |

### 2. GitHub Variables

Navigate to your repository → **Settings** → **Secrets and variables** → **Actions** → **Variables**

| Variable Name | Description | Example |
|---------------|-------------|---------|
| `DEPLOYMENTS_REPO` | Deployments repository | `your-org/deployments` |
| `NEXTAUTH_URL` | Application URL | `https://tonmate.com` |

### 3. VPS Server Setup

Your VPS must have:
- Docker and Docker Compose installed
- SSH access configured
- Access to your Docker registry
- Your deployments repository structure

## Deployment Workflows

### 1. Build Workflow (`build.yml`)

**Triggers:**
- Push to `main` branch → builds production image
- Push to `staging` branch → builds staging image
- Pull requests → builds test image

**What it does:**
1. Runs pre-release version extraction (production only)
2. Builds Docker image using Dockerfile from deployments repo
3. Pushes image to registry with appropriate tags
4. Cleans up old images

**Tags:**
- `main` branch: `v1.0.0` (from package.json) + `latest`
- `staging` branch: `staging`

### 2. Deploy Workflow (`deploy-server.yml`)

**Triggers:**
- Manual trigger via GitHub Actions UI
- Choose environment: `staging` or `production`
- Option to force container recreation

**What it does:**
1. Sets up SSH connection to VPS
2. Clones deployments repository on VPS
3. Logs into Docker registry
4. Pulls latest image for the environment
5. Deploys using Docker Compose
6. Cleans up temporary files

**SSH Commands executed on VPS:**
```bash
# Navigate to service directory
cd services/tonmate/production  # or staging

# Pull latest image
docker compose -p production pull tonmate-production

# Deploy
docker compose -p production up -d --build tonmate-production
```

### 3. Migrations Workflow (`migrations.yml`)

**Triggers:**
- Manual trigger via GitHub Actions UI
- Choose environment: `staging` or `production`
- Choose migration type: `deploy`, `reset`, or `generate`

**What it does:**
1. Downloads environment file from deployments repo
2. Installs dependencies
3. Runs specified migration command
4. Verifies completion

## Usage Instructions

### 1. Building Images

Images are built automatically on push to `main` or `staging` branches:

```bash
# Push to main → builds production image
git push origin main

# Push to staging → builds staging image  
git push origin staging
```

### 2. Deploying to VPS

Go to **Actions** → **Deploy to VPS** → **Run workflow**

1. Select environment: `staging` or `production`
2. Choose force recreation if needed
3. Click **Run workflow**

### 3. Running Migrations

Go to **Actions** → **Run Database Migrations** → **Run workflow**

1. Select environment: `staging` or `production`
2. Choose migration type:
   - `deploy`: Apply pending migrations
   - `reset`: Reset database (⚠️ destructive)
   - `generate`: Generate Prisma client
3. Click **Run workflow**

## Deployments Repository Structure

Your deployments repository should have this structure:

```
deployments/
├── services/
│   └── tonmate/  # or your project name
│       ├── Dockerfile
│       ├── production/
│       │   ├── docker-compose.yml
│       │   └── .env
│       └── staging/
│           ├── docker-compose.yml
│           └── .env
└── infrastructure/
    └── global/
        └── docker-compose.yml
```

### Sample docker-compose.yml:

```yaml
version: '3.8'

services:
  tonmate-production:
    image: ghcr.io/tonmate/tonmate:latest
    container_name: tonmate-production
    restart: unless-stopped
    env_file:
      - .env
    ports:
      - "3000:3000"
    depends_on:
      - db
      - redis
    
  db:
    image: postgres:15
    container_name: tonmate-db-production
    restart: unless-stopped
    environment:
      POSTGRES_DB: tonmate_production
      POSTGRES_USER: tonmate
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    
  redis:
    image: redis:7-alpine
    container_name: tonmate-redis-production
    restart: unless-stopped

volumes:
  postgres_data:
```

## Environment-Specific Configuration

### Production Environment
- Uses versioned tags (`v1.0.0`, `latest`)
- Requires manual approval for deployment
- Uses production environment variables
- Deploys to production containers

### Staging Environment
- Uses `staging` tag
- Automatic deployment on staging push
- Uses staging environment variables
- Deploys to staging containers

## Troubleshooting

### Common Issues

1. **SSH Connection Failed**
   - Check `SSH_PRIVATE_KEY` secret
   - Verify VPS firewall allows SSH
   - Test SSH access manually

2. **Docker Login Failed**
   - Check `DOCKER_REGISTRY_TOKEN` secret
   - Verify registry permissions
   - Test docker login manually

3. **Image Pull Failed**
   - Check if image exists in registry
   - Verify image tags match
   - Check registry authentication

4. **Migration Failed**
   - Check database connection
   - Verify `.env` file in deployments repo
   - Check migration files exist

### Debug Commands

```bash
# Check workflow logs in GitHub Actions
# Test SSH connection
ssh -i ~/.ssh/id_rsa user@your-server.com

# Check Docker images on VPS
docker images | grep tonmate

# Check running containers
docker ps | grep tonmate

# Check container logs
docker logs tonmate-production
```

## Security Best Practices

1. **SSH Keys**: Use dedicated deployment keys
2. **Secrets**: Never commit secrets to repository
3. **Registry**: Use private container registry
4. **VPS**: Limit SSH access to deployment user
5. **Environments**: Use different secrets for staging/production

## Monitoring

After deployment, monitor:
- Container health: `docker ps`
- Application logs: `docker logs tonmate-production`
- Database connections: Check database logs
- Application health: `curl https://your-domain.com/api/health`

---

For questions or issues, refer to the GitHub Actions logs or contact the development team.
