#!/bin/bash

# =============================================
# Tonmate - Consolidated Monitoring Script
# =============================================
# This script provides comprehensive monitoring for the Tonmate platform
# with configurable alerts, health checks, and system monitoring

# Configuration variables
HEALTH_ENDPOINT="http://localhost:3000/api/health"
LOG_FILE="/var/log/tonmate/monitoring.log"
ALERT_EMAIL=""
SLACK_WEBHOOK=""
CHECK_INTERVAL=60  # seconds
TIMEOUT=10

# Thresholds
CPU_THRESHOLD=80
MEMORY_THRESHOLD=80
DISK_THRESHOLD=85
MAX_RESPONSE_TIME=2000  # milliseconds
MAX_ERROR_RATE=5  # percentage

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================
# Utility Functions
# =============================================

# Create log directory if it doesn't exist
setup_logging() {
  log_dir=$(dirname "$LOG_FILE")
  if [ ! -d "$log_dir" ]; then
    mkdir -p "$log_dir" 2>/dev/null || {
      echo -e "${RED}Error: Cannot create log directory $log_dir${NC}"
      LOG_FILE="/tmp/tonmate-monitoring.log"
      echo -e "${YELLOW}Using alternative log file: $LOG_FILE${NC}"
    }
  fi
}

# Log message with timestamp
log() {
  local level=$1
  local message=$2
  local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
  echo -e "$timestamp [$level] $message" | tee -a "$LOG_FILE"
}

# Send email alert
send_email_alert() {
  local subject=$1
  local message=$2
  
  if [ -z "$ALERT_EMAIL" ]; then
    log "WARN" "Email alerts not configured. Set ALERT_EMAIL to enable."
    return
  fi
  
  echo "$message" | mail -s "Tonmate Alert: $subject" "$ALERT_EMAIL" 2>/dev/null || log "ERROR" "Failed to send email alert"
}

# Send Slack alert
send_slack_alert() {
  local message=$1
  
  if [ -z "$SLACK_WEBHOOK" ]; then
    log "WARN" "Slack alerts not configured. Set SLACK_WEBHOOK to enable."
    return
  }
  
  curl -s -X POST -H 'Content-type: application/json' --data "{\"text\":\"Tonmate Alert: $message\"}" "$SLACK_WEBHOOK" > /dev/null || log "ERROR" "Failed to send Slack alert"
}

# Send alert using configured methods
send_alert() {
  local subject=$1
  local message=$2
  local severity=${3:-"CRITICAL"}
  
  log "$severity" "$message"
  
  if [ "$severity" == "CRITICAL" ]; then
    send_email_alert "$subject" "$message"
    send_slack_alert "$message"
  elif [ "$severity" == "WARNING" ] && [ ! -z "$SLACK_WEBHOOK" ]; then
    send_slack_alert "$message"
  fi
}

# =============================================
# Health Check Functions
# =============================================

# Check API health endpoint
check_api_health() {
  log "INFO" "Checking API health at $HEALTH_ENDPOINT"
  
  local start_time=$(date +%s%3N)
  local health_status=$(curl -s -o /dev/null -w "%{http_code}" -m "$TIMEOUT" "$HEALTH_ENDPOINT")
  local end_time=$(date +%s%3N)
  local response_time=$((end_time - start_time))
  
  if [ "$health_status" -eq 200 ]; then
    log "INFO" "API health check: OK (Response time: ${response_time}ms)"
    if [ "$response_time" -gt "$MAX_RESPONSE_TIME" ]; then
      send_alert "Slow API Response" "API health check response time (${response_time}ms) exceeds threshold (${MAX_RESPONSE_TIME}ms)" "WARNING"
    fi
    return 0
  else
    send_alert "API Health Check Failed" "API health check failed with status code: $health_status"
    return 1
  fi
}

# Check PostgreSQL database
check_database() {
  log "INFO" "Checking PostgreSQL database"
  
  # Check if we can connect using DATABASE_URL environment variable
  if [ -n "$DATABASE_URL" ]; then
    if echo "$DATABASE_URL" | grep -q "postgresql"; then
      # Parse connection details from DATABASE_URL
      local pg_user=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\).*/\1/p')
      local pg_host=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\).*/\1/p')
      local pg_db=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
      
      if command -v psql >/dev/null 2>&1; then
        if PGPASSWORD=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\).*/\1/p') psql -h "$pg_host" -U "$pg_user" -d "$pg_db" -c "SELECT 1" >/dev/null 2>&1; then
          log "INFO" "Database connection: OK"
          return 0
        else
          send_alert "Database Connection Failed" "Unable to connect to PostgreSQL database at $pg_host"
          return 1
        fi
      else
        log "WARN" "PostgreSQL client (psql) not installed, skipping direct database check"
      fi
    else
      log "WARN" "DATABASE_URL is not using PostgreSQL - Tonmate requires PostgreSQL"
      send_alert "Database Configuration Issue" "DATABASE_URL is not set to PostgreSQL. SQLite is deprecated and no longer supported." "WARNING"
    fi
  else
    log "WARN" "DATABASE_URL environment variable not set"
  fi
  
  # Fall back to testing DB through API
  log "INFO" "Attempting database check through API"
  local db_status=$(curl -s "$HEALTH_ENDPOINT/database" | grep -c "healthy" || echo "0")
  
  if [ "$db_status" -gt 0 ]; then
    log "INFO" "Database health check through API: OK"
    return 0
  else
    send_alert "Database Health Check Failed" "Database health check through API failed"
    return 1
  fi
}

# Check system resources
check_system_resources() {
  log "INFO" "Checking system resources"
  
  # Check CPU usage
  if command -v top >/dev/null 2>&1; then
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}' | cut -d. -f1)
    log "INFO" "CPU Usage: ${cpu_usage}%"
    
    if [ "$cpu_usage" -gt "$CPU_THRESHOLD" ]; then
      send_alert "High CPU Usage" "CPU usage (${cpu_usage}%) exceeds threshold (${CPU_THRESHOLD}%)" "WARNING"
    fi
  else
    log "WARN" "top command not available, skipping CPU check"
  fi
  
  # Check memory usage
  if command -v free >/dev/null 2>&1; then
    local memory_usage=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
    log "INFO" "Memory Usage: ${memory_usage}%"
    
    if [ "$memory_usage" -gt "$MEMORY_THRESHOLD" ]; then
      send_alert "High Memory Usage" "Memory usage (${memory_usage}%) exceeds threshold (${MEMORY_THRESHOLD}%)" "WARNING"
    fi
  else
    log "WARN" "free command not available, skipping memory check"
  fi
  
  # Check disk usage
  if command -v df >/dev/null 2>&1; then
    local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    log "INFO" "Disk Usage: ${disk_usage}%"
    
    if [ "$disk_usage" -gt "$DISK_THRESHOLD" ]; then
      send_alert "High Disk Usage" "Disk usage (${disk_usage}%) exceeds threshold (${DISK_THRESHOLD}%)" "WARNING"
    fi
  else
    log "WARN" "df command not available, skipping disk check"
  fi
}

# Check logs for errors
check_logs() {
  log "INFO" "Checking application logs for errors"
  
  # Default Next.js log locations
  local log_paths=(
    "/var/log/tonmate/app.log"
    "./logs/app.log"
    "/tmp/tonmate-app.log"
  )
  
  local total_errors=0
  local found_logs=false
  
  for log_path in "${log_paths[@]}"; do
    if [ -f "$log_path" ]; then
      found_logs=true
      # Count errors in last 5 minutes
      local recent_errors=$(grep -i "error\|exception\|fail" "$log_path" | grep -c "$(date +"%Y-%m-%d %H:" -d "5 minutes ago")")
      total_errors=$((total_errors + recent_errors))
    fi
  done
  
  if [ "$found_logs" = true ]; then
    log "INFO" "Found $total_errors errors in logs in the last 5 minutes"
    if [ "$total_errors" -gt 5 ]; then
      send_alert "High Error Rate" "Found $total_errors errors in application logs in the last 5 minutes" "WARNING"
    fi
  else
    log "WARN" "No application log files found"
  fi
}

# Run all checks
run_all_checks() {
  check_api_health
  check_database
  check_system_resources
  check_logs
}

# =============================================
# Main Execution
# =============================================

# Setup logging
setup_logging

# Show monitoring header
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Tonmate Platform Monitoring${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Health Endpoint:${NC} $HEALTH_ENDPOINT"
echo -e "${BLUE}Check Interval:${NC} $CHECK_INTERVAL seconds"
echo -e "${BLUE}Log File:${NC} $LOG_FILE"
echo -e "${BLUE}========================================${NC}"

# Process command line arguments
case "$1" in
  start)
    log "INFO" "Starting continuous monitoring"
    while true; do
      run_all_checks
      sleep "$CHECK_INTERVAL"
    done
    ;;
  once)
    log "INFO" "Running one-time checks"
    run_all_checks
    ;;
  health)
    check_api_health
    ;;
  database)
    check_database
    ;;
  system)
    check_system_resources
    ;;
  logs)
    check_logs
    ;;
  *)
    echo "Usage: $0 {start|once|health|database|system|logs}"
    echo
    echo "Commands:"
    echo "  start     Start continuous monitoring"
    echo "  once      Run all checks once"
    echo "  health    Check API health only"
    echo "  database  Check database only"
    echo "  system    Check system resources only"
    echo "  logs      Check application logs only"
    exit 1
    ;;
esac

exit 0
