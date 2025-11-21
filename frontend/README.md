# TAIST - Expo Router Integration

This project has been migrated from a React Native CLI project to Expo Router. The integration brings several key benefits:

1. **File-based Routing**: Simplified navigation with automatic route generation
2. **Enhanced Type Safety**: Better TypeScript support for navigation and params
3. **Dev Tools**: Access to Expo's development tools and services
4. **Simplified Deployment**: Easier builds and updates using EAS Build and Update

## Project Structure

- `/app` - Contains all screens organized by user type:
  - `/(auth)` - Login, signup, forgot password screens
  - `/(customer)` - Customer-facing screens
  - `/(chef)` - Chef-facing screens
  - `/(common)` - Shared screens (notifications, map, etc.)
  
- `/src` - Contains shared code:
  - `/components` - Reusable UI components
  - `/services` - API services and business logic
  - `/utils` - Helper functions
  - `/types` - TypeScript interfaces and types
  - `/hooks` - Custom React hooks
  - `/store` - Redux store setup
  - `/reducers` - Redux reducers and slices

## Migration Notes

The original files from the CLI project are kept in `/app/src-cli` for reference. As features are migrated, 
developers can refer to these files for implementation details.

See `/src/README.md` for detailed information on the migration process and how to add new screens.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```
   
   For specific platforms:
   ```bash
   # For Android
   npx expo run:android
   
   # For iOS
   npx expo run:ios
   
   # Clean iOS build
   npx expo prebuild --clean
   npx expo run:ios --no-build-cache
   npx expo prebuild --platform ios --clean

   ```

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

### com.anonymous.taistexpo in app.json

## Remaining Packages
    "patch-package": "^8.0.0", not using anywhere
    "@stripe/stripe-react-native": "^0.38.0",   
 "prop-types": "^15.8.1", not using anywhere

 errror:       "react-native-fast-image": "^8.6.3",

  This package causing issue react-native-date-picker    
 Not using in the app  "react-native-side-drawer": "^2.1.0",


 chat left in common

 npm i @fortawesome/free-regular-svg-icons its missing