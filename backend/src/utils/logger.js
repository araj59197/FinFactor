const config = require('../config');
const logger = {
  info: (...args) => {
    if (config.nodeEnv !== 'test') {
      console.log(`[INFO] ${new Date().toISOString()}:`, ...args);
    }
  },

  error: (...args) => {
    if (config.nodeEnv !== 'test') {
      console.error(`[ERROR] ${new Date().toISOString()}:`, ...args);
    }
  },

  warn: (...args) => {
    if (config.nodeEnv !== 'test') {
      console.warn(`[WARN] ${new Date().toISOString()}:`, ...args);
    }
  },

  debug: (...args) => {
    if (config.nodeEnv === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()}:`, ...args);
    }
  },
};

module.exports = { logger };
