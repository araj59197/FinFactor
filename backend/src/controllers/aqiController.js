const { getAQIService } = require('../services/aqiService');
const { logger } = require('../utils/logger');
const { getAQILevel, getHealthImplication } = require('../utils/aqiHelper');

const aqiService = getAQIService();

async function searchCity(req, res, next) {
  try {
    const { city } = req.query;

    if (!city || city.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'City name is required',
        message: 'Please provide a valid city name',
      });
    }

    logger.info(`Searching AQI for city: ${city}`);

    const data = await aqiService.searchByCity(city);

    // Enrich response with additional info
    const enrichedData = {
      ...data,
      aqiLevel: getAQILevel(data.aqi),
      healthImplication: getHealthImplication(data.aqi),
    };

    res.json({
      success: true,
      data: enrichedData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Handle API errors directly in controller
    logger.info(`Search failed for city: ${req.query.city} - ${error.message}`);

    let statusCode = 500;
    let errorType = 'Internal Server Error';

    if (error.message.includes('not found') || error.message.includes('No monitoring station')) {
      statusCode = 404;
      errorType = 'Location Not Found';
    } else if (error.message.includes('rate limit')) {
      statusCode = 429;
      errorType = 'Rate Limit Exceeded';
    } else if (error.message.includes('Invalid API token')) {
      statusCode = 401;
      errorType = 'Authentication Error';
    } else if (error.message.includes('Unable to reach') || error.message.includes('timeout')) {
      statusCode = 503;
      errorType = 'Service Unavailable';
    }

    res.status(statusCode).json({
      success: false,
      error: errorType,
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Search AQI by coordinates
 */
async function searchByCoordinates(req, res, next) {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required',
        message: 'Please provide valid coordinates',
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates',
        message: 'Latitude and longitude must be valid numbers',
      });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        error: 'Coordinates out of range',
        message: 'Latitude must be between -90 and 90, longitude between -180 and 180',
      });
    }

    logger.info(`Searching AQI for coordinates: ${latitude}, ${longitude}`);

    const data = await aqiService.searchByCoordinates(latitude, longitude);

    // Enrich response with additional info
    const enrichedData = {
      ...data,
      aqiLevel: getAQILevel(data.aqi),
      healthImplication: getHealthImplication(data.aqi),
    };

    res.json({
      success: true,
      data: enrichedData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Handle API errors directly in controller
    logger.info(`Search failed for coordinates: ${req.query.lat},${req.query.lng} - ${error.message}`);

    let statusCode = 500;
    let errorType = 'Internal Server Error';

    if (error.message.includes('not found') || error.message.includes('No monitoring station')) {
      statusCode = 404;
      errorType = 'Location Not Found';
    } else if (error.message.includes('rate limit')) {
      statusCode = 429;
      errorType = 'Rate Limit Exceeded';
    } else if (error.message.includes('Invalid API token')) {
      statusCode = 401;
      errorType = 'Authentication Error';
    } else if (error.message.includes('Unable to reach') || error.message.includes('timeout')) {
      statusCode = 503;
      errorType = 'Service Unavailable';
    }

    res.status(statusCode).json({
      success: false,
      error: errorType,
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Get cache statistics
 */
async function getForecast(req, res, next) {
  try {
    const { city } = req.params;

    if (!city || city.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'City name is required',
      });
    }

    logger.info(`Fetching forecast for: ${city}`);
    const forecastData = await aqiService.getForecast(city);

    res.json({
      success: true,
      data: forecastData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Forecast error for ${req.params.city}:`, error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch forecast data',
    });
  }
}

async function getHistoricalData(req, res, next) {
  try {
    const { city } = req.params;

    if (!city || city.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'City name is required',
      });
    }

    logger.info(`Fetching historical data for: ${city}`);
    const historicalData = await aqiService.getHistoricalData(city);

    res.json({
      success: true,
      data: historicalData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Historical data error for ${req.params.city}:`, error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch historical data',
    });
  }
}

function getCacheStats(req, res) {
  const stats = aqiService.getCacheStats();
  res.json({
    success: true,
    cache: stats,
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  searchCity,
  searchByCoordinates,
  getForecast,
  getHistoricalData,
  getCacheStats,
};
