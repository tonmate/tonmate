#!/bin/bash

# Tonmate - Monitoring Script
# This script provides comprehensive monitoring for the production deployment

set -e

# Configuration
HEALTH_ENDPOINT="http://localhost:3000/api/health"
LOG_FILE="/var/log/monitoring.log"
ALERT_EMAIL="alerts@example.com"
SLACK_WEBHOOK=""
CHECK_INTERVAL=30
MAX_RETRIES=3

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_info() {
    log "INFO: $1"
}

log_warning() {
    log "WARNING: $1"
}

log_error() {
    log "ERROR: $1"
}

# Health check
check_health() {
    local retries=0
    local max_retries=${MAX_RETRIES:-3}
    
    while [ $retries -lt $max_retries ]; do
        if curl -f -s "$HEALTH_ENDPOINT" > /dev/null 2>&1; then
            log_info "Health check passed"
            return 0
        else
            retries=$((retries + 1))
            log_warning "Health check failed (attempt $retries/$max_retries)"
            sleep 5
        fi
    done
    
    log_error "Health check failed after $max_retries attempts"
    return 1
}

# Database connectivity check
check_database() {
    if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
        log_info "Database connectivity check passed"
        return 0
    else
        log_error "Database connectivity check failed"
        return 1
    fi
}

# Disk space check
check_disk_space() {
    local usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    local threshold=${DISK_THRESHOLD:-80}
    
    if [ "$usage" -gt "$threshold" ]; then
        log_warning "Disk usage is high: ${usage}%"
        return 1
    else
        log_info "Disk usage is normal: ${usage}%"
        return 0
    fi
}

# Memory check
check_memory() {
    local memory_usage=$(free | grep Mem | awk '{printf("%.2f"), $3/$2 * 100.0}')
    local threshold=${MEMORY_THRESHOLD:-85}
    
    if [ "$(echo "$memory_usage > $threshold" | bc -l)" -eq 1 ]; then
        log_warning "Memory usage is high: ${memory_usage}%"
        return 1
    else
        log_info "Memory usage is normal: ${memory_usage}%"
        return 0
    fi
}

# CPU check
check_cpu() {
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    local threshold=${CPU_THRESHOLD:-80}
    
    if [ "$(echo "$cpu_usage > $threshold" | bc -l)" -eq 1 ]; then
        log_warning "CPU usage is high: ${cpu_usage}%"
        return 1
    else
        log_info "CPU usage is normal: ${cpu_usage}%"
        return 0
    fi
}

# Process check
check_processes() {
    local processes=("node" "npm" "next")
    
    for process in "${processes[@]}"; do
        if pgrep -f "$process" > /dev/null; then
            log_info "Process $process is running"
        else
            log_warning "Process $process is not running"
            return 1
        fi
    done
    
    return 0
}

# Port check
check_ports() {
    local ports=(3000 5432)
    
    for port in "${ports[@]}"; do
        if netstat -tuln | grep ":$port " > /dev/null; then
            log_info "Port $port is open"
        else
            log_warning "Port $port is not open"
            return 1
        fi
    done
    
    return 0
}

# Log analysis
analyze_logs() {
    local log_files=("/var/log/nginx/error.log" "/var/log/app.log" "$LOG_FILE")
    local error_threshold=${ERROR_THRESHOLD:-10}
    
    for log_file in "${log_files[@]}"; do
        if [ -f "$log_file" ]; then
            local error_count=$(grep -i "error\|exception\|fatal" "$log_file" | wc -l)
            if [ "$error_count" -gt "$error_threshold" ]; then
                log_warning "High error count in $log_file: $error_count"
            else
                log_info "Error count in $log_file is normal: $error_count"
            fi
        fi
    done
}

# Performance metrics
collect_metrics() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    local memory_usage=$(free | grep Mem | awk '{printf("%.2f"), $3/$2 * 100.0}')
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    local load_avg=$(uptime | awk -F'load average:' '{print $2}')
    
    echo "$timestamp,CPU:$cpu_usage,Memory:$memory_usage,Disk:$disk_usage,Load:$load_avg" >> /var/log/metrics.csv
}

# Alert system
send_alert() {
    local message="$1"
    local severity="${2:-INFO}"
    
    # Email alert
    if [ -n "$ALERT_EMAIL" ]; then
        echo "$message" | mail -s "[$severity] Tonmate Alert" "$ALERT_EMAIL"
    fi
    
    # Slack alert
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"[$severity] $message\"}" \
            "$SLACK_WEBHOOK"
    fi
    
    # Log alert
    log_error "ALERT: $message"
}

# Main monitoring function
run_monitoring() {
    log_info "Starting monitoring cycle"
    
    local failed_checks=0
    local checks=("health" "database" "disk_space" "memory" "cpu" "processes" "ports")
    
    for check in "${checks[@]}"; do
        if ! "check_$check"; then
            failed_checks=$((failed_checks + 1))
        fi
    done
    
    # Analyze logs
    analyze_logs
    
    # Collect metrics
    collect_metrics
    
    # Send alerts if needed
    if [ $failed_checks -gt 0 ]; then
        send_alert "Monitoring detected $failed_checks failed checks" "WARNING"
    fi
    
    log_info "Monitoring cycle completed (failed checks: $failed_checks)"
}

# Continuous monitoring
continuous_monitoring() {
    log_info "Starting continuous monitoring (interval: ${CHECK_INTERVAL}s)"
    
    while true; do
        run_monitoring
        sleep "$CHECK_INTERVAL"
    done
}

# System info
show_system_info() {
    echo "System Information:"
    echo "=================="
    echo "OS: $(uname -s)"
    echo "Kernel: $(uname -r)"
    echo "Architecture: $(uname -m)"
    echo "Uptime: $(uptime)"
    echo "Load Average: $(uptime | awk -F'load average:' '{print $2}')"
    echo "CPU: $(nproc) cores"
    echo "Memory: $(free -h | grep Mem | awk '{print $2}')"
    echo "Disk: $(df -h / | tail -1 | awk '{print $2}')"
    echo ""
}

# Usage information
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help         Show this help message"
    echo "  -c, --continuous   Run continuous monitoring"
    echo "  -o, --once         Run monitoring once"
    echo "  -s, --system       Show system information"
    echo "  -t, --test         Test all monitoring functions"
    echo ""
    echo "Environment Variables:"
    echo "  HEALTH_ENDPOINT    Health check endpoint (default: http://localhost:3000/api/health)"
    echo "  CHECK_INTERVAL     Monitoring interval in seconds (default: 30)"
    echo "  ALERT_EMAIL        Email address for alerts"
    echo "  SLACK_WEBHOOK      Slack webhook URL for alerts"
    echo "  DISK_THRESHOLD     Disk usage threshold percentage (default: 80)"
    echo "  MEMORY_THRESHOLD   Memory usage threshold percentage (default: 85)"
    echo "  CPU_THRESHOLD      CPU usage threshold percentage (default: 80)"
    echo "  ERROR_THRESHOLD    Error count threshold (default: 10)"
}

# Main execution
main() {
    case "${1:-}" in
        -h|--help)
            show_usage
            ;;
        -c|--continuous)
            continuous_monitoring
            ;;
        -o|--once)
            run_monitoring
            ;;
        -s|--system)
            show_system_info
            ;;
        -t|--test)
            log_info "Testing all monitoring functions"
            run_monitoring
            ;;
        *)
            show_usage
            ;;
    esac
}

# Handle script interruption
trap 'log_info "Monitoring stopped"; exit 0' SIGINT SIGTERM

# Run main function
main "$@"
