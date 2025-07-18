# GitHub Actions Workflows

This directory contains GitHub Actions workflows for the Tonmate platform.

## Workflows Overview

### 🧪 Testing & Quality Assurance
- **`ci.yml`** - Continuous Integration pipeline (runs on all pushes/PRs)
- **`deploy.yml`** - Test pipeline (runs tests for main/staging branches)
- **`release.yml`** - Release pipeline (runs on git tags)

### 🐳 Docker & Deployment
- **`build.yml`** - Builds and pushes Docker images to registry
- **`deploy-server.yml`** - Deploys to VPS via SSH (manual trigger)
- **`migrations.yml`** - Runs database migrations (manual trigger)

## Quick Start

### 1. Set up secrets
See [`docs/GITHUB_SECRETS.md`](../../docs/GITHUB_SECRETS.md) for complete setup instructions.

### 2. Build and Deploy
```bash
# Push to main → builds production image
git push origin main

# Deploy to production (manual)
# Go to Actions → Deploy to VPS → Run workflow
```

### 3. Run migrations
```bash
# Go to Actions → Run Database Migrations → Run workflow
```

## Deployment Pattern

This replicates your GitLab CI pattern:

1. **Build Stage**: `build.yml` builds Docker images
2. **Deploy Stage**: `deploy-server.yml` deploys via SSH
3. **Migrations**: `migrations.yml` runs database operations

## Environment Support

- **Production**: `main` branch → versioned tags
- **Staging**: `staging` branch → staging tag

## Documentation

- 📋 [VPS Deployment Guide](../../docs/VPS_DEPLOYMENT.md)
- 🔐 [GitHub Secrets Setup](../../docs/GITHUB_SECRETS.md)
- 🐳 [Docker Setup](../../docs/DOCKER.md)

## Manual Workflows

Some workflows require manual triggering for security:

- **Deploy to VPS**: Manual deployment to staging/production
- **Database Migrations**: Manual database operations
- **Release**: Triggered by git tags

---

**Need help?** Check the workflow logs in the Actions tab or see the documentation above.
