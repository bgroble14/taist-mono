# Local Development Setup Guide

Complete guide to run Taist backend and frontend on your local machine.

## 🎯 Quick Start (TL;DR)

```bash
# 1. Backend setup (run once)
cd backend
./scripts/setup-local-backend.sh

# 2. Start backend server
php artisan serve
# Backend running at: http://localhost:8000

# 3. Frontend setup (in new terminal)
cd ../frontend
npm run dev:local
# Follow Expo instructions to run on device/simulator
```

---

## 📋 Prerequisites

### Required Software

1. **PHP 7.2.5+** with extensions:
   ```bash
   # Check PHP version
   php -v
   
   # Required extensions: mbstring, openssl, PDO, Tokenizer, XML, ctype, JSON
   # On macOS (using Homebrew):
   brew install php@7.4
   
   # On Ubuntu/Debian:
   sudo apt install php php-mysql php-mbstring php-xml php-curl
   ```

2. **Composer** (PHP package manager):
   ```bash
   # Check if installed
   composer --version
   
   # Install if needed (macOS):
   brew install composer
   
   # Or download from: https://getcomposer.org/
   ```

3. **MySQL 5.7+** or **MariaDB**:
   ```bash
   # macOS (Homebrew):
   brew install mysql
   brew services start mysql
   
   # Ubuntu/Debian:
   sudo apt install mysql-server
   sudo systemctl start mysql
   
   # Check if running:
   mysql --version
   ```

4. **Node.js & npm** (for frontend):
   ```bash
   # Check versions
   node -v  # Should be 16+
   npm -v   # Should be 8+
   ```

---

## 🗄️ Database Setup

### Step 1: Create Local Database

```bash
# Connect to MySQL
mysql -u root -p
# Enter your MySQL root password (or press Enter if no password)

# Inside MySQL prompt:
CREATE DATABASE taist_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create a dedicated user (optional but recommended):
CREATE USER 'taist_dev'@'localhost' IDENTIFIED BY 'taist_local_pass';
GRANT ALL PRIVILEGES ON taist_local.* TO 'taist_dev'@'localhost';
FLUSH PRIVILEGES;

# Verify database was created:
SHOW DATABASES;

# Exit MySQL:
EXIT;
```

### Step 2: (Optional) Import Data from Staging/Production

If you want to test with real data, you can import a database dump:

```bash
# Get dump from staging (ask team for credentials)
# Then import:
mysql -u root -p taist_local < staging_dump.sql
```

For now, let's proceed with a fresh database and seed it with test data.

---

## 🔧 Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd /Users/williamgroble/taist-mono/backend
```

### Step 2: Install Dependencies

```bash
composer install

# This will download all Laravel and PHP dependencies
# May take 2-3 minutes
```

### Step 3: Create Environment File

```bash
# Copy the example environment file
cp .env.example .env

# Or if .env.example doesn't exist, create .env manually
touch .env
```

### Step 4: Edit .env File

Open `backend/.env` in your editor and configure:

```env
# Basic App Settings
APP_NAME=Taist
APP_ENV=local
APP_KEY=  # Will generate in next step
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database (use the database you created)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=taist_local
DB_USERNAME=root
DB_PASSWORD=  # Your MySQL password (leave blank if no password)

# Or if you created dedicated user:
# DB_USERNAME=taist_dev
# DB_PASSWORD=taist_local_pass

# Email (log to file instead of sending)
MAIL_MAILER=log

# Session & Cache
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync

# External Services (Optional - can add later)
# For now, you can skip these or use test credentials:

# Stripe (Test Mode Keys)
STRIPE_KEY=pk_test_YOUR_KEY
STRIPE_SECRET=sk_test_YOUR_SECRET

# Twilio (Optional - skip SMS for now)
TWILIO_SID=
TWILIO_TOKEN=
TWILIO_FROM=

# Google Maps (Optional - get free key)
GOOGLE_MAPS_API_KEY=

# Firebase (Optional - for push notifications)
FIREBASE_CREDENTIALS=firebase_credentials.json
```

**Note**: You can start without external service credentials. Add them later as needed.

### Step 5: Generate Application Key

```bash
php artisan key:generate

# This will add APP_KEY to your .env file
```

### Step 6: Run Database Migrations

```bash
# Create all tables in the database
php artisan migrate

# If you get errors, verify your database connection in .env
```

**Expected Output**:
```
Migration table created successfully.
Migrating: 2014_10_12_000000_create_users_table
Migrated:  2014_10_12_000000_create_users_table (0.50 seconds)
Migrating: 2014_10_12_100000_create_password_resets_table
Migrated:  2014_10_12_100000_create_password_resets_table (0.25 seconds)
...
```

### Step 7: Seed Database with Test Data (Optional)

```bash
# Add sample data for testing
php artisan db:seed

# This creates test users, chefs, menus, etc.
```

### Step 8: Install Laravel Passport (API Authentication)

```bash
php artisan passport:install

# This generates encryption keys for API tokens
# Save the Client ID and Secret shown (not critical for dev)
```

### Step 9: Create Storage Symlink

```bash
php artisan storage:link

# This links storage/app/public to public/storage
# Needed for uploaded images
```

### Step 10: Set Permissions (if needed)

```bash
# macOS/Linux - make sure Laravel can write to storage and cache
chmod -R 775 storage bootstrap/cache
```

---

## 🚀 Running the Backend Server

### Start the Development Server

```bash
# From backend directory
php artisan serve

# Or specify host and port:
php artisan serve --host=0.0.0.0 --port=8000
```

**Expected Output**:
```
Laravel development server started: http://127.0.0.1:8000
```

### Test the Backend

Open another terminal and test:

```bash
# Test basic endpoint
curl http://localhost:8000/api/get-version

# Expected response:
# {"success":1,"data":{"version":"1.0.0"}}
```

**Keep this terminal running** - your backend is now live!

---

## 📱 Frontend Setup

### Step 1: Navigate to Frontend Directory

Open a **new terminal** (keep backend running):

```bash
cd /Users/williamgroble/taist-mono/frontend
```

### Step 2: Install Dependencies (if not already done)

```bash
npm install
```

### Step 3: Create Environment Scripts

I've already updated the code to support local development. You just need to set the environment variable.

### Step 4: Create npm Scripts for Easy Environment Switching

Open `frontend/package.json` and add these scripts:

```json
"scripts": {
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web",
  
  "dev:local": "APP_ENV=local npm start",
  "android:local": "APP_ENV=local npm run android",
  "ios:local": "APP_ENV=local npm run ios",
  
  "dev:staging": "APP_ENV=staging npm start",
  "android:staging": "APP_ENV=staging npm run android",
  "ios:staging": "APP_ENV=staging npm run ios",
  
  "dev:prod": "APP_ENV=production npm start",
  "android:prod": "APP_ENV=production npm run android",
  "ios:prod": "APP_ENV=production npm run ios"
}
```

### Step 5: Start Frontend in Local Mode

```bash
# Start Expo with local backend
npm run dev:local

# Or for specific platform:
npm run ios:local     # iOS simulator
npm run android:local # Android emulator
```

**Expected Output**:
```
🌍 Environment: local
🔗 API URL: http://localhost:8000/mapi/

› Metro waiting on exp://192.168.1.100:19000
› Scan the QR code above with Expo Go (Android) or Camera app (iOS)
```

### Step 6: Run on Device or Simulator

**Option A: Physical Device**
1. Install Expo Go app from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in terminal
3. App will load with local backend connection

**Option B: iOS Simulator (macOS only)**
```bash
npm run ios:local
```

**Option C: Android Emulator**
```bash
npm run android:local
```

---

## 🔄 Environment Switching

You now have three environments configured:

### Local Development (Your Machine)
```bash
npm run dev:local
# Backend: http://localhost:8000
```

### Staging (Testing Server)
```bash
npm run dev:staging
# Backend: https://taist.cloudupscale.com
```

### Production (Live)
```bash
npm run dev:prod
# Backend: https://taist.codeupscale.com
```

**Important**: Always use local mode when testing new features!

---

## ✅ Testing Your Setup

### Test Backend API

1. **Check version endpoint**:
   ```bash
   curl http://localhost:8000/api/get-version
   ```

2. **Check database connection**:
   ```bash
   php artisan tinker
   >>> DB::connection()->getPdo();
   >>> exit
   ```

3. **View logs**:
   ```bash
   tail -f storage/logs/laravel.log
   ```

### Test Frontend Connection

1. Start app in local mode
2. Try to sign up with new customer account
3. Check backend terminal for API requests
4. Check database for new user:
   ```bash
   mysql -u root -p taist_local
   SELECT * FROM tbl_users ORDER BY id DESC LIMIT 5;
   ```

---

## 🐛 Troubleshooting

### Backend Issues

#### "Connection refused" when starting server
```bash
# Check if port 8000 is in use
lsof -i :8000

# Kill process if needed
kill -9 <PID>

# Or use different port
php artisan serve --port=8001
# Update frontend API URL to :8001
```

#### "SQLSTATE[HY000] [2002] Connection refused"
- MySQL not running: `brew services start mysql` (macOS) or `sudo systemctl start mysql` (Linux)
- Wrong credentials in .env
- Wrong database name

#### "Class 'Illuminate\Foundation\Application' not found"
```bash
composer install
composer dump-autoload
```

#### "The only supported ciphers are AES-128-CBC and AES-256-CBC"
```bash
php artisan key:generate
```

### Frontend Issues

#### "Network request failed" in app
1. Check backend is running: `curl http://localhost:8000/api/get-version`
2. Check environment: Should show "🌍 Environment: local" in Metro bundler
3. If on physical device, use your computer's IP instead of localhost:
   ```typescript
   // In frontend/app/services/api.ts, update local URL:
   BASE_URL: 'http://192.168.1.100:8000/mapi/',  // Use your machine's IP
   ```
   Find your IP: `ifconfig | grep inet` (macOS/Linux) or `ipconfig` (Windows)

#### Environment not switching
```bash
# Clear Metro cache
npm start -- --clear

# Or
rm -rf node_modules/.cache
npm run dev:local
```

#### "Unable to resolve module"
```bash
npm install
npx expo start --clear
```

---

## 📊 Database Management

### View Tables

```bash
mysql -u root -p taist_local

SHOW TABLES;
```

### Common Tables
- `tbl_users` - All users (customers and chefs)
- `tbl_menus` - Menu items
- `tbl_orders` - Orders
- `tbl_chef_profiles` - Chef profile data
- `tbl_reviews` - Reviews
- `tbl_zipcodes` - Supported ZIP codes

### Reset Database

```bash
# Drop all tables and recreate
php artisan migrate:fresh

# With seeding
php artisan migrate:fresh --seed
```

### View Logs

```bash
# Laravel logs
tail -f backend/storage/logs/laravel.log

# MySQL query logs (if enabled)
tail -f /usr/local/var/mysql/$(hostname).log
```

---

## 🎨 Admin Panel (Optional)

The backend includes a web admin panel:

1. **Compile assets**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Access admin**:
   - URL: http://localhost:8000/admin
   - Create admin user in database or via tinker

---

## 🔐 External Services Setup (Optional)

You can run the app without these, but here's how to add them:

### Stripe (Payment Processing)

1. Go to https://dashboard.stripe.com/register
2. Get test keys from https://dashboard.stripe.com/test/apikeys
3. Add to `.env`:
   ```env
   STRIPE_KEY=pk_test_...
   STRIPE_SECRET=sk_test_...
   ```

### Google Maps API (Geocoding)

1. Go to https://console.cloud.google.com/
2. Enable "Geocoding API" and "Maps SDK"
3. Create API key
4. Add to `.env`:
   ```env
   GOOGLE_MAPS_API_KEY=AIza...
   ```

### Twilio (SMS Verification)

1. Go to https://www.twilio.com/try-twilio
2. Get free trial account
3. Add to `.env`:
   ```env
   TWILIO_SID=AC...
   TWILIO_TOKEN=...
   TWILIO_FROM=+15551234567
   ```

---

## 📝 Daily Workflow

### Starting Work

```bash
# Terminal 1: Backend
cd backend
php artisan serve

# Terminal 2: Frontend
cd frontend
npm run dev:local

# Terminal 3: Logs (optional)
cd backend
tail -f storage/logs/laravel.log
```

### Stopping Work

```bash
# Press Ctrl+C in each terminal to stop servers
```

### Updating Code

```bash
# Backend: If database schema changed
php artisan migrate

# Frontend: If dependencies changed
npm install
```

---

## 🎉 Success Checklist

- ✅ Backend running at http://localhost:8000
- ✅ Database `taist_local` created and migrated
- ✅ Frontend starts with "Environment: local"
- ✅ Can sign up new customer account
- ✅ New user appears in database
- ✅ No "Network request failed" errors

---

## 📚 Additional Resources

- **Laravel Docs**: https://laravel.com/docs/7.x
- **Expo Docs**: https://docs.expo.dev/
- **MySQL Docs**: https://dev.mysql.com/doc/

---

## 🆘 Need Help?

1. Check logs: `backend/storage/logs/laravel.log`
2. Test API manually: `curl http://localhost:8000/api/get-version`
3. Verify database: `mysql -u root -p taist_local`
4. Check this guide's troubleshooting section

**Common Issue**: If frontend can't connect from physical device, update the local URL in `frontend/app/services/api.ts` to use your computer's IP address instead of `localhost`.

---

**Last Updated**: December 2, 2025  
**Tested On**: macOS Sonoma, PHP 7.4, MySQL 8.0, Node 18

