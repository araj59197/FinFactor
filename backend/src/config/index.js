require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';

const config = {
  port: process.env.PORT || 3001,
  apiToken: process.env.AQI_API_TOKEN,
  apiBaseUrl: process.env.AQI_API_BASE_URL || 'https://api.waqi.info',
  cache: {
    ttlMinutes: parseInt(process.env.CACHE_TTL_MINUTES, 10) || 30,
    maxSize: parseInt(process.env.CACHE_MAX_SIZE, 10) || 100,
  },
  nodeEnv,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
};

// Validate required configuration (log only in development)
if (nodeEnv === 'development') {
  // eslint-disable-next-line no-console
  console.log('Loaded Configuration:', {
    port: config.port,
    apiBaseUrl: config.apiBaseUrl,
    hasToken: !!config.apiToken,
  });
}

if (!config.apiToken) {
  // eslint-disable-next-line no-console
  console.warn('WARNING: AQI_API_TOKEN not set in environment variables. API calls will fail.');
}

module.exports = config;
