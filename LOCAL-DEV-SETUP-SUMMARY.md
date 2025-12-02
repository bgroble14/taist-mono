# 🎯 Local Development Setup - Visual Summary

## What We Just Set Up

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR DEVELOPMENT SETUP                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────┐       ┌──────────────────────────┐
│   FRONTEND (React)      │──────►│   BACKEND (Laravel)      │
│   Port: Expo Dev        │       │   Port: 8000             │
│   Location: frontend/   │       │   Location: backend/     │
└─────────────────────────┘       └──────────────────────────┘
           │                                    │
           │                                    │
           ▼                                    ▼
    ┌─────────────┐                    ┌──────────────┐
    │ Expo Go App │                    │ MySQL DB     │
    │ (Phone/Sim) │                    │ taist_local  │
    └─────────────┘                    └──────────────┘
```

---

## 📁 Files We Created/Modified

### New Files (Created)
```
✅ LOCAL-DEVELOPMENT-GUIDE.md        - Complete setup guide (detailed)
✅ LOCAL-DEV-QUICKSTART.md           - Quick reference (cheat sheet)
✅ start-local-dev.sh                - Start both servers at once
✅ backend/scripts/setup-local.sh    - Automated backend setup
```

### Modified Files
```
✅ frontend/app/services/api.ts      - Added local environment support
✅ frontend/package.json             - Added environment-specific scripts
✅ README.md                         - Added local dev links
```

---

## 🚦 How to Start (Step by Step)

### First Time Setup

```bash
# 1️⃣ Create Database
mysql -u root -p
CREATE DATABASE taist_local;
EXIT;

# 2️⃣ Setup Backend (automated)
cd backend
./scripts/setup-local.sh
# Follow prompts for database credentials

# 3️⃣ Setup Frontend
cd ../frontend
npm install

# 4️⃣ Done! Now start development
cd ..
./start-local-dev.sh
```

### Daily Development

```bash
# Single command starts everything:
./start-local-dev.sh

# Or manually in separate terminals:

# Terminal 1:
cd backend && php artisan serve

# Terminal 2:
cd frontend && npm run dev:local
```

---

## 🔄 Environment Configuration

### How It Works

```javascript
// frontend/app/services/api.ts

APP_ENV = 'local' ───────► http://localhost:8000/mapi/
APP_ENV = 'staging' ─────► https://taist.cloudupscale.com/mapi/
APP_ENV = 'production' ──► https://taist.codeupscale.com/mapi/
```

### How to Switch

```bash
# Local (your machine)
npm run dev:local

# Staging (test server)
npm run dev:staging

# Production (live - be careful!)
npm run dev:prod
```

---

## ✅ Quick Health Check

Run these commands to verify everything works:

```bash
# ✓ Check backend is running
curl http://localhost:8000/api/get-version
# Expected: {"success":1,"data":{"version":"..."}}

# ✓ Check database connection
cd backend
php artisan db:show
# Expected: Database info displayed

# ✓ Check frontend environment
cd frontend
npm run dev:local
# Expected: "🌍 Environment: local" in console
```

---

## 🗂️ Configuration Files

### Backend `.env` (after setup)
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=taist_local
DB_USERNAME=root
DB_PASSWORD=your_password

APP_URL=http://localhost:8000
APP_ENV=local
APP_DEBUG=true
```

### Frontend Environment
```bash
# Set via npm scripts (no .env needed):
APP_ENV=local npm start
```

---

## 🛠️ Common Commands

### Backend Commands
```bash
# Start server
php artisan serve

# Database
php artisan migrate              # Run migrations
php artisan migrate:fresh        # Reset DB
php artisan db:seed              # Add test data

# Cache
php artisan cache:clear
php artisan config:clear

# Logs
tail -f storage/logs/laravel.log
```

### Frontend Commands
```bash
# Start in different environments
npm run dev:local      # Local backend
npm run dev:staging    # Staging backend
npm run dev:prod       # Production backend

# Platform-specific
npm run ios:local      # iOS with local backend
npm run android:local  # Android with local backend

# Cache
npm start -- --clear   # Clear Metro cache
```

### Database Commands
```bash
# Access database
mysql -u root -p taist_local

# View tables
SHOW TABLES;

# Check users
SELECT * FROM tbl_users ORDER BY id DESC LIMIT 5;
```

---

## 📍 Important URLs

| What | URL | When Active |
|------|-----|-------------|
| **Backend API** | http://localhost:8000 | When `php artisan serve` running |
| **Test Endpoint** | http://localhost:8000/api/get-version | Always (if backend up) |
| **Admin Panel** | http://localhost:8000/admin | If compiled |
| **Frontend** | Expo App (QR code) | When `npm run dev:local` running |

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| **Port 8000 in use** | `lsof -i :8000` then `kill -9 <PID>` |
| **Database connection failed** | Check MySQL running: `mysql -u root -p` |
| **Frontend "Network request failed"** | Backend not running, start with `php artisan serve` |
| **Physical device can't connect** | Use computer IP instead of localhost (see guide) |
| **"Class not found" errors** | `composer dump-autoload` |

---

## 📊 What You Can Test Now

With local development setup, you can now test:

### ✅ Customer Signup (TMA-002)
1. Start app: `npm run dev:local`
2. Go through new multi-step signup
3. Verify user created in local database
4. Test address collection at checkout

### ✅ All New Features
- Multi-step customer registration
- Location-based ZIP code entry
- Address collection modal
- Permission requests
- Backend data saving

### ✅ Without Affecting Production
- Make changes freely
- Test breaking changes
- Experiment with database
- No risk to live users

---

## 🎓 Learning Resources

| Topic | File |
|-------|------|
| **Quick Start** | `LOCAL-DEV-QUICKSTART.md` |
| **Complete Guide** | `LOCAL-DEVELOPMENT-GUIDE.md` |
| **Backend Details** | `backend/README.md` |
| **Frontend Details** | `frontend/README.md` |
| **TMA-002 Implementation** | `TMA-002-IMPLEMENTATION-SUMMARY.md` |

---

## 🔐 Security Notes

- ✅ `.env` files are gitignored (safe)
- ✅ Local database is isolated (safe)
- ✅ Test API keys only (safe)
- ⚠️ Never commit real API keys
- ⚠️ Never use production credentials locally

---

## 🎉 You're All Set!

Your local development environment is configured and ready to use.

**Next Steps:**
1. Run `./start-local-dev.sh` to start everything
2. Open app on your device
3. Test the new customer signup flow
4. Check database to see your test data
5. Start building new features!

**Happy Coding! 🚀**

---

*Last Updated: December 2, 2025*  
*Setup Time: ~15 minutes*  
*Tested On: macOS Sonoma, PHP 7.4, MySQL 8.0, Node 18*

