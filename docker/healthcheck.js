#!/usr/bin/env node

/**
 * Tonmate - Health Check Script
 * This script performs comprehensive health checks for the application
 */

const http = require('http');
const https = require('https');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    healthEndpoint: process.env.HEALTH_ENDPOINT || 'http://localhost:3000/api/health',
    timeout: parseInt(process.env.HEALTH_TIMEOUT) || 10000,
    retries: parseInt(process.env.HEALTH_RETRIES) || 3,
    retryDelay: parseInt(process.env.HEALTH_RETRY_DELAY) || 2000,
    checks: {
        database: process.env.HEALTH_CHECK_DATABASE !== 'false',
        redis: process.env.HEALTH_CHECK_REDIS !== 'false',
        disk: process.env.HEALTH_CHECK_DISK !== 'false',
        memory: process.env.HEALTH_CHECK_MEMORY !== 'false',
        api: process.env.HEALTH_CHECK_API !== 'false'
    }
};

// Colors for output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Logging functions
const log = (message, color = 'reset') => {
    const timestamp = new Date().toISOString();
    console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
};

const success = (message) => log(`✅ ${message}`, 'green');
const error = (message) => log(`❌ ${message}`, 'red');
const warning = (message) => log(`⚠️  ${message}`, 'yellow');
const info = (message) => log(`ℹ️  ${message}`, 'blue');

// Health check results
const results = {
    overall: 'healthy',
    checks: {},
    timestamp: new Date().toISOString(),
    duration: 0
};

// Utility functions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const httpRequest = (url, options = {}) => {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https://') ? https : http;
        const req = client.request(url, {
            timeout: CONFIG.timeout,
            ...options
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: data
                });
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
};

const execCommand = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
};

// Health check functions
const checkApiHealth = async () => {
    info('Checking API health...');
    
    try {
        const response = await httpRequest(CONFIG.healthEndpoint, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'HealthCheck/1.0'
            }
        });

        if (response.statusCode === 200) {
            const healthData = JSON.parse(response.data);
            
            results.checks.api = {
                status: 'healthy',
                responseTime: healthData.timestamp ? Date.now() - new Date(healthData.timestamp).getTime() : 0,
                statusCode: response.statusCode,
                details: healthData
            };
            
            success('API health check passed');
            return true;
        } else {
            throw new Error(`API returned status ${response.statusCode}`);
        }
    } catch (err) {
        results.checks.api = {
            status: 'unhealthy',
            error: err.message,
            timestamp: new Date().toISOString()
        };
        
        error(`API health check failed: ${err.message}`);
        return false;
    }
};

const checkDatabaseHealth = async () => {
    if (!CONFIG.checks.database) {
        info('Database health check skipped');
        return true;
    }

    info('Checking database health...');
    
    try {
        // Check if database process is running
        const dbCheck = await execCommand('pgrep -f postgres || pgrep -f mysql || pgrep -f sqlite');
        
        results.checks.database = {
            status: 'healthy',
            processRunning: true,
            timestamp: new Date().toISOString()
        };
        
        success('Database health check passed');
        return true;
    } catch (err) {
        results.checks.database = {
            status: 'unhealthy',
            error: err.message,
            processRunning: false,
            timestamp: new Date().toISOString()
        };
        
        error(`Database health check failed: ${err.message}`);
        return false;
    }
};

const checkRedisHealth = async () => {
    if (!CONFIG.checks.redis) {
        info('Redis health check skipped');
        return true;
    }

    info('Checking Redis health...');
    
    try {
        const redisCheck = await execCommand('redis-cli ping || echo "Redis not available"');
        
        if (redisCheck.stdout.includes('PONG')) {
            results.checks.redis = {
                status: 'healthy',
                response: 'PONG',
                timestamp: new Date().toISOString()
            };
            
            success('Redis health check passed');
            return true;
        } else {
            throw new Error('Redis not responding');
        }
    } catch (err) {
        results.checks.redis = {
            status: 'unhealthy',
            error: err.message,
            timestamp: new Date().toISOString()
        };
        
        warning(`Redis health check failed: ${err.message}`);
        return false; // Redis might be optional
    }
};

const checkDiskSpace = async () => {
    if (!CONFIG.checks.disk) {
        info('Disk space check skipped');
        return true;
    }

    info('Checking disk space...');
    
    try {
        const diskCheck = await execCommand('df -h / | tail -1');
        const diskInfo = diskCheck.stdout.split(/\s+/);
        const usedPercentage = parseInt(diskInfo[4]);
        
        const isHealthy = usedPercentage < 90;
        
        results.checks.disk = {
            status: isHealthy ? 'healthy' : 'warning',
            usedPercentage: usedPercentage,
            available: diskInfo[3],
            total: diskInfo[1],
            timestamp: new Date().toISOString()
        };
        
        if (isHealthy) {
            success(`Disk space check passed (${usedPercentage}% used)`);
        } else {
            warning(`Disk space warning (${usedPercentage}% used)`);
        }
        
        return isHealthy;
    } catch (err) {
        results.checks.disk = {
            status: 'unhealthy',
            error: err.message,
            timestamp: new Date().toISOString()
        };
        
        error(`Disk space check failed: ${err.message}`);
        return false;
    }
};

const checkMemoryUsage = async () => {
    if (!CONFIG.checks.memory) {
        info('Memory usage check skipped');
        return true;
    }

    info('Checking memory usage...');
    
    try {
        const memCheck = await execCommand('free -m | grep Mem');
        const memInfo = memCheck.stdout.split(/\s+/);
        const total = parseInt(memInfo[1]);
        const used = parseInt(memInfo[2]);
        const usedPercentage = Math.round((used / total) * 100);
        
        const isHealthy = usedPercentage < 85;
        
        results.checks.memory = {
            status: isHealthy ? 'healthy' : 'warning',
            usedPercentage: usedPercentage,
            used: `${used}MB`,
            total: `${total}MB`,
            timestamp: new Date().toISOString()
        };
        
        if (isHealthy) {
            success(`Memory usage check passed (${usedPercentage}% used)`);
        } else {
            warning(`Memory usage warning (${usedPercentage}% used)`);
        }
        
        return isHealthy;
    } catch (err) {
        results.checks.memory = {
            status: 'unhealthy',
            error: err.message,
            timestamp: new Date().toISOString()
        };
        
        error(`Memory usage check failed: ${err.message}`);
        return false;
    }
};

// Main health check function
const performHealthCheck = async () => {
    const startTime = Date.now();
    
    log('🏥 Starting health check...', 'cyan');
    
    const checks = [
        checkApiHealth(),
        checkDatabaseHealth(),
        checkRedisHealth(),
        checkDiskSpace(),
        checkMemoryUsage()
    ];
    
    const checkResults = await Promise.allSettled(checks);
    
    // Determine overall health
    const healthyCount = checkResults.filter(result => result.status === 'fulfilled' && result.value).length;
    const totalCount = checkResults.length;
    
    if (healthyCount === totalCount) {
        results.overall = 'healthy';
        success('All health checks passed');
    } else if (healthyCount >= totalCount * 0.7) {
        results.overall = 'degraded';
        warning('Some health checks failed, but core functionality is available');
    } else {
        results.overall = 'unhealthy';
        error('Multiple health checks failed');
    }
    
    results.duration = Date.now() - startTime;
    
    log(`🕐 Health check completed in ${results.duration}ms`, 'cyan');
    
    return results;
};

// Retry mechanism
const performHealthCheckWithRetry = async () => {
    let lastError;
    
    for (let attempt = 1; attempt <= CONFIG.retries; attempt++) {
        try {
            info(`Health check attempt ${attempt}/${CONFIG.retries}`);
            
            const result = await performHealthCheck();
            
            if (result.overall === 'healthy') {
                return result;
            }
            
            if (attempt < CONFIG.retries) {
                warning(`Attempt ${attempt} failed, retrying in ${CONFIG.retryDelay}ms...`);
                await sleep(CONFIG.retryDelay);
            }
            
            lastError = new Error(`Health check failed: ${result.overall}`);
        } catch (err) {
            lastError = err;
            
            if (attempt < CONFIG.retries) {
                error(`Attempt ${attempt} failed: ${err.message}`);
                warning(`Retrying in ${CONFIG.retryDelay}ms...`);
                await sleep(CONFIG.retryDelay);
            }
        }
    }
    
    throw lastError;
};

// Main execution
const main = async () => {
    try {
        const result = await performHealthCheckWithRetry();
        
        // Output results
        console.log('\n' + '='.repeat(50));
        console.log('HEALTH CHECK RESULTS');
        console.log('='.repeat(50));
        console.log(JSON.stringify(result, null, 2));
        console.log('='.repeat(50));
        
        // Exit with appropriate code
        if (result.overall === 'healthy') {
            process.exit(0);
        } else if (result.overall === 'degraded') {
            process.exit(1);
        } else {
            process.exit(2);
        }
    } catch (err) {
        error(`Health check failed: ${err.message}`);
        
        // Output error results
        console.log('\n' + '='.repeat(50));
        console.log('HEALTH CHECK FAILED');
        console.log('='.repeat(50));
        console.log(JSON.stringify({
            overall: 'unhealthy',
            error: err.message,
            timestamp: new Date().toISOString()
        }, null, 2));
        console.log('='.repeat(50));
        
        process.exit(3);
    }
};

// Handle script execution
if (require.main === module) {
    main();
}

module.exports = {
    performHealthCheck,
    performHealthCheckWithRetry
};
