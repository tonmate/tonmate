# GitHub Container Registry Setup

This document explains how we've configured GitHub Container Registry (ghcr.io) to replace your GitLab Container Registry for Docker image storage and deployment.

## Overview

**Previous Setup (GitLab):**
- GitLab CI pushed images to GitLab Container Registry
- Deployment pulled images from GitLab registry

**New Setup (GitHub):**
- GitHub Actions push images to GitHub Container Registry (`ghcr.io`)
- VPS deployment pulls images from GitHub Container Registry

## Registry Configuration

### 📦 **Image Location:**
```
ghcr.io/tonmate/tonmate:latest         # Production
ghcr.io/tonmate/tonmate:v1.0.0         # Version tagged
ghcr.io/tonmate/tonmate:staging        # Staging
```

### 🔐 **Authentication:**
- **Build**: Uses `${{ secrets.GITHUB_TOKEN }}` (automatically provided)
- **Deploy**: Uses `${{ secrets.GITHUB_TOKEN }}` (automatically provided)
- **Manual**: `docker login ghcr.io -u USERNAME -p TOKEN`

## Workflow Integration

### 1. **Build Workflow (`build.yml`)**
```yaml
env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}  # tonmate/tonmate

steps:
  - name: Login to GitHub Container Registry
    uses: docker/login-action@v3
    with:
      registry: ghcr.io
      username: ${{ github.actor }}
      password: ${{ secrets.GITHUB_TOKEN }}
```

### 2. **Deploy Workflow (`deploy-server.yml`)**
```yaml
# On VPS via SSH:
echo '${{ secrets.GITHUB_TOKEN }}' | docker login ghcr.io -u '${{ github.actor }}' --password-stdin
docker compose pull tonmate-production
```

## Image Tagging Strategy

| Branch | Tag | Usage |
|--------|-----|-------|
| `main` | `v1.0.0` + `latest` | Production deployment |
| `staging` | `staging` | Staging deployment |
| PRs | `pr-123` | Testing only |

## Benefits over GitLab Registry

✅ **Integrated**: Native GitHub integration, no separate registry setup  
✅ **Automatic Auth**: Uses GitHub tokens, no manual credential management  
✅ **Free**: Unlimited public images, generous private image limits  
✅ **Fast**: Optimized for GitHub Actions workflows  
✅ **Secure**: Automatic token rotation and permission management  

## Repository Settings

### 1. **Package Permissions**
Go to your repository → **Settings** → **Actions** → **General**
- Enable: "Read and write permissions" for `GITHUB_TOKEN`

### 2. **Package Visibility**
Go to your repository → **Packages** (after first push)
- Set visibility: Private (recommended for production)
- Manage access: Add team members as needed

## Docker Compose Configuration

Update your `docker-compose.yml` files to use GitHub Container Registry:

### Production (`services/tonmate/production/docker-compose.yml`):
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
```

### Staging (`services/tonmate/staging/docker-compose.yml`):
```yaml
version: '3.8'

services:
  tonmate-staging:
    image: ghcr.io/tonmate/tonmate:staging
    container_name: tonmate-staging
    restart: unless-stopped
    env_file:
      - .env
    ports:
      - "3001:3000"
```

## Manual Operations

### 1. **Pull Images Manually**
```bash
# Login to registry
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin

# Pull specific image
docker pull ghcr.io/tonmate/tonmate:latest
docker pull ghcr.io/tonmate/tonmate:staging
```

### 2. **Build and Push Manually**
```bash
# Build image
docker build -t ghcr.io/tonmate/tonmate:latest .

# Push image
docker push ghcr.io/tonmate/tonmate:latest
```

## Required Secrets

| Secret | Purpose | Value |
|--------|---------|-------|
| `GITHUB_TOKEN` | Registry authentication | Auto-provided by GitHub |
| `DEPLOYMENTS_ACCESS_TOKEN` | Deployments repo access | Personal access token |

**Note**: No additional Docker registry secrets needed! GitHub handles authentication automatically.

## Migration from GitLab

### 1. **Update Deployments Repository**
Change your `docker-compose.yml` files from:
```yaml
# OLD (GitLab)
image: registry.gitlab.com/your-org/project:latest
```

To:
```yaml
# NEW (GitHub)
image: ghcr.io/tonmate/tonmate:latest
```

### 2. **Update VPS Scripts**
Change login commands from:
```bash
# OLD (GitLab)
docker login registry.gitlab.com -u $GITLAB_USER -p $GITLAB_TOKEN
```

To:
```bash
# NEW (GitHub)
docker login ghcr.io -u $GITHUB_USER -p $GITHUB_TOKEN
```

## Troubleshooting

### 📊 **View Images**
- Go to your repository → **Packages** tab
- See all pushed images and tags

### 🔍 **Common Issues**

1. **Authentication Failed**
   - Check `GITHUB_TOKEN` has package permissions
   - Verify repository settings allow write access

2. **Image Not Found**
   - Check if build workflow completed successfully
   - Verify image tag matches deployment expectation

3. **Pull Failed on VPS**
   - Check VPS can reach `ghcr.io`
   - Verify authentication token is valid

### 🛠️ **Debug Commands**
```bash
# Check authentication
docker login ghcr.io -u $GITHUB_USERNAME -p $GITHUB_TOKEN

# List images
docker images | grep ghcr.io

# Check image details
docker inspect ghcr.io/tonmate/tonmate:latest
```

## Security Best Practices

1. **Use Private Images**: Keep production images private
2. **Token Rotation**: GitHub tokens auto-rotate
3. **Minimal Permissions**: Only grant necessary package permissions
4. **Audit Access**: Review package access regularly

---

**Result**: Your deployment now uses GitHub Container Registry exactly like your previous GitLab setup, but with better GitHub integration! 🚀
