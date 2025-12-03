const { getAQIService } = require('../services/aqiService');
const { logger } = require('../utils/logger');
const { getAQILevel, getHealthImplication } = require('../utils/aqiHelper');
const { ApiError } = require('../utils/ApiError');

const aqiService = getAQIService();

async function searchCity(req, res, next) {
  try {
    const { city } = req.query;

    if (!city || city.trim().length === 0) {
      throw new ApiError(400, 'City name is required', 'Validation Error');
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
    logger.info(`Search failed for city: ${req.query.city} - ${error.message}`);
    next(error);
  }
}

/**
 * Search AQI by coordinates
 */
async function searchByCoordinates(req, res, next) {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      throw new ApiError(400, 'Latitude and longitude are required', 'Validation Error');
    }
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new ApiError(400, 'Latitude and longitude must be valid numbers', 'Validation Error');
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new ApiError(
        400,
        'Latitude must be between -90 and 90, longitude between -180 and 180',
        'Validation Error'
      );
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
    logger.info(
      `Search failed for coordinates: ${req.query.lat},${req.query.lng} - ${error.message}`
    );
    next(error);
  }
}

/**
 * Get cache statistics
 */
async function getForecast(req, res, next) {
  try {
    const { city } = req.params;

    if (!city || city.trim().length === 0) {
      throw new ApiError(400, 'City name is required', 'Validation Error');
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
    next(error);
  }
}

async function getHistoricalData(req, res, next) {
  try {
    const { city } = req.params;

    if (!city || city.trim().length === 0) {
      throw new ApiError(400, 'City name is required', 'Validation Error');
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
    next(error);
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
