# Semantic Release Guide

This project uses **Semantic Release** for automatic versioning and releases.

## How it works

### 📝 Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 🏷️ Release Types

| Commit Type | Release Type | Example |
|-------------|--------------|---------|
| `feat:` | **Minor** (1.0.0 → 1.1.0) | `feat: add user authentication` |
| `fix:` | **Patch** (1.0.0 → 1.0.1) | `fix: resolve login button bug` |
| `perf:` | **Patch** (1.0.0 → 1.0.1) | `perf: improve query performance` |
| `BREAKING CHANGE:` | **Major** (1.0.0 → 2.0.0) | `feat!: remove deprecated API` |

### 🔧 Other Types (Patch release)
- `docs:` - Documentation updates
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `build:` - Build system changes
- `ci:` - CI configuration changes
- `chore:` - Maintenance tasks

## 🚀 Release Process

1. **Push to main** with conventional commits
2. **Semantic Release** analyzes commit messages
3. **Automatically creates**:
   - Git tag (e.g., `v1.2.3`)
   - GitHub release with changelog
   - Docker images with multiple tags

## 🐳 Docker Image Tags

### New Release (e.g., v1.2.3)
- `ghcr.io/tonmate/instagram-support-agent:v1.2.3`
- `ghcr.io/tonmate/instagram-support-agent:1.2.3`
- `ghcr.io/tonmate/instagram-support-agent:1.2`
- `ghcr.io/tonmate/instagram-support-agent:1`
- `ghcr.io/tonmate/instagram-support-agent:latest`

### Main Branch (no release)
- `ghcr.io/tonmate/instagram-support-agent:latest`
- `ghcr.io/tonmate/instagram-support-agent:main`

## 📋 Examples

```bash
# Feature - triggers minor release
git commit -m "feat: add Instagram story support"

# Bug fix - triggers patch release
git commit -m "fix: resolve DM parsing issue"

# Breaking change - triggers major release
git commit -m "feat!: redesign API endpoints

BREAKING CHANGE: API endpoints have been restructured"

# No release - just documentation
git commit -m "docs: update README with new features"
```

## 📊 Benefits

- ✅ **Automated versioning** based on commit messages
- ✅ **Consistent Docker tags** across environments
- ✅ **Automatic changelog** generation
- ✅ **GitHub releases** with release notes
- ✅ **No manual version bumping**

## 🔍 Monitoring

Check the **Actions** tab to see:
- Which commits triggered releases
- Version numbers generated
- Docker images pushed
- Release notes created
