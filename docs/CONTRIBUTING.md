# Contributing to Tonmate

Thank you for your interest in contributing to Tonmate! We welcome contributions from the community.

## 🚀 Getting Started

1. **Fork the repository** and clone it locally
2. **Install dependencies**: `npm install`
3. **Set up your environment**: `cp environment.example .env.local`
4. **Set up the database**: `npm run db:push`
5. **Start development server**: `npm run dev`

## 📝 Development Workflow

### Code Style
- We use **TypeScript** for type safety
- **ESLint** and **Prettier** for code formatting
- **Tailwind CSS** for styling
- Follow existing code patterns and conventions

### Testing
- Write tests for new features and bug fixes
- Run tests with `npm test`
- Ensure all tests pass before submitting PR

### Database Changes
- Use **Prisma** for database schema changes
- Create migrations with `npm run db:migrate`
- Test migrations thoroughly

## 🔧 Contribution Types

### Bug Reports
- Use the GitHub issue template
- Include steps to reproduce
- Provide system information
- Include relevant logs or screenshots

### Feature Requests
- Use the GitHub issue template
- Describe the use case
- Provide mockups or examples if applicable
- Consider discussing in issues first

### Code Contributions
- Create a feature branch: `git checkout -b feature/your-feature`
- Make your changes with clear commit messages
- Add tests for your changes
- Update documentation if needed
- Submit a pull request

## 📋 Pull Request Guidelines

### Before Submitting
- [ ] All tests pass (`npm test`)
- [ ] Code builds successfully (`npm run build`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Code follows project conventions
- [ ] Documentation updated if needed

### PR Description
- Clearly describe what the PR does
- Link to related issues
- Include screenshots for UI changes
- List any breaking changes

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/            # Reusable UI components
├── lib/                   # Core business logic
│   ├── agents/           # AI agent implementations
│   ├── crawler/          # Web crawling system
│   ├── embeddings/       # Vector embeddings
│   └── knowledge/        # Knowledge base processing
├── hooks/                # Custom React hooks
└── types/                # TypeScript type definitions
```

## 🧪 Testing

### Running Tests
```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage
```

### Test Categories
- **Unit Tests**: Individual functions and components
- **Integration Tests**: API endpoints and workflows
- **E2E Tests**: Complete user flows

## 📚 Documentation

### Code Documentation
- Use JSDoc for functions and classes
- Include examples for complex APIs
- Keep README.md updated

### API Documentation
- Document all API endpoints
- Include request/response examples
- Update OpenAPI specs if available

## 🔐 Security

### Reporting Security Issues
- **DO NOT** create public issues for security vulnerabilities
- Email security concerns to: [security@example.com]
- We'll respond within 48 hours

### Security Guidelines
- Never commit API keys or secrets
- Use environment variables for configuration
- Follow OWASP security practices
- Validate all user inputs

## 🎯 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Follow GitHub's Community Guidelines

## 📞 Getting Help

### Community Support
- GitHub Issues for bug reports and feature requests
- GitHub Discussions for questions and ideas
- Discord/Slack community (if available)

### Maintainer Contact
- GitHub: [@aryasadeghy](https://github.com/aryasadeghy)
- Email: [contact@example.com]

## 🏆 Recognition

Contributors are recognized in:
- GitHub contributors page
- Release notes
- Project README
- Annual contributor highlights

## 📋 Development Setup

### Prerequisites
- Node.js 20.x or later
- npm or yarn
- PostgreSQL (required for both production and development)
- Docker (optional, for containerized development)

### Environment Variables
Copy `environment.example` to `.env.local` and configure:
- Database connection
- AI provider API keys
- Authentication secrets
- Optional: Third-party integrations

### Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Apply migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

### Development Commands
```bash
npm run dev              # Start development server
npm run build           # Build for production
npm run type-check      # TypeScript validation
npm run lint            # Code linting
npm run test            # Run tests
```

## 🔄 Release Process

### Versioning
- We follow **Semantic Versioning** (semver)
- Major.Minor.Patch (e.g., 1.2.3)
- Automated via GitHub Actions

### Release Steps
1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release PR
4. Merge to main
5. Tag release
6. Automated deployment

Thank you for contributing to Tonmate! 🚀
