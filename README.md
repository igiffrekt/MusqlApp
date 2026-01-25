# Musql - Trainer Management System

A comprehensive Progressive Web App (PWA) for martial arts and fitness trainers to manage students, track attendance, handle payments, and analyze business performance.

## 🚀 Features

- **Student Management**: Register and manage student profiles with progress tracking
- **Session Scheduling**: Create and manage training sessions with calendar integration
- **Attendance Tracking**: Real-time attendance marking with mobile optimization
- **Payment Processing**: Stripe integration for secure payment collection
- **Analytics Dashboard**: Comprehensive reporting and business insights
- **PWA Features**: Offline functionality, push notifications, installable app
- **Multi-tenancy**: Organization-based data isolation with role-based access
- **License Tiers**: Flexible subscription plans (Starter, Professional, Enterprise)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+, React 19, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui, Recharts
- **Database**: SQLite (dev) / PostgreSQL (prod) with Prisma ORM
- **Authentication**: NextAuth.js with OAuth providers
- **Payments**: Stripe API integration
- **Notifications**: Web Push API, Resend (email), Twilio (SMS)
- **PWA**: Service Workers, IndexedDB for offline storage
- **Monitoring**: Sentry for error tracking, Vercel Analytics
- **Testing**: Jest, React Testing Library, Playwright
- **Deployment**: Vercel (frontend), Railway/Render (database)

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Git

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.template .env.local
   # Edit .env.local with your configuration
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🔧 Environment Configuration

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
FACEBOOK_CLIENT_ID="..."
FACEBOOK_CLIENT_SECRET="..."

# Stripe (for payments)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email & SMS (optional)
RESEND_API_KEY="re_..."
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1234567890"

# Monitoring (optional)
SENTRY_DSN="https://..."
NEXT_PUBLIC_SENTRY_DSN="https://..."
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npx playwright test
```

### Test Coverage
```bash
npm test -- --coverage
```

## 🚀 Deployment

### Vercel (Frontend)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Railway/Render (Database)
1. Create a PostgreSQL database instance
2. Update `DATABASE_URL` in production environment
3. Run migrations: `npx prisma migrate deploy`

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database URL
- [ ] Set up Stripe webhooks
- [ ] Configure OAuth redirect URLs
- [ ] Set up monitoring and alerting
- [ ] Enable PWA service worker
- [ ] Configure backup strategy

## 📊 Monitoring & Analytics

### Error Tracking (Sentry)
- Automatic error reporting
- Performance monitoring
- Release tracking
- User feedback collection

### Analytics (Vercel)
- Page views and user interactions
- Feature usage tracking
- Performance metrics
- Conversion tracking

### Health Checks
- Application health: `GET /api/health`
- Database connectivity monitoring
- Service status tracking

## 🔐 Security

- **Authentication**: NextAuth.js with secure session management
- **Authorization**: Role-based access control (RBAC)
- **Data Isolation**: Multi-tenant architecture
- **API Security**: Input validation, rate limiting
- **Payment Security**: PCI-compliant payment processing

## 📱 PWA Features

- **Offline Support**: Core functionality works offline
- **Push Notifications**: Real-time updates and reminders
- **App Installation**: Installable on mobile devices
- **Background Sync**: Automatic data synchronization
- **Cache Management**: Intelligent caching strategies

## 🏗️ Architecture

### Database Schema
- **Organizations**: Multi-tenant data isolation
- **Users**: Staff and students with role management
- **Students**: Student profiles and progress tracking
- **Sessions**: Training session scheduling
- **Attendance**: Session attendance records
- **Payments**: Payment tracking and plans
- **Notifications**: Communication system

### API Routes
- `/api/auth/*`: Authentication endpoints
- `/api/admin/*`: Administrative functions
- `/api/students/*`: Student management
- `/api/sessions/*`: Session scheduling
- `/api/attendance/*`: Attendance tracking
- `/api/payments/*`: Payment processing
- `/api/analytics/*`: Reporting and analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

### Development Guidelines
- Use TypeScript for type safety
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Ensure mobile responsiveness

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: Check the `/docs` folder
- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub discussions for questions
- **Email**: Contact support for urgent issues

## 🎯 Roadmap

- [ ] Advanced reporting with custom dashboards
- [ ] Mobile app (React Native)
- [ ] Integration with fitness wearables
- [ ] Multi-language support
- [ ] Advanced automation features
- [ ] API for third-party integrations

---

Built with ❤️ for martial arts instructors worldwide.