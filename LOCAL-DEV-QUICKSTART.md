# Local Development Quick Start 🚀

**TL;DR** - Three ways to start local development:

## Option 1: Automated (Recommended)

```bash
./start-local-dev.sh
```

This single command:
- ✅ Sets up backend (if first time)
- ✅ Installs frontend dependencies (if needed)
- ✅ Starts both backend and frontend
- ✅ Configures frontend to use local backend

---

## Option 2: Manual (Separate Terminals)

### Terminal 1 - Backend
```bash
cd backend
./scripts/setup-local.sh  # Only run once for initial setup
php artisan serve         # Run every time
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev:local         # Uses local backend
```

---

## Option 3: First Time Setup

### Step 1: Database
```bash
mysql -u root -p

CREATE DATABASE taist_local;
EXIT;
```

### Step 2: Backend
```bash
cd backend
./scripts/setup-local.sh
# Follow prompts for database credentials
```

### Step 3: Frontend
```bash
cd frontend
npm install
npm run dev:local
```

---

## 📍 URLs & Endpoints

| Service | URL |
|---------|-----|
| **Backend API** | http://localhost:8000 |
| **Test Endpoint** | http://localhost:8000/api/get-version |
| **Frontend** | Opens in Expo (scan QR code) |

---

## 🔄 Environment Switching

```bash
# Local (your machine)
npm run dev:local
npm run ios:local
npm run android:local

# Staging (test server)
npm run dev:staging
npm run ios:staging
npm run android:staging

# Production (live)
npm run dev:prod
npm run ios:prod
npm run android:prod
```

---

## ✅ Quick Health Check

```bash
# Test backend is running
curl http://localhost:8000/api/get-version

# Expected response:
# {"success":1,"data":{"version":"..."}}
```

---

## 🐛 Troubleshooting

### "Connection refused" errors

**Backend not running?**
```bash
# Start backend
cd backend
php artisan serve
```

**Physical device can't connect?**

Your device needs to use your computer's IP, not "localhost".

1. Find your computer's IP:
   ```bash
   # macOS/Linux
   ifconfig | grep inet
   
   # Look for something like: 192.168.1.100
   ```

2. Update frontend API URL temporarily:
   ```typescript
   // frontend/app/services/api.ts
   // Change localhost to your IP:
   BASE_URL: 'http://192.168.1.100:8000/mapi/',
   ```

### Database connection errors

```bash
# Verify MySQL is running
mysql -u root -p

# Verify database exists
SHOW DATABASES;

# Re-check .env file
cat backend/.env | grep DB_
```

### "Port 8000 already in use"

```bash
# Find what's using port 8000
lsof -i :8000

# Kill it
kill -9 <PID>

# Or use different port
php artisan serve --port=8001
# Update frontend URL accordingly
```

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `backend/.env` | Backend configuration (DB, API keys) |
| `backend/storage/logs/laravel.log` | Backend error logs |
| `frontend/app/services/api.ts` | API URL configuration |
| `frontend/package.json` | npm scripts for environments |

---

## 🔑 Database Credentials (Default)

```env
Host: 127.0.0.1
Port: 3306
Database: taist_local
Username: root
Password: (your MySQL root password)
```

---

## 💡 Pro Tips

1. **Keep terminals organized**
   - Terminal 1: Backend server
   - Terminal 2: Frontend/Expo
   - Terminal 3: Logs (`tail -f backend/storage/logs/laravel.log`)

2. **Test new features locally first**
   - Always use `npm run dev:local` when developing
   - Only test on staging after local testing passes

3. **Database changes**
   ```bash
   cd backend
   php artisan migrate        # Run new migrations
   php artisan migrate:fresh  # Reset entire DB
   php artisan db:seed        # Add test data
   ```

4. **Clear caches when things break**
   ```bash
   # Backend
   php artisan cache:clear
   php artisan config:clear
   php artisan route:clear
   
   # Frontend
   npm start -- --clear
   ```

---

## 📚 Full Documentation

For complete setup instructions and troubleshooting:
- **Comprehensive Guide**: [LOCAL-DEVELOPMENT-GUIDE.md](./LOCAL-DEVELOPMENT-GUIDE.md)
- **Backend README**: [backend/README.md](./backend/README.md)
- **Frontend README**: [frontend/README.md](./frontend/README.md)

---

## 🆘 Still Stuck?

1. Check the detailed guide: `LOCAL-DEVELOPMENT-GUIDE.md`
2. Check backend logs: `tail -f backend/storage/logs/laravel.log`
3. Verify environment: Should see "🌍 Environment: local" in Expo

---

**Need to reset everything?**

```bash
# Backend
cd backend
php artisan migrate:fresh --seed

# Frontend
cd frontend
rm -rf node_modules
npm install
npm start -- --clear
```

---

Last Updated: December 2, 2025

