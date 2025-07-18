# Release and Tagging Strategy

This document outlines the comprehensive tagging and release strategy for the Tonmate platform, covering both GitHub releases and Docker image registry tagging.

## Overview

Our release strategy integrates:
- 🏷️ **Git Tags**: Semantic versioning for releases
- 🐳 **Docker Images**: Versioned container images in GitHub Container Registry
- 📦 **GitHub Releases**: Automated release notes and artifacts
- 🚀 **Deployments**: Environment-specific deployment tags

## Tagging Strategy

### 1. **Git Tags (Repository)**
```bash
# Production releases
v1.0.0, v1.0.1, v1.1.0, v2.0.0

# Pre-releases (optional)
v1.0.0-rc.1, v1.0.0-beta.1, v1.0.0-alpha.1
```

### 2. **Docker Image Tags (Registry)**
| Source | Docker Tag | Registry URL |
|--------|------------|--------------|
| **Git Tag** `v1.0.0` | `v1.0.0` | `ghcr.io/tonmate/tonmate:v1.0.0` |
| **Main Branch** | `latest` | `ghcr.io/tonmate/tonmate:latest` |
| **Staging Branch** | `staging` | `ghcr.io/tonmate/tonmate:staging` |
| **PR/Development** | `dev-abc123` | `ghcr.io/tonmate/tonmate:dev-abc123` |

## Release Process

### 1. **Development Flow**
```bash
# 1. Develop on feature branches
git checkout -b feature/new-feature
# ... make changes ...
git push origin feature/new-feature

# 2. Pull request builds dev image
# → ghcr.io/tonmate/tonmate:dev-abc123
```

### 2. **Staging Deployment**
```bash
# 1. Merge to staging branch
git checkout staging
git merge feature/new-feature
git push origin staging

# 2. Automatic staging build
# → ghcr.io/tonmate/tonmate:staging
```

### 3. **Production Release**
```bash
# 1. Update version in package.json
npm version patch  # or minor/major
# Creates commit: "1.0.1"

# 2. Create and push git tag
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1

# 3. Automatic workflows triggered:
# - build.yml: Creates ghcr.io/tonmate/tonmate:v1.0.1
# - release.yml: Creates GitHub Release with changelog
```

### 4. **Main Branch Sync**
```bash
# 1. Merge to main for latest tag
git checkout main
git merge v1.0.1
git push origin main

# 2. Automatic latest build
# → ghcr.io/tonmate/tonmate:latest
```

## GitHub Workflows Integration

### **Build Workflow** (`build.yml`)
**Triggers:**
- Push to `main` → `latest` tag
- Push to `staging` → `staging` tag  
- Push to `v*` tags → versioned tag (e.g., `v1.0.0`)
- Pull requests → `dev-{sha}` tag

**Logic:**
```yaml
if [[ "${{ github.ref }}" == refs/tags/v* ]]; then
  TAG=${GITHUB_REF#refs/tags/}  # v1.0.0
elif [ "${{ github.ref }}" == "refs/heads/main" ]; then
  TAG=latest
elif [ "${{ github.ref }}" == "refs/heads/staging" ]; then
  TAG=staging
else
  TAG=dev-${{ github.sha }}
fi
```

### **Release Workflow** (`release.yml`)
**Triggers:**
- Push to `v*` tags only

**Creates:**
- GitHub Release with changelog
- Release notes with Docker instructions
- Links to installation guides

## Docker Image Management

### **Registry Structure**
```
ghcr.io/tonmate/tonmate:
├── latest          # Main branch (production-ready)
├── staging         # Staging branch (pre-production)
├── v1.0.0          # Tagged releases
├── v1.0.1          # Tagged releases
├── v1.1.0          # Tagged releases
└── dev-abc123      # Development builds
```

### **Image Lifecycle**
1. **Development**: `dev-*` tags (temporary, cleaned up regularly)
2. **Staging**: `staging` tag (overwritten on each staging push)
3. **Production**: `latest` tag (overwritten on each main push)
4. **Releases**: `v*` tags (permanent, never overwritten)

## Deployment Strategy

### **Staging Environment**
```yaml
# docker-compose.staging.yml
services:
  tonmate-staging:
    image: ghcr.io/tonmate/tonmate:staging
```

### **Production Environment**
```yaml
# docker-compose.production.yml
services:
  tonmate-production:
    image: ghcr.io/tonmate/tonmate:latest
    # OR for specific version:
    # image: ghcr.io/tonmate/tonmate:v1.0.0
```

## Semantic Versioning

We follow [SemVer](https://semver.org/) conventions:

### **Version Format**: `MAJOR.MINOR.PATCH`

| Type | When to Increment | Example |
|------|-------------------|---------|
| **MAJOR** | Breaking changes | `1.0.0` → `2.0.0` |
| **MINOR** | New features (backward compatible) | `1.0.0` → `1.1.0` |
| **PATCH** | Bug fixes (backward compatible) | `1.0.0` → `1.0.1` |

### **Pre-release Versions**
| Type | Format | Usage |
|------|---------|--------|
| **Alpha** | `v1.0.0-alpha.1` | Early development |
| **Beta** | `v1.0.0-beta.1` | Feature complete, testing |
| **RC** | `v1.0.0-rc.1` | Release candidate |

## Release Commands

### **Create New Release**
```bash
# 1. Update version
npm version patch  # Creates commit + tag

# 2. Push tag (triggers workflows)
git push origin v1.0.1

# 3. Verify builds
# Check GitHub Actions for build completion
# Check ghcr.io/tonmate/tonmate:v1.0.1 exists
```

### **Hotfix Release**
```bash
# 1. Create hotfix branch from main
git checkout main
git checkout -b hotfix/critical-fix

# 2. Make fix and test
# ... make changes ...
git commit -m "Fix critical bug"

# 3. Version bump
npm version patch  # 1.0.1 → 1.0.2

# 4. Push hotfix tag
git push origin v1.0.2

# 5. Merge back to main and staging
git checkout main
git merge hotfix/critical-fix
git push origin main

git checkout staging
git merge hotfix/critical-fix
git push origin staging
```

## Environment Variables

No secrets needed for public releases. GitHub handles authentication automatically:

| Variable | Source | Purpose |
|----------|--------|---------|
| `GITHUB_TOKEN` | Auto-provided | GitHub Container Registry auth |
| `github.ref` | Auto-provided | Branch/tag identification |
| `github.sha` | Auto-provided | Commit SHA for dev builds |

## Monitoring and Verification

### **Check Release Status**
```bash
# 1. GitHub Releases
# Visit: https://github.com/tonmate/tonmate/releases

# 2. Docker Images
# Visit: https://github.com/tonmate/tonmate/pkgs/container/tonmate

# 3. Workflow Status
# Visit: https://github.com/tonmate/tonmate/actions
```

### **Test Release**
```bash
# 1. Pull specific version
docker pull ghcr.io/tonmate/tonmate:v1.0.0

# 2. Test locally
docker run -p 3000:3000 ghcr.io/tonmate/tonmate:v1.0.0

# 3. Verify deployment
curl http://localhost:3000/api/health
```

## Rollback Strategy

### **Docker Rollback**
```bash
# 1. Identify last working version
docker images ghcr.io/tonmate/tonmate

# 2. Update docker-compose.yml
# image: ghcr.io/tonmate/tonmate:v1.0.0  # previous version

# 3. Deploy previous version
docker-compose pull
docker-compose up -d
```

### **Git Rollback**
```bash
# 1. Revert to previous tag
git checkout v1.0.0

# 2. Create new tag
git tag -a v1.0.1 -m "Rollback to v1.0.0"
git push origin v1.0.1
```

---

**Summary**: This strategy ensures clean version management across Git repositories, Docker registry, and deployments with full automation and traceability! 🚀
