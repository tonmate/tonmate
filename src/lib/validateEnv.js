#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * Validates required environment variables for the Customer Support AI Agent
 */

const fs = require('fs');
const path = require('path');

// Define required environment variables
const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'DATABASE_URL',
];

// Define optional but recommended environment variables
const recommendedEnvVars = [
  'OPENAI_API_KEY',
  'ENCRYPTION_KEY',
  'JWT_SECRET',
  'LOG_LEVEL',
];

// Define production-only required variables
const productionRequiredVars = [
  'OPENAI_API_KEY',
  'ENCRYPTION_KEY',
  'JWT_SECRET',
];

// Color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function validateEnvironment() {
  log('\n🔍 Validating Environment Variables...', colors.blue);
  
  const isProduction = process.env.NODE_ENV === 'production';
  const errors = [];
  const warnings = [];
  const info = [];

  // Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    errors.push('Missing .env.local file. Run: npm run setup:env');
  }

  // Validate required variables
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    } else {
      info.push(`✓ ${varName} is set`);
    }
  });

  // Validate production-specific variables
  if (isProduction) {
    productionRequiredVars.forEach(varName => {
      if (!process.env[varName]) {
        errors.push(`Missing production-required environment variable: ${varName}`);
      }
    });
  }

  // Check recommended variables
  recommendedEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(`Recommended environment variable not set: ${varName}`);
    } else {
      info.push(`✓ ${varName} is set`);
    }
  });

  // Validate specific variable formats
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    errors.push('NEXTAUTH_SECRET must be at least 32 characters long');
  }

  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.startsWith('http')) {
    errors.push('NEXTAUTH_URL must be a valid URL starting with http or https');
  }

  if (process.env.DATABASE_URL) {
    if (process.env.DATABASE_URL.startsWith('file:') && isProduction) {
      warnings.push('Using SQLite in production is not recommended. Consider PostgreSQL.');
    }
  }

  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-')) {
    errors.push('OPENAI_API_KEY appears to be invalid (should start with sk-)');
  }

  // Validate numeric values
  if (process.env.MAX_FILE_SIZE && isNaN(Number(process.env.MAX_FILE_SIZE))) {
    errors.push('MAX_FILE_SIZE must be a valid number');
  }

  if (process.env.MAX_CRAWL_DEPTH && isNaN(Number(process.env.MAX_CRAWL_DEPTH))) {
    errors.push('MAX_CRAWL_DEPTH must be a valid number');
  }

  // Check for development-specific issues
  if (!isProduction) {
    if (process.env.NEXTAUTH_URL !== 'http://localhost:3000') {
      info.push('NEXTAUTH_URL is set to non-localhost for development');
    }
  }

  // Display results
  log('\n📋 Validation Results:', colors.bold);
  
  if (info.length > 0) {
    log('\n✅ Valid Configuration:', colors.green);
    info.forEach(message => log(`  ${message}`, colors.green));
  }

  if (warnings.length > 0) {
    log('\n⚠️  Warnings:', colors.yellow);
    warnings.forEach(message => log(`  ${message}`, colors.yellow));
  }

  if (errors.length > 0) {
    log('\n❌ Errors:', colors.red);
    errors.forEach(message => log(`  ${message}`, colors.red));
    
    log('\n🔧 Quick Fix Commands:', colors.blue);
    log('  npm run setup:env     # Copy environment template');
    log('  npm run setup:secrets # Generate secure secrets');
    log('  npm run setup:complete # Complete setup');
    
    process.exit(1);
  }

  log('\n✅ Environment validation passed!', colors.green);
  
  if (warnings.length > 0) {
    log('\n💡 Consider addressing the warnings above for optimal performance.', colors.yellow);
  }
}

// Generate secure secrets helper
function generateSecrets() {
  const crypto = require('crypto');
  
  log('\n🔐 Generated Secure Secrets:', colors.blue);
  log('Add these to your .env.local file:\n', colors.yellow);
  
  const secrets = {
    NEXTAUTH_SECRET: crypto.randomBytes(32).toString('base64'),
    ENCRYPTION_KEY: crypto.randomBytes(32).toString('hex'),
    JWT_SECRET: crypto.randomBytes(32).toString('base64'),
  };
  
  Object.entries(secrets).forEach(([key, value]) => {
    log(`${key}=${value}`, colors.green);
  });
  
  log('\n⚠️  Keep these secrets secure and never commit them to version control!', colors.red);
}

// Main execution
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'secrets') {
    generateSecrets();
  } else {
    validateEnvironment();
  }
}

module.exports = { validateEnvironment, generateSecrets };
