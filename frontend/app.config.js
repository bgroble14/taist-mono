export default ({ config }) => {
  const APP_ENV = process.env.APP_ENV || 'production';
  const isDevelopment = APP_ENV === 'development';

  // Filter out expo-dev-client from plugins for non-development builds
  const plugins = (config.plugins || []).filter(plugin => {
    const pluginName = Array.isArray(plugin) ? plugin[0] : plugin;
    // Only include expo-dev-client in development builds
    if (pluginName === 'expo-dev-client') {
      return isDevelopment;
    }
    return true;
  });

  return {
    ...config,
    plugins,
    extra: {
      ...config.extra,
      APP_ENV: APP_ENV,
    },
  };
};

