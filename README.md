# Taist Monorepo

A food marketplace connecting local chefs with customers.

## 🚀 Quick Start

### Local Development (Recommended)

```bash
# Terminal 1: Backend
cd backend
php artisan serve --port=8000

# Terminal 2: Frontend
cd frontend
npm run dev:local
```

**Test Accounts**: `john.customer@test.com` / `password` or `maria.chef@test.com` / `password`

**First time?** See [Local Development Guide](docs/setup/local-development.md) for full setup.

**Quick reference?** See [Quick Start Guide](docs/setup/quick-start.md) for commands.

---

## 📁 Structure

```
taist-mono/
├── backend/          # Laravel 7 API (PHP 7.4)
├── frontend/         # React Native Expo app
└── docs/             # Documentation
```

---

## 🌍 Environments

The frontend supports three environments:

```bash
# Local (your machine)
npm run dev:local      # http://localhost:8000

# Staging (test server)
npm run dev:staging    # https://taist.cloudupscale.com

# Production (live)
npm run dev:prod       # https://taist.codeupscale.com
```

---

## 📦 Prerequisites

### Backend
- PHP 7.4
- Composer
- MySQL 8.0

### Frontend
- Node.js 18+
- npm or yarn
- Expo CLI

---

## 🗄️ Local Database

Fully configured with test data:
- ✅ 3 verified chefs with menus
- ✅ 2 customer accounts
- ✅ 9 menu items ($12-$25)
- ✅ 58 activated Chicago ZIP codes

**Access**: `mysql -u root taist_local`

---

## 📚 Documentation

### Getting Started
- [Quick Start Guide](docs/setup/quick-start.md) - Get running in 5 minutes
- [Local Development](docs/setup/local-development.md) - Complete setup guide
- [Database Setup](docs/setup/database-copy-guide.md) - Database configuration & copying

### Features
- [AI Features](docs/features/ai-features.md) - AI menu descriptions & review generation
- [SMS Notifications](docs/features/twilio-implementation.md) - Twilio SMS setup
- [Discount Codes](docs/archive/sprint-1/tasks/TMA-007-IMPLEMENTATION-SUMMARY.md) - Coupon system

### Infrastructure & Deployment
- [AWS Setup](docs/infrastructure/aws-setup.md) - AWS configuration
- [Domain Strategy](docs/infrastructure/domain-migration.md) - Domain migration plan
- [Deployment Guide](docs/deployment/deployment-summary.md) - How to deploy
- [Railway Migration](docs/deployment/RAILWAY-MIGRATION-GUIDE.md) - Railway hosting guide

### Reference
- [UI Documentation](docs/ui/ui-documentation.md) - Complete UI reference
- [Sprint 1 Archive](docs/archive/sprint-1/) - Completed sprint history
- [Backend README](backend/README.md) - Backend API details
- [Frontend README](frontend/README.md) - Frontend app details
- [Current Sprint Tasks](sprint-tasks.md) - Active sprint tracking

---

## 🔧 Common Commands

### Backend
```bash
cd backend
php artisan serve              # Start server
php artisan migrate:fresh      # Reset database
php artisan db:seed            # Add test data
tail -f storage/logs/laravel.log  # View logs
```

### Frontend
```bash
cd frontend
npm run dev:local     # Start with local backend
npm run ios:local     # iOS simulator
npm run android:local # Android emulator
npm start -- --clear  # Clear Metro cache
```

---

## 🐛 Troubleshooting

**Port 8000 in use?**
```bash
lsof -i :8000 && kill -9 <PID>
```

**MySQL not running?**
```bash
brew services start mysql
```

**Frontend can't connect?**
- Ensure backend is running
- Check you used `dev:local` script
- Verify environment in Metro bundler

See [troubleshooting guide](docs/setup/local-development.md#-troubleshooting) for more.

---

## 📝 Current Sprint

See [sprint-tasks.md](./sprint-tasks.md) for active tasks.

**Recent completions**:
- ✅ AI menu descriptions & grammar enhancement
- ✅ AI review generation (3 per authentic review)
- ✅ TMA-002: Multi-step customer signup
- ✅ Address collection at checkout
- ✅ Local development environment with test data

---

## 🤝 Contributing

1. Create feature branch from `main`
2. Make changes and test locally
3. Test on staging if needed
4. Submit pull request

**Always test locally first** before pushing to staging!

---

## 📄 License

ISC

---

**Happy coding! 🚀**
