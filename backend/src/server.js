const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const config = require('./config');
const aqiRoutes = require('./routes/aqiRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { logger } = require('./utils/logger');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Compression middleware
app.use(compression());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  const { getAQIService } = require('./services/aqiService');
  const aqiService = getAQIService();
  const cacheStats = aqiService.getCacheStats();

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    cache: cacheStats,
    environment: config.nodeEnv,
  });
});

// API routes
app.use('/api/aqi', aqiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Air Quality Index API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      searchByCity: '/api/aqi/search?city={cityName}',
      searchByCoordinates: '/api/aqi/coordinates?lat={latitude}&lng={longitude}',
      cacheStats: '/api/aqi/cache-stats',
    },
    documentation: 'See README.md for complete API documentation',
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`=================================================`);
  logger.info(`🚀 AQI Backend Server started successfully`);
  logger.info(`📡 Server running on port ${PORT}`);
  logger.info(`🌍 Environment: ${config.nodeEnv}`);
  logger.info(`💾 Cache: Max ${config.cache.maxSize} entries, TTL ${config.cache.ttlMinutes} minutes`);
  logger.info(`=================================================`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

module.exports = app;
