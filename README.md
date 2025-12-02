# Taist Monorepo

This monorepo contains both the backend and frontend applications for Taist - a food marketplace connecting local chefs with customers.

## 🚀 Quick Start - Local Development

**New to local development? Start here:**

```bash
# One command to start everything:
./start-local-dev.sh
```

Or see:
- **[Quick Start Guide](./LOCAL-DEV-QUICKSTART.md)** - Fast setup (5 min read)
- **[Complete Setup Guide](./LOCAL-DEVELOPMENT-GUIDE.md)** - Detailed instructions with troubleshooting

## Structure

```
taist-mono/
├── backend/                    # Laravel PHP backend
│   ├── scripts/setup-local.sh  # Backend setup script
│   └── README.md
├── frontend/                   # React Native Expo frontend
│   └── README.md
├── start-local-dev.sh          # Start both backend & frontend
├── LOCAL-DEV-QUICKSTART.md     # Quick reference
└── LOCAL-DEVELOPMENT-GUIDE.md  # Complete setup guide
```

## Prerequisites

- **Backend**: PHP >= 7.2.5, Composer, MySQL/MariaDB
- **Frontend**: Node.js >= 18, npm or yarn
- **Development**: Git, Text Editor (VS Code recommended)

## Environment Management

The frontend supports three environments:

| Environment | Backend URL | Usage |
|------------|-------------|-------|
| **Local** | http://localhost:8000 | Development on your machine |
| **Staging** | https://taist.cloudupscale.com | Testing before production |
| **Production** | https://taist.codeupscale.com | Live application |

Switch environments with npm scripts:
```bash
npm run dev:local     # Local development
npm run dev:staging   # Staging testing
npm run dev:prod      # Production (careful!)
```

## Getting Started

### Install Dependencies

Install all dependencies for both projects:

```bash
npm run install:all
```

Or install them individually:

```bash
# Frontend
npm run frontend:install

# Backend
npm run backend:install
```

### Running the Projects

#### Backend (Laravel)

```bash
# Start the Laravel development server
npm run backend:serve
```

The backend will be available at `http://localhost:8000`

#### Frontend (React Native Expo)

```bash
# Start the Expo development server
npm run frontend

# Run on Android
npm run frontend:android

# Run on iOS
npm run frontend:ios
```

## Project Details

### Backend

- **Framework**: Laravel
- **Location**: `/backend`
- **Documentation**: See `/backend/README.md`

### Frontend

- **Framework**: React Native with Expo
- **Branch**: Based on `feature/expo-finalization`
- **Location**: `/frontend`
- **Documentation**: See `/frontend/README.md`

## Development

Each project can be developed independently in its respective directory. Refer to the individual README files in `/backend` and `/frontend` for more detailed information.

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

ISC

