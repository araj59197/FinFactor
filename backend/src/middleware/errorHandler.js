const { logger } = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error('Error:', err.message);
  if (err.stack) {
    logger.error('Stack:', err.stack);
  }

  // Prefer explicit statusCode (e.g. from ApiError), otherwise infer
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (!err.statusCode && typeof err.message === 'string') {
    if (err.message.includes('not found') || err.message.includes('City not found')) {
      statusCode = 404;
    } else if (err.message.includes('Invalid') || err.message.includes('required')) {
      statusCode = 400;
    } else if (err.message.includes('rate limit')) {
      statusCode = 429;
    } else if (err.message.includes('Unauthorized') || err.message.includes('Invalid API token')) {
      statusCode = 401;
    } else if (err.message.includes('timeout') || err.message.includes('Unable to reach')) {
      statusCode = 503;
      message = 'Service temporarily unavailable';
    }
  }

  res.status(statusCode).json({
    success: false,
    error: err.name || 'Error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
