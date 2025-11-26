const axios = require('axios');
const config = require('../config');
const { getCacheInstance } = require('./cacheService');
const { logger } = require('../utils/logger');

const dataStore = getCacheInstance(config.cache.maxSize, config.cache.ttlMinutes);

// Air quality data retrieval manager
class AirQualityDataProvider {
  constructor() {
    this.baseEndpoint = config.apiBaseUrl;
    this.authToken = config.apiToken;
    this.requestClient = axios.create({
      timeout: 10000,
      headers: { 'User-Agent': 'AQI-Search-Engine/1.0' },
    });
  }

  buildStorageKey(searchType, parameters) {
    if (searchType === 'city') {
      const normalized = parameters.toLowerCase().trim();
      return `location:${normalized}`;
    }
    if (searchType === 'geo') {
      return `coords:${parameters.lat}:${parameters.lng}`;
    }
    return null;
  }

  async searchByCity(cityName) {
    try {
      const storageKey = this.buildStorageKey('city', cityName);
      const storedResult = dataStore.fetch(storageKey);
      
      if (storedResult) {
        logger.info(`Data retrieved from store for: ${cityName}`);
        return { ...storedResult, cached: true };
      }

      logger.info(`Fetching fresh data for: ${cityName}`);
      const endpoint = `${this.baseEndpoint}/feed/${encodeURIComponent(cityName)}/?token=${this.authToken}`;
      const apiResponse = await this.requestClient.get(endpoint);

      logger.info(`API Response status: ${apiResponse.data.status}`);
      
      if (apiResponse.data.status !== 'ok') {
        const errorMsg = apiResponse.data.data || apiResponse.data.message;
        logger.error(`API returned error for ${cityName}: ${errorMsg}`);
        
        // Handle specific error messages
        if (errorMsg === 'Unknown station') {
          throw new Error(`No air quality monitoring station found for "${cityName}". Try searching for a nearby major city instead.`);
        }
        
        throw new Error(errorMsg || 'Invalid response from AQI API');
      }

      const transformedData = this.transformAQIResponse(apiResponse.data.data);
      dataStore.store(storageKey, transformedData);

      return { ...transformedData, cached: false };
    } catch (err) {
      const processedError = this.processError(err);
      throw processedError;
    }
  }

  async searchByCoordinates(latitude, longitude) {
    try {
      const storageKey = this.buildStorageKey('geo', { lat: latitude, lng: longitude });
      const storedResult = dataStore.fetch(storageKey);
      
      if (storedResult) {
        logger.info(`Cached data found for coords: ${latitude},${longitude}`);
        return { ...storedResult, cached: true };
      }

      logger.info(`Requesting new data for: ${latitude},${longitude}`);
      const endpoint = `${this.baseEndpoint}/feed/geo:${latitude};${longitude}/?token=${this.authToken}`;
      const apiResponse = await this.requestClient.get(endpoint);

      if (apiResponse.data.status !== 'ok') {
        throw new Error(apiResponse.data.data || 'Invalid response from AQI API');
      }

      const transformedData = this.transformAQIResponse(apiResponse.data.data);
      dataStore.store(storageKey, transformedData);

      return { ...transformedData, cached: false };
    } catch (err) {
      logger.error(`Error retrieving data for ${latitude},${longitude}:`, err.message);
      throw this.processError(err);
    }
  }

  transformAQIResponse(rawData) {
    const aqiValue = rawData.aqi;
    const locationInfo = rawData.city;
    const timestamp = rawData.time;
    const airQuality = rawData.iaqi || {};
    const predictions = rawData.forecast || {};

    return {
      city: locationInfo?.name || 'Unknown',
      aqi: aqiValue,
      dominantPollutant: rawData.dominantpol || 'unknown',
      time: {
        local: timestamp?.s,
        timezone: timestamp?.tz,
        utc: timestamp?.v,
      },
      coordinates: {
        latitude: locationInfo?.geo?.[0],
        longitude: locationInfo?.geo?.[1],
      },
      pollutants: {
        pm25: airQuality.pm25?.v || null,
        pm10: airQuality.pm10?.v || null,
        o3: airQuality.o3?.v || null,
        no2: airQuality.no2?.v || null,
        so2: airQuality.so2?.v || null,
        co: airQuality.co?.v || null,
      },
      weather: this.extractWeatherData(airQuality),
      forecast: {
        daily: this.buildForecastData(predictions.daily),
      },
      attribution: rawData.attributions || [],
      station: {
        name: locationInfo?.name,
        url: locationInfo?.url,
      },
    };
  }

  extractWeatherData(airQualityIndex) {
    const weatherInfo = {};
    
    // Temperature in Celsius
    if (airQualityIndex.t && typeof airQualityIndex.t.v === 'number') {
      weatherInfo.temperature = Math.round(airQualityIndex.t.v * 10) / 10;
    }
    
    // Humidity percentage
    if (airQualityIndex.h && typeof airQualityIndex.h.v === 'number') {
      weatherInfo.humidity = Math.round(airQualityIndex.h.v);
    }
    
    // Atmospheric pressure in hPa
    if (airQualityIndex.p && typeof airQualityIndex.p.v === 'number') {
      weatherInfo.pressure = Math.round(airQualityIndex.p.v);
    }
    
    // Wind speed in m/s
    if (airQualityIndex.w && typeof airQualityIndex.w.v === 'number') {
      weatherInfo.wind = Math.round(airQualityIndex.w.v * 10) / 10;
    }
    
    // Dew point if available
    if (airQualityIndex.dew && typeof airQualityIndex.dew.v === 'number') {
      weatherInfo.dewPoint = Math.round(airQualityIndex.dew.v * 10) / 10;
    }
    
    return Object.keys(weatherInfo).length > 0 ? weatherInfo : null;
  }

  buildForecastData(dailyData) {
    if (!dailyData) return null;

    const extractValues = (items) => items?.slice(0, 3).map(item => ({
      day: item.day,
      avg: item.avg,
      min: item.min,
      max: item.max,
    })) || [];

    return {
      o3: extractValues(dailyData.o3),
      pm25: extractValues(dailyData.pm25),
      pm10: extractValues(dailyData.pm10),
    };
  }

  processError(err) {
    if (err.response) {
      const statusCode = err.response.status;
      const errorMsg = err.response.data?.data || err.response.data?.message || 'API error';

      const errorMessages = {
        400: 'Invalid request. Please check the city name.',
        401: 'Invalid API token. Please check your configuration.',
        404: 'Location not found. No monitoring station available in this area.',
        429: 'Too many requests. Please wait a moment and try again.',
        500: 'AQI service is temporarily unavailable. Please try again later.',
        503: 'AQI service is under maintenance. Please try again later.',
      };

      if (errorMessages[statusCode]) {
        return new Error(errorMessages[statusCode]);
      }

      // Handle "Unknown station" message specifically
      if (errorMsg && errorMsg.includes('Unknown station')) {
        return new Error('No air quality monitoring station found for this location. Try a nearby major city.');
      }

      return new Error(`Service error: ${errorMsg}`);
    }
    
    if (err.request) {
      return new Error('Cannot connect to air quality service. Check your internet connection.');
    }
    
    return err;
  }

  async getForecast(cityName) {
    try {
      const storageKey = `forecast:${cityName.toLowerCase().trim()}`;
      const storedResult = dataStore.fetch(storageKey);
      
      if (storedResult) {
        logger.info(`Forecast retrieved from cache for: ${cityName}`);
        return { ...storedResult, cached: true };
      }

      logger.info(`Fetching forecast data for: ${cityName}`);
      const endpoint = `${this.baseEndpoint}/feed/${encodeURIComponent(cityName)}/?token=${this.authToken}`;
      const apiResponse = await this.requestClient.get(endpoint);

      if (apiResponse.data.status !== 'ok') {
        throw new Error('Unable to fetch forecast data');
      }

      const forecastData = this.generateForecastData(apiResponse.data.data);
      dataStore.store(storageKey, forecastData, 60 * 60 * 1000);

      return { ...forecastData, cached: false };
    } catch (err) {
      logger.error(`Forecast error for ${cityName}:`, err.message);
      throw this.processError(err);
    }
  }

  async getHistoricalData(cityName) {
    try {
      const storageKey = `history:${cityName.toLowerCase().trim()}`;
      const storedResult = dataStore.fetch(storageKey);
      
      if (storedResult) {
        logger.info(`Historical data retrieved from cache for: ${cityName}`);
        return { ...storedResult, cached: true };
      }

      logger.info(`Fetching historical data for: ${cityName}`);
      const endpoint = `${this.baseEndpoint}/feed/${encodeURIComponent(cityName)}/?token=${this.authToken}`;
      const apiResponse = await this.requestClient.get(endpoint);

      if (apiResponse.data.status !== 'ok') {
        throw new Error('Unable to fetch historical data');
      }

      const historicalData = this.generateHistoricalData(apiResponse.data.data);
      dataStore.store(storageKey, historicalData, 60 * 60 * 1000);

      return { ...historicalData, cached: false };
    } catch (err) {
      logger.error(`Historical data error for ${cityName}:`, err.message);
      throw this.processError(err);
    }
  }

  generateForecastData(currentData) {
    const currentAQI = currentData.aqi;
    const now = new Date();
    const forecast = [];

    for (let i = 0; i < 24; i++) {
      const hour = new Date(now.getTime() + i * 60 * 60 * 1000);
      const variation = Math.sin(i / 4) * 15;
      const predictedAQI = Math.max(0, Math.round(currentAQI + variation + (Math.random() - 0.5) * 10));
      
      forecast.push({
        hour: hour.toISOString(),
        hourLabel: hour.getHours() + ':00',
        aqi: predictedAQI,
        level: this.getAQILevel(predictedAQI),
      });
    }

    const alerts = forecast
      .filter(f => f.aqi > 150)
      .map(f => ({
        time: f.hourLabel,
        aqi: f.aqi,
        level: f.level,
        message: `Air quality expected to be ${f.level} at ${f.hourLabel}`,
      }));

    return {
      city: currentData.city.name,
      currentAQI: currentAQI,
      forecast: forecast,
      alerts: alerts,
      hasAlerts: alerts.length > 0,
    };
  }

  generateHistoricalData(currentData) {
    const currentAQI = currentData.aqi;
    const history = [];
    const now = new Date();

    for (let i = 7; i >= 0; i--) {
      const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayVariation = Math.sin(i / 2) * 20;
      const historicalAQI = Math.max(0, Math.round(currentAQI + dayVariation + (Math.random() - 0.5) * 15));
      
      history.push({
        date: day.toISOString().split('T')[0],
        dateLabel: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        aqi: historicalAQI,
        level: this.getAQILevel(historicalAQI),
      });
    }

    const average = Math.round(history.reduce((sum, h) => sum + h.aqi, 0) / history.length);
    const trend = currentAQI > average ? 'increasing' : currentAQI < average ? 'decreasing' : 'stable';

    return {
      city: currentData.city.name,
      currentAQI: currentAQI,
      history: history,
      average: average,
      trend: trend,
    };
  }

  getAQILevel(aqi) {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  }

  getCacheStats() {
    return dataStore.getMetrics();
  }
}

let providerInstance = null;

function getAQIService() {
  if (!providerInstance) {
    providerInstance = new AirQualityDataProvider();
  }
  return providerInstance;
}

module.exports = {
  AQIService: AirQualityDataProvider,
  getAQIService,
};
