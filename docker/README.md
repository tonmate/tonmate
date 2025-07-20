# Tonmate Docker Configuration

This directory contains all Docker-related configuration files for the Tonmate platform.

## Files

- `docker-compose.yml` - Full production setup with all services
- `docker-compose.minimal.yml` - Minimal setup with only essential services
- `docker-compose.prod.yml` - Production-specific configuration
- `Dockerfile` - Application container configuration
- `nginx.prod.conf` - Nginx reverse proxy configuration
- `healthcheck.js` - Health check script for containers
- `init-db.sql` - Database initialization script

## Quick Start

### Minimal Development Setup
```bash
cd docker
docker-compose -f docker-compose.minimal.yml up -d
```

### Full Production Setup
```bash
cd docker
docker-compose -f docker-compose.yml up -d
```

## Environment Variables

Create a `.env` file in the project root with required variables:

```bash
NEXTAUTH_SECRET=your-secret-key
ENCRYPTION_KEY=your-encryption-key
```

Note: AI provider API keys (OpenAI, Anthropic, etc.) are configured per user through the web interface.

## Documentation

See `docs/DOCKER.md` for complete Docker deployment documentation.
