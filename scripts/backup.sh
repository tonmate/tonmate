#!/bin/bash

# Tonmate - Backup Script
# This script creates comprehensive backups of the application

set -e  # Exit on any error

# Configuration
BACKUP_DIR="/backup/support-agent"
APP_DIR="/app/customer-support-ai-agent"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7
MAX_BACKUPS=20

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    warn "Running as root. Consider using a dedicated backup user."
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Load environment variables
if [ -f "$APP_DIR/.env.local" ]; then
    source "$APP_DIR/.env.local"
else
    error "Environment file not found at $APP_DIR/.env.local"
    exit 1
fi

# Check required variables
if [ -z "$DATABASE_URL" ]; then
    error "DATABASE_URL not set in environment"
    exit 1
fi

log "Starting backup process..."

# Function to backup database
backup_database() {
    log "Starting database backup..."
    
    local db_backup_file="$BACKUP_DIR/database_$DATE.sql"
    
    if [[ $DATABASE_URL == postgresql://* ]]; then
        # PostgreSQL backup
        log "Backing up PostgreSQL database..."
        pg_dump "$DATABASE_URL" > "$db_backup_file"
        
        # Compress backup
        gzip "$db_backup_file"
        log "Database backup completed: ${db_backup_file}.gz"
        
    elif [[ $DATABASE_URL == file:* ]]; then
        # SQLite backup
        log "Backing up SQLite database..."
        local sqlite_file=${DATABASE_URL#file:}
        sqlite_file=${sqlite_file#./}
        
        if [ -f "$APP_DIR/$sqlite_file" ]; then
            cp "$APP_DIR/$sqlite_file" "$BACKUP_DIR/database_$DATE.db"
            gzip "$BACKUP_DIR/database_$DATE.db"
            log "Database backup completed: $BACKUP_DIR/database_$DATE.db.gz"
        else
            error "SQLite database file not found: $APP_DIR/$sqlite_file"
            return 1
        fi
    else
        error "Unsupported database type: $DATABASE_URL"
        return 1
    fi
}

# Function to backup application files
backup_application() {
    log "Starting application backup..."
    
    local app_backup_file="$BACKUP_DIR/application_$DATE.tar.gz"
    
    # Create tar archive excluding node_modules and other build artifacts
    tar -czf "$app_backup_file" \
        -C "$APP_DIR" \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='dist' \
        --exclude='build' \
        --exclude='*.log' \
        --exclude='.git' \
        --exclude='dev.db' \
        --exclude='uploads/temp' \
        .
    
    log "Application backup completed: $app_backup_file"
}

# Function to backup configuration files
backup_configuration() {
    log "Starting configuration backup..."
    
    local config_backup_file="$BACKUP_DIR/configuration_$DATE.tar.gz"
    
    # Create temporary directory for config files
    local temp_config_dir="/tmp/config_backup_$DATE"
    mkdir -p "$temp_config_dir"
    
    # Copy configuration files
    if [ -f "$APP_DIR/.env.local" ]; then
        cp "$APP_DIR/.env.local" "$temp_config_dir/"
    fi
    
    if [ -f "$APP_DIR/package.json" ]; then
        cp "$APP_DIR/package.json" "$temp_config_dir/"
    fi
    
    if [ -f "$APP_DIR/package-lock.json" ]; then
        cp "$APP_DIR/package-lock.json" "$temp_config_dir/"
    fi
    
    if [ -f "$APP_DIR/docker-compose.yml" ]; then
        cp "$APP_DIR/docker-compose.yml" "$temp_config_dir/"
    fi
    
    if [ -f "$APP_DIR/Dockerfile" ]; then
        cp "$APP_DIR/Dockerfile" "$temp_config_dir/"
    fi
    
    if [ -d "$APP_DIR/prisma" ]; then
        cp -r "$APP_DIR/prisma" "$temp_config_dir/"
    fi
    
    # Create archive
    tar -czf "$config_backup_file" -C "$temp_config_dir" .
    
    # Cleanup
    rm -rf "$temp_config_dir"
    
    log "Configuration backup completed: $config_backup_file"
}

# Function to backup uploads/files
backup_uploads() {
    log "Starting uploads backup..."
    
    local uploads_dir="$APP_DIR/uploads"
    local uploads_backup_file="$BACKUP_DIR/uploads_$DATE.tar.gz"
    
    if [ -d "$uploads_dir" ]; then
        tar -czf "$uploads_backup_file" -C "$uploads_dir" .
        log "Uploads backup completed: $uploads_backup_file"
    else
        warn "Uploads directory not found: $uploads_dir"
    fi
}

# Function to create backup manifest
create_manifest() {
    log "Creating backup manifest..."
    
    local manifest_file="$BACKUP_DIR/manifest_$DATE.json"
    
    cat > "$manifest_file" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "version": "1.0.0",
  "backup_id": "$DATE",
  "files": [
    {
      "name": "database_$DATE.sql.gz",
      "type": "database",
      "size": "$(stat -c%s "$BACKUP_DIR/database_$DATE.sql.gz" 2>/dev/null || echo 0)"
    },
    {
      "name": "application_$DATE.tar.gz",
      "type": "application",
      "size": "$(stat -c%s "$BACKUP_DIR/application_$DATE.tar.gz" 2>/dev/null || echo 0)"
    },
    {
      "name": "configuration_$DATE.tar.gz",
      "type": "configuration",
      "size": "$(stat -c%s "$BACKUP_DIR/configuration_$DATE.tar.gz" 2>/dev/null || echo 0)"
    },
    {
      "name": "uploads_$DATE.tar.gz",
      "type": "uploads",
      "size": "$(stat -c%s "$BACKUP_DIR/uploads_$DATE.tar.gz" 2>/dev/null || echo 0)"
    }
  ],
  "environment": {
    "node_version": "$(node --version)",
    "npm_version": "$(npm --version)",
    "platform": "$(uname -s)",
    "hostname": "$(hostname)"
  }
}
EOF
    
    log "Backup manifest created: $manifest_file"
}

# Function to cleanup old backups
cleanup_old_backups() {
    log "Cleaning up old backups..."
    
    # Remove backups older than retention period
    find "$BACKUP_DIR" -name "*.gz" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.json" -mtime +$RETENTION_DAYS -delete
    
    # Keep only the latest N backups
    local backup_count=$(ls -1 "$BACKUP_DIR"/database_*.sql.gz 2>/dev/null | wc -l)
    if [ "$backup_count" -gt "$MAX_BACKUPS" ]; then
        local excess=$((backup_count - MAX_BACKUPS))
        ls -1t "$BACKUP_DIR"/database_*.sql.gz | tail -n "$excess" | xargs rm -f
        ls -1t "$BACKUP_DIR"/application_*.tar.gz | tail -n "$excess" | xargs rm -f
        ls -1t "$BACKUP_DIR"/configuration_*.tar.gz | tail -n "$excess" | xargs rm -f
        ls -1t "$BACKUP_DIR"/uploads_*.tar.gz | tail -n "$excess" | xargs rm -f
        ls -1t "$BACKUP_DIR"/manifest_*.json | tail -n "$excess" | xargs rm -f
        log "Cleaned up $excess old backups"
    fi
}

# Function to verify backup integrity
verify_backup() {
    log "Verifying backup integrity..."
    
    local errors=0
    
    # Check database backup
    if [ -f "$BACKUP_DIR/database_$DATE.sql.gz" ]; then
        if gzip -t "$BACKUP_DIR/database_$DATE.sql.gz"; then
            log "✓ Database backup integrity verified"
        else
            error "✗ Database backup integrity check failed"
            errors=$((errors + 1))
        fi
    fi
    
    # Check application backup
    if [ -f "$BACKUP_DIR/application_$DATE.tar.gz" ]; then
        if tar -tzf "$BACKUP_DIR/application_$DATE.tar.gz" > /dev/null; then
            log "✓ Application backup integrity verified"
        else
            error "✗ Application backup integrity check failed"
            errors=$((errors + 1))
        fi
    fi
    
    # Check configuration backup
    if [ -f "$BACKUP_DIR/configuration_$DATE.tar.gz" ]; then
        if tar -tzf "$BACKUP_DIR/configuration_$DATE.tar.gz" > /dev/null; then
            log "✓ Configuration backup integrity verified"
        else
            error "✗ Configuration backup integrity check failed"
            errors=$((errors + 1))
        fi
    fi
    
    if [ $errors -eq 0 ]; then
        log "All backup integrity checks passed"
    else
        error "$errors backup integrity checks failed"
        return 1
    fi
}

# Function to send notification
send_notification() {
    local status=$1
    local message=$2
    
    # Slack notification (if webhook is configured)
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        local color="good"
        local icon="✅"
        
        if [ "$status" != "success" ]; then
            color="danger"
            icon="❌"
        fi
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$icon Backup $status: $message\"}" \
            "$SLACK_WEBHOOK_URL" > /dev/null 2>&1
    fi
    
    # Email notification (if configured)
    if [ -n "$EMAIL_NOTIFICATION" ] && command -v mail >/dev/null 2>&1; then
        echo "$message" | mail -s "Backup $status - Tonmate" "$EMAIL_NOTIFICATION"
    fi
}

# Main backup function
main() {
    local start_time=$(date +%s)
    
    log "Backup started at $(date)"
    log "Backup directory: $BACKUP_DIR"
    log "Retention: $RETENTION_DAYS days, Max backups: $MAX_BACKUPS"
    
    # Check disk space
    local available_space=$(df "$BACKUP_DIR" | awk 'NR==2 {print $4}')
    local required_space=1000000  # 1GB in KB
    
    if [ "$available_space" -lt "$required_space" ]; then
        error "Insufficient disk space. Available: ${available_space}KB, Required: ${required_space}KB"
        send_notification "failed" "Insufficient disk space for backup"
        exit 1
    fi
    
    # Perform backups
    if backup_database && backup_application && backup_configuration && backup_uploads; then
        create_manifest
        verify_backup
        cleanup_old_backups
        
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        log "Backup completed successfully in ${duration}s"
        
        # Calculate total backup size
        local total_size=$(du -sh "$BACKUP_DIR" | cut -f1)
        
        send_notification "success" "Backup completed successfully. Total size: $total_size, Duration: ${duration}s"
    else
        error "Backup failed"
        send_notification "failed" "Backup process failed. Check logs for details."
        exit 1
    fi
}

# Handle command line arguments
case "${1:-}" in
    "database")
        backup_database
        ;;
    "application")
        backup_application
        ;;
    "configuration")
        backup_configuration
        ;;
    "uploads")
        backup_uploads
        ;;
    "verify")
        verify_backup
        ;;
    "cleanup")
        cleanup_old_backups
        ;;
    "help"|"-h"|"--help")
        cat << EOF
Customer Support AI Agent - Backup Script

Usage: $0 [command]

Commands:
  database      Backup database only
  application   Backup application files only
  configuration Backup configuration files only
  uploads       Backup uploads directory only
  verify        Verify backup integrity
  cleanup       Clean up old backups
  help          Show this help message

If no command is specified, performs a complete backup.

Environment Variables:
  BACKUP_DIR           Backup directory (default: /backup/support-agent)
  RETENTION_DAYS       Days to keep backups (default: 7)
  MAX_BACKUPS          Maximum number of backups to keep (default: 20)
  SLACK_WEBHOOK_URL    Slack webhook for notifications
  EMAIL_NOTIFICATION   Email address for notifications

Examples:
  $0                   # Full backup
  $0 database          # Database backup only
  $0 verify            # Verify last backup
  $0 cleanup           # Clean old backups
EOF
        ;;
    *)
        main
        ;;
esac
