# Instagram Customer Support Agent - Next.js

A modern, AI-powered customer support agent for Instagram shops built with Next.js, LangChain.js, and OpenAI. This application provides automated customer support through intelligent conversation handling, product search, order tracking, and store information assistance.

## 🚀 Features

- **Smart Product Search**: AI understands natural language queries to help customers find products
- **Order Tracking**: Instant order status updates and tracking information
- **Store Information**: Automated responses for policies, shipping, and contact information
- **24/7 Availability**: Round-the-clock automated customer support
- **Instagram Integration**: Ready for Instagram Business API webhook integration
- **Modern UI**: Beautiful, responsive web interface built with Tailwind CSS
- **User Authentication**: Secure signup/login with NextAuth.js
- **Database Storage**: Persistent data storage with Prisma ORM
- **Demo Mode**: Works without OpenAI API key for testing and demonstration

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: LangChain.js, OpenAI GPT
- **Database**: Prisma ORM with PostgreSQL (production) / SQLite (development)
- **Authentication**: NextAuth.js with Credentials provider
- **Deployment**: Vercel-ready configuration

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd instagram-support-agent-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp environment.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   # NextAuth Configuration
   NEXTAUTH_SECRET=your_secret_here_minimum_32_characters_long
   NEXTAUTH_URL=http://localhost:3000
   
   # Database Configuration  
   # For development (SQLite):
   DATABASE_URL="file:./prisma/dev.db"
   # For production (PostgreSQL):
   # POSTGRES_URL="your_postgres_connection_string_here"
   # POSTGRES_URL_NON_POOLING="your_postgres_non_pooling_connection_string_here"
   
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Shop Configuration
   SHOP_NAME=Your Shop Name
   SHOP_DESCRIPTION=Brief description of your shop
   SHOP_POLICIES=Return and refund policies
   SHOP_CONTACT_EMAIL=support@yourshop.com
   SHOP_CONTACT_PHONE=+1234567890
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 Usage

### Web Interface

1. **Landing Page**: Visit the home page to learn about features
2. **Interactive Demo**: Click "Try Demo" to test the chat interface
3. **Chat Interface**: Located at `/chat` for direct interaction

### API Endpoints

#### Chat API
```bash
POST /api/chat
Content-Type: application/json

{
  "message": "Do you have white t-shirts in size M?",
  "userId": "user123"
}
```

#### Instagram Webhook
```bash
POST /api/chat/instagram
# Handles Instagram webhook events
```

### Example Queries

- "Do you have white t-shirts in size M?"
- "What's the status of order ORD-001?"
- "What's your return policy?"
- "Do you ship internationally?"
- "I need help with my recent order"

## 🔧 Configuration

### Shop Configuration

Update your shop details in `.env.local`:

```env
SHOP_NAME=Your Shop Name
SHOP_DESCRIPTION=Brief description of your shop
SHOP_POLICIES=30-day return policy. Free shipping on orders over $50.
SHOP_CONTACT_EMAIL=support@yourshop.com
SHOP_CONTACT_PHONE=+1-555-FASHION
```

### Instagram Integration

For Instagram webhook integration:

1. Set up Instagram Business API
2. Configure webhook URL: `https://yourdomain.com/api/chat/instagram`
3. Add environment variables:
   ```env
   INSTAGRAM_ACCESS_TOKEN=your_access_token
   INSTAGRAM_PAGE_ID=your_page_id
   INSTAGRAM_VERIFY_TOKEN=your_verify_token
   ```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Set up Database**
   - Go to Vercel Dashboard > Your Project > Storage
   - Click "Create Database" > "Postgres"
   - Choose a name and region
   - Vercel will automatically set up `POSTGRES_URL` and `POSTGRES_URL_NON_POOLING` variables

3. **Set environment variables** in Vercel dashboard
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Your production URL (e.g., `https://your-app.vercel.app`)
   - All other environment variables from your local `.env.local`

4. **Deploy**: Automatic deployment on git push
   - The `postinstall` and `build` scripts will handle Prisma setup automatically

### Other Platforms

The application can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📁 Project Structure

```
instagram-support-agent-nextjs/
├── src/
│   └── app/
│       ├── api/
│       │   └── chat/
│       │       ├── route.ts          # Main chat API
│       │       └── instagram/
│       │           └── route.ts      # Instagram webhook
│       ├── chat/
│       │   └── page.tsx             # Chat interface
│       ├── globals.css              # Global styles
│       ├── layout.tsx               # Root layout
│       └── page.tsx                 # Landing page
├── lib/
│   ├── agents/
│   │   └── CustomerSupportAgent.js  # Main AI agent
│   ├── models/
│   │   ├── Order.js                 # Order model
│   │   └── Product.js               # Product model
│   ├── tools/
│   │   ├── OrderLookupTool.js       # Order lookup functionality
│   │   ├── ProductSearchTool.js     # Product search functionality
│   │   └── ShopInfoTool.js          # Shop information tool
│   └── utils/
│       ├── instagramWebhook.js      # Instagram utilities
│       └── validation.js            # Input validation
├── .env.example                     # Environment template
├── .env.local                       # Local environment
├── next.config.ts                   # Next.js configuration
├── package.json                     # Dependencies
├── tailwind.config.ts               # Tailwind configuration
├── tsconfig.json                    # TypeScript configuration
└── vercel.json                      # Vercel deployment config
```

## 🧪 Demo Mode

The application includes a demo mode that works without an OpenAI API key:

- Provides realistic responses for common queries
- Demonstrates all features without API costs
- Perfect for testing and demonstrations
- Automatically enabled when `OPENAI_API_KEY` is not set

## 🔒 Security

- Input validation using Joi
- Rate limiting ready for production
- Secure environment variable handling
- Instagram webhook signature verification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review example queries and responses

## 🔄 Migration from Express

This is the Next.js version of the original Express.js Instagram Customer Support Agent. Key improvements:

- **Modern Framework**: Next.js with App Router
- **Better Performance**: Server-side rendering and optimization
- **Improved UI**: Professional landing page and chat interface
- **Type Safety**: Full TypeScript support
- **Easy Deployment**: Vercel-optimized configuration
- **Better DX**: Hot reloading and modern development tools

---

Built with ❤️ using Next.js, LangChain.js, and OpenAI
