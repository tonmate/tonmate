# 🚀 Quick Start Guide

Get your Tonmate platform up and running in under 10 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- AI provider API keys (configured per user through the web interface)

## 1. Clone and Setup

```bash
git clone https://github.com/aryasadeghy/tonmate.git
cd tonmate
npm install
```

## 2. Environment Configuration

Copy the environment template:

```bash
cp environment.example .env
```

Edit `.env` with your settings:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/support_db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# AI Provider API keys are configured per user through the web interface
# No global API key configuration required

# Encryption
ENCRYPTION_KEY="your-32-character-encryption-key"
```

## 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma db push

# (Optional) Seed with sample data
npm run db:seed
```

## 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your platform!

## 5. Create Your First Agent

1. **Sign up** at `http://localhost:3000/signup`
2. **Dashboard** → Click "Create Agent"
3. **Configure** your agent:
   - Name: "Support Bot"
   - Model: "gpt-4"
   - Description: "Customer support assistant"
4. **Add Knowledge Sources**:
   - Click "Add Knowledge Source"
   - Enter your website URL
   - Wait for crawling to complete
5. **Test** in the playground

## 6. Deploy to Production

### Option A: Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Option B: Docker

```bash
# Build and run
docker-compose up -d

# Or use production config
docker-compose -f docker-compose.prod.yml up -d
```

### Option C: Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 7. Configure Your Domain

1. **Set up DNS** to point to your server
2. **Configure SSL** (automatic with Vercel)
3. **Update environment variables**:
   ```env
   NEXTAUTH_URL="https://yourdomain.com"
   ```

## 8. Embed Your Widget

Copy the embed code from the Developer Tools section:

```html
<script src="https://yourdomain.com/embed.js"></script>
<script>
  UniversalSupport.init({
    agentId: "your-agent-id",
    apiKey: "your-api-key",
    position: "bottom-right"
  });
</script>
```

## Next Steps

- [📖 Read the full documentation](./README.md)
- [🔧 Configure advanced settings](./DEPLOYMENT.md)
- [🛡️ Review security checklist](./SECURITY.md)
- [🐛 Report issues](https://github.com/aryasadeghy/tonmate/issues)

## Common Issues

### Database Connection Error
```bash
# Check your DATABASE_URL format
DATABASE_URL="postgresql://user:password@host:port/database"
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### API Key Issues
```bash
# Configure API keys through the web interface after login
# Go to Settings > AI Provider Integrations
```

## Support

- 📚 [Documentation](./README.md)
- 💬 [Discord Community](https://discord.gg/universal-ai-support)
- 🐛 [GitHub Issues](https://github.com/aryasadeghy/tonmate/issues)
- 📧 [Email Support](mailto:support@universalaisupport.com)

---

**🎉 Congratulations! Your Tonmate platform is now ready to help your customers!**
