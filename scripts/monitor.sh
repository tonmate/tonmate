#!/bin/bash

# Customer Support AI Agent - Monitoring Script
# This script monitors application health and sends alerts

set -e

# Configuration
HEALTH_URL="http://localhost:3000/api/health"
CHECK_INTERVAL=60  # seconds
MAX_RETRIES=3
TIMEOUT=10

# Thresholds
CPU_THRESHOLD=80
MEMORY_THRESHOLD=80
DISK_THRESHOLD=85
RESPONSE_TIME_THRESHOLD=5000  # milliseconds

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging
LOG_FILE="/var/log/support-agent-monitor.log"
ALERT_FILE="/var/log/support-agent-alerts.log"

# Notification settings
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
EMAIL_NOTIFICATION="${EMAIL_NOTIFICATION:-}"
DISCORD_WEBHOOK_URL="${DISCORD_WEBHOOK_URL:-}"

# PID file for daemon mode
PID_FILE="/var/run/support-agent-monitor.pid"

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
    
    # Also log to console with colors
    case $level in
        "ERROR")
            echo -e "${RED}[${timestamp}] ERROR: ${message}${NC}" >&2
            ;;
        "WARN")
            echo -e "${YELLOW}[${timestamp}] WARN: ${message}${NC}" >&2
            ;;
        "INFO")
            echo -e "${GREEN}[${timestamp}] INFO: ${message}${NC}"
            ;;
        *)
            echo -e "[${timestamp}] ${level}: ${message}"
            ;;
    esac
}

# Alert function
alert() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Log alert
    echo "${timestamp} [${level}] ${message}" >> "$ALERT_FILE"
    log "ALERT" "$level: $message"
    
    # Send notifications
    send_slack_notification "$level" "$message"
    send_email_notification "$level" "$message"
    send_discord_notification "$level" "$message"
}

# Slack notification
send_slack_notification() {
    local level=$1
    local message=$2
    
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        local color="good"
        local icon="✅"
        
        case $level in
            "CRITICAL")
                color="danger"
                icon="🚨"
                ;;
            "WARNING")
                color="warning"
                icon="⚠️"
                ;;
            "INFO")
                color="good"
                icon="ℹ️"
                ;;
        esac
        
        local payload=$(cat <<EOF
{
    "attachments": [
        {
            "color": "$color",
            "title": "$icon Customer Support AI Agent Alert",
            "text": "$message",
            "ts": $(date +%s)
        }
    ]
}
EOF
        )
        
        curl -X POST -H 'Content-type: application/json' \
            --data "$payload" \
            "$SLACK_WEBHOOK_URL" > /dev/null 2>&1
    fi
}

# Email notification
send_email_notification() {
    local level=$1
    local message=$2
    
    if [ -n "$EMAIL_NOTIFICATION" ] && command -v mail >/dev/null 2>&1; then
        echo "$message" | mail -s "[$level] Customer Support AI Agent Alert" "$EMAIL_NOTIFICATION"
    fi
}

# Discord notification
send_discord_notification() {
    local level=$1
    local message=$2
    
    if [ -n "$DISCORD_WEBHOOK_URL" ]; then
        local color="65280"  # green
        
        case $level in
            "CRITICAL")
                color="16711680"  # red
                ;;
            "WARNING")
                color="16776960"  # yellow
                ;;
        esac
        
        local payload=$(cat <<EOF
{
    "embeds": [
        {
            "title": "Customer Support AI Agent Alert",
            "description": "$message",
            "color": $color,
            "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
        }
    ]
}
EOF
        )
        
        curl -X POST -H 'Content-type: application/json' \
            --data "$payload" \
            "$DISCORD_WEBHOOK_URL" > /dev/null 2>&1
    fi
}

# Health check function
check_health() {
    local response_time
    local http_code
    local start_time
    local end_time
    
    log "INFO" "Performing health check..."
    
    start_time=$(date +%s%3N)
    
    # Make health check request
    http_code=$(curl -s -o /dev/null -w "%{http_code}" \
        --connect-timeout "$TIMEOUT" \
        --max-time "$TIMEOUT" \
        "$HEALTH_URL")
    
    end_time=$(date +%s%3N)
    response_time=$((end_time - start_time))
    
    # Check HTTP status
    if [ "$http_code" -eq 200 ]; then
        log "INFO" "Health check passed (${response_time}ms)"
        
        # Check response time
        if [ "$response_time" -gt "$RESPONSE_TIME_THRESHOLD" ]; then
            alert "WARNING" "Slow response time: ${response_time}ms (threshold: ${RESPONSE_TIME_THRESHOLD}ms)"
        fi
        
        return 0
    else
        log "ERROR" "Health check failed: HTTP $http_code"
        return 1
    fi
}

# System metrics check
check_system_metrics() {
    log "INFO" "Checking system metrics..."
    
    # CPU usage
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    cpu_usage=${cpu_usage%.*}  # Remove decimal part
    
    if [ "$cpu_usage" -gt "$CPU_THRESHOLD" ]; then
        alert "WARNING" "High CPU usage: ${cpu_usage}% (threshold: ${CPU_THRESHOLD}%)"
    fi
    
    # Memory usage
    local memory_info=$(free | grep Mem)
    local total_memory=$(echo $memory_info | awk '{print $2}')
    local used_memory=$(echo $memory_info | awk '{print $3}')
    local memory_usage=$((used_memory * 100 / total_memory))
    
    if [ "$memory_usage" -gt "$MEMORY_THRESHOLD" ]; then
        alert "WARNING" "High memory usage: ${memory_usage}% (threshold: ${MEMORY_THRESHOLD}%)"
    fi
    
    # Disk usage
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -gt "$DISK_THRESHOLD" ]; then
        alert "WARNING" "High disk usage: ${disk_usage}% (threshold: ${DISK_THRESHOLD}%)"
    fi
    
    log "INFO" "System metrics: CPU=${cpu_usage}%, Memory=${memory_usage}%, Disk=${disk_usage}%"
}

# Database check
check_database() {
    log "INFO" "Checking database connectivity..."
    
    # Load environment variables
    if [ -f ".env.local" ]; then
        source .env.local
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        log "WARN" "DATABASE_URL not set, skipping database check"
        return 0
    fi
    
    # Check database connection
    if [[ $DATABASE_URL == postgresql://* ]]; then
        # PostgreSQL check
        if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
            log "INFO" "Database connection successful"
        else
            alert "CRITICAL" "Database connection failed"
            return 1
        fi
    elif [[ $DATABASE_URL == file:* ]]; then
        # SQLite check
        local sqlite_file=${DATABASE_URL#file:}
        sqlite_file=${sqlite_file#./}
        
        if [ -f "$sqlite_file" ]; then
            if sqlite3 "$sqlite_file" "SELECT 1;" > /dev/null 2>&1; then
                log "INFO" "Database connection successful"
            else
                alert "CRITICAL" "Database connection failed"
                return 1
            fi
        else
            alert "CRITICAL" "Database file not found: $sqlite_file"
            return 1
        fi
    fi
}

# Process check
check_process() {
    log "INFO" "Checking application process..."
    
    # Check if Node.js process is running
    if pgrep -f "node.*next" > /dev/null; then
        log "INFO" "Application process is running"
        return 0
    else
        alert "CRITICAL" "Application process not found"
        return 1
    fi
}

# Log file check
check_logs() {
    log "INFO" "Checking for errors in logs..."
    
    local log_files=(
        "/var/log/pm2/support-agent-error.log"
        "/var/log/pm2/support-agent-out.log"
        ".next/server/chunks/ssr/error.log"
    )
    
    for log_file in "${log_files[@]}"; do
        if [ -f "$log_file" ]; then
            # Check for recent errors (last 5 minutes)
            local recent_errors=$(find "$log_file" -newermt "5 minutes ago" -exec grep -i "error\|critical\|fatal" {} \; 2>/dev/null | wc -l)
            
            if [ "$recent_errors" -gt 0 ]; then
                alert "WARNING" "Found $recent_errors recent errors in $log_file"
            fi
        fi
    done
}

# Full monitoring check
run_monitoring_check() {
    log "INFO" "Starting monitoring check..."
    
    local health_ok=true
    local retry_count=0
    
    # Health check with retries
    while [ $retry_count -lt $MAX_RETRIES ]; do
        if check_health; then
            break
        else
            retry_count=$((retry_count + 1))
            if [ $retry_count -lt $MAX_RETRIES ]; then
                log "WARN" "Health check failed, retrying ($retry_count/$MAX_RETRIES)..."
                sleep 10
            else
                alert "CRITICAL" "Health check failed after $MAX_RETRIES attempts"
                health_ok=false
            fi
        fi
    done
    
    # Additional checks only if health check passed
    if [ "$health_ok" = true ]; then
        check_system_metrics
        check_database
        check_process
        check_logs
    fi
    
    log "INFO" "Monitoring check completed"
}

# Daemon mode
run_daemon() {
    log "INFO" "Starting monitoring daemon..."
    
    # Check if already running
    if [ -f "$PID_FILE" ]; then
        local old_pid=$(cat "$PID_FILE")
        if ps -p "$old_pid" > /dev/null 2>&1; then
            log "ERROR" "Monitoring daemon already running (PID: $old_pid)"
            exit 1
        else
            log "WARN" "Removing stale PID file"
            rm -f "$PID_FILE"
        fi
    fi
    
    # Write PID file
    echo $$ > "$PID_FILE"
    
    # Trap signals
    trap 'cleanup_daemon' SIGTERM SIGINT
    
    log "INFO" "Monitoring daemon started (PID: $$)"
    
    # Main monitoring loop
    while true; do
        run_monitoring_check
        sleep "$CHECK_INTERVAL"
    done
}

# Cleanup daemon
cleanup_daemon() {
    log "INFO" "Stopping monitoring daemon..."
    rm -f "$PID_FILE"
    exit 0
}

# Stop daemon
stop_daemon() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            log "INFO" "Stopping monitoring daemon (PID: $pid)"
            kill "$pid"
            rm -f "$PID_FILE"
        else
            log "WARN" "Daemon not running, removing PID file"
            rm -f "$PID_FILE"
        fi
    else
        log "WARN" "PID file not found, daemon may not be running"
    fi
}

# Status check
daemon_status() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            log "INFO" "Monitoring daemon is running (PID: $pid)"
        else
            log "WARN" "PID file exists but daemon is not running"
            rm -f "$PID_FILE"
        fi
    else
        log "INFO" "Monitoring daemon is not running"
    fi
}

# Main function
main() {
    case "${1:-}" in
        "start")
            run_daemon
            ;;
        "stop")
            stop_daemon
            ;;
        "restart")
            stop_daemon
            sleep 2
            run_daemon
            ;;
        "status")
            daemon_status
            ;;
        "check")
            run_monitoring_check
            ;;
        "health")
            check_health
            ;;
        "metrics")
            check_system_metrics
            ;;
        "database")
            check_database
            ;;
        "logs")
            check_logs
            ;;
        "help"|"-h"|"--help")
            cat << EOF
Customer Support AI Agent - Monitoring Script

Usage: $0 [command]

Commands:
  start      Start monitoring daemon
  stop       Stop monitoring daemon
  restart    Restart monitoring daemon
  status     Check daemon status
  check      Run single monitoring check
  health     Check application health only
  metrics    Check system metrics only
  database   Check database connectivity only
  logs       Check logs for errors only
  help       Show this help message

Environment Variables:
  SLACK_WEBHOOK_URL      Slack webhook for notifications
  EMAIL_NOTIFICATION     Email address for notifications
  DISCORD_WEBHOOK_URL    Discord webhook for notifications
  CHECK_INTERVAL         Check interval in seconds (default: 60)
  CPU_THRESHOLD          CPU usage threshold % (default: 80)
  MEMORY_THRESHOLD       Memory usage threshold % (default: 80)
  DISK_THRESHOLD         Disk usage threshold % (default: 85)

Examples:
  $0 start               # Start monitoring daemon
  $0 check               # Run single check
  $0 health              # Check health only
  $0 stop                # Stop daemon
EOF
            ;;
        *)
            run_monitoring_check
            ;;
    esac
}

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"
mkdir -p "$(dirname "$ALERT_FILE")"

# Run main function
main "$@"
