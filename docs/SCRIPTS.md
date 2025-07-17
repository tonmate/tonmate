# Tonmate Scripts

This directory contains organized scripts for deploying, monitoring, and maintaining the Tonmate platform.

## Directory Structure

- **deploy/** - Scripts for deployment and release management
  - `deploy.sh` - Main deployment script for production environments
  - `setup.sh` - Environment setup and configuration
  - `release.sh` - Version management and release preparation

- **monitoring/** - Scripts for system and application monitoring
  - `monitor.sh` - Comprehensive monitoring with alerts and notifications
  - `production-check.sh` - Pre-deployment production environment validation

- **maintenance/** - Scripts for maintenance tasks
  - `backup.sh` - Database and configuration backup
  - `security-check.sh` - Security auditing and vulnerability scanning

## Usage

All scripts should be run from the project root directory:

```bash
# Example: Running the monitoring script
./scripts/monitoring/monitor.sh start

# Example: Running the backup script
./scripts/maintenance/backup.sh
```

## Development

When adding new scripts:
1. Place them in the appropriate category folder
2. Use consistent naming conventions
3. Include proper documentation and usage examples
4. Follow shell script best practices
