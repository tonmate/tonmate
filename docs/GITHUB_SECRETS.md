# GitHub Secrets Configuration

This document describes the required GitHub secrets for the Tonmate CI/CD workflows.

## Required Configuration

Navigate to your GitHub repository → Settings → Secrets and variables → Actions

### Database Configuration

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `DATABASE_URL` | PostgreSQL connection string for CI/CD | `postgresql://username:password@host:5432/database` |

### Authentication Secrets

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `NEXTAUTH_SECRET` | NextAuth.js secret key | Generate with `openssl rand -base64 32` |
| `JWT_SECRET` | JWT token secret | Generate with `openssl rand -base64 32` |
| `ENCRYPTION_KEY` | Data encryption key | Generate with `openssl rand -base64 32` |

### Public Configuration Variables

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| `NEXTAUTH_URL` | NextAuth.js URL | `https://your-domain.com` |

### API Keys

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |

### VPS Deployment Secrets

For deploying to your VPS server, you'll need these additional secrets:

| Secret | Description | Example |
|--------|-------------|----------|
| `SSH_PRIVATE_KEY` | Private SSH key for VPS access | `-----BEGIN RSA PRIVATE KEY-----...` |
| `SSH_USER` | SSH username for VPS | `deploy` |
| `VPS_HOST` | VPS hostname or IP address | `your-server.com` |
| `SENTRY_AUTH_TOKEN` | Sentry authentication token (optional) | `sntrys_1234567890abcdef` |

## Setting Up Configuration

1. **Go to GitHub Repository Settings:**
   - Navigate to your repository
   - Click on "Settings" tab
   - Click on "Secrets and variables" → "Actions"

2. **Add secrets:**
   - Click "New repository secret"
   - Enter the secret name (exact case-sensitive match)
   - Enter the secret value
   - Click "Add secret"

3. **Add variables:**
   - Click "Variables" tab
   - Click "New repository variable"
   - Enter the variable name (exact case-sensitive match)
   - Enter the variable value
   - Click "Add variable"

## Production vs Development

### For CI/CD Testing:
- Use test database credentials for `DATABASE_URL`
- Use dummy/test values for other secrets
- The workflows have fallback values if secrets are not set

### For Production Deployment:
- Use production database credentials
- Use secure, randomly generated secrets
- Use real API keys

## Generating Secure Secrets

```bash
# Generate secure random keys
openssl rand -base64 32  # For NEXTAUTH_SECRET
openssl rand -base64 32  # For JWT_SECRET  
openssl rand -base64 32  # For ENCRYPTION_KEY
```

## Environment Variables vs Secrets

- **GitHub Secrets**: Sensitive data like API keys, database credentials, encryption keys
- **Environment Variables**: Non-sensitive configuration like URLs, feature flags
- **Fallback Values**: The workflows include fallback values for testing environments

## Workflow Behavior

Each workflow will:
1. Check if GitHub secret exists
2. Use the secret value if available
3. Fall back to default test values if not set
4. Log which values are being used (secrets are masked in logs)

## Security Best Practices

- ✅ Use different secrets for different environments
- ✅ Rotate secrets regularly
- ✅ Use least-privilege database credentials
- ✅ Monitor secret usage in workflow logs
- ❌ Never commit secrets to repository
- ❌ Never use production secrets in CI/CD testing

## Troubleshooting

### "Environment variable not found" errors:
- Check secret name spelling (case-sensitive)
- Verify secret exists in repository settings
- Check workflow syntax for `${{ secrets.SECRET_NAME }}`

### Database connection errors:
- Verify `DATABASE_URL` format
- Check database server accessibility
- Ensure database exists and credentials are correct

---

For more information, see the [GitHub Actions documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets).
