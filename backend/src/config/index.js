require('dotenv').config();

const config = {
  port: process.env.PORT || 3001,
  apiToken: process.env.AQI_API_TOKEN,
  apiBaseUrl: process.env.AQI_API_BASE_URL || 'https://api.waqi.info',
  cache: {
    ttlMinutes: parseInt(process.env.CACHE_TTL_MINUTES) || 30,
    maxSize: parseInt(process.env.CACHE_MAX_SIZE) || 100,
  },
  nodeEnv: process.env.NODE_ENV || 'development',
};

// Validate required configuration
console.log('Loaded Configuration:', {
  port: config.port,
  apiBaseUrl: config.apiBaseUrl,
  hasToken: !!config.apiToken
});

if (!config.apiToken) {
  console.warn('WARNING: AQI_API_TOKEN not set in environment variables. API calls will fail.');
}

module.exports = config;
