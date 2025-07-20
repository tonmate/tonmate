# Tonmate Docker Deployment

This document explains how to deploy Tonmate using Docker and Docker Compose.

## Deployment Options

Tonmate provides two Docker Compose configurations:

1. **Minimal Configuration** (`docker-compose.minimal.yml`): Contains only the essential services required to run Tonmate
   - Tonmate Application
   - PostgreSQL Database

2. **Full Configuration** (`docker-compose.yml`): Contains all services for a production-ready deployment
   - Tonmate Application
   - PostgreSQL Database
   - Redis Cache (optional)
   - Nginx Reverse Proxy (optional)

## Quick Start

### Minimal Deployment

```bash
# Start minimal deployment
docker-compose -f docker-compose.minimal.yml up -d

# View logs
docker-compose -f docker-compose.minimal.yml logs -f app
```

### Full Deployment

```bash
# Start full deployment with all services
docker-compose up -d

# View logs
docker-compose logs -f app
```

## Configuration

### Environment Variables

Create an `.env` file in the project root directory with the following variables:

```
# Required Variables
NEXTAUTH_SECRET=your-secure-secret-key
ENCRYPTION_KEY=your-32-character-encryption-key

# AI Provider Configuration
# AI provider API keys (OpenAI, Anthropic, Google AI, Mistral, Cohere) 
# are configured per user through the web interface, not as environment variables
```

### PostgreSQL Configuration

By default, the database is configured as follows:

- Database Name: `tonmate`
- Username: `postgres`
- Password: `postgres`

For production deployments, you should change these values in the Docker Compose file and update the `DATABASE_URL` environment variable accordingly.

### Redis Configuration

Redis is configured with default settings. For production, consider enabling password authentication.

## Production Recommendations

For production deployments:

1. **Use Persistent Volumes**: Ensure database data is preserved
2. **Set Strong Passwords**: Update all default credentials
3. **Enable TLS/SSL**: Configure Nginx with SSL certificates
4. **Set Up Monitoring**: Use the provided monitoring scripts in `/scripts/monitoring/`
5. **Regular Backups**: Implement database backups using scripts in `/scripts/maintenance/`

## Troubleshooting

### Container Health Checks

All containers include health checks. You can verify their status with:

```bash
docker-compose ps
```

### Logs

View application logs:

```bash
docker-compose logs -f app
```

### Database Connection Issues

If the application can't connect to the database:

1. Verify the database container is running: `docker-compose ps db`
2. Check database logs: `docker-compose logs db`
3. Ensure the `DATABASE_URL` environment variable is correct

## Additional Resources

- [Deployment Guide](DEPLOYMENT.md) - Complete deployment instructions
- [Production Checklist](PRODUCTION_CHECKLIST.md) - Ensure production readiness
- [Monitoring Guide](scripts/README.md) - Information about monitoring scripts
