export default ({ config }) => {
  const APP_ENV = process.env.APP_ENV || 'production';
  
  return {
    ...config,
    extra: {
      ...config.extra,
      APP_ENV: APP_ENV,
    },
  };
};

