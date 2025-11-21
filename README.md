# Taist Monorepo

This monorepo contains both the backend and frontend applications for Taist.

## Structure

```
taist-mono/
├── backend/          # Laravel PHP backend
├── frontend/         # React Native Expo frontend
└── README.md         # This file
```

## Prerequisites

- **Backend**: PHP >= 7.3, Composer, MySQL/MariaDB
- **Frontend**: Node.js >= 18, npm or yarn

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

