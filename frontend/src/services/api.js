import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
      throw new Error(error.response.data.message || 'An error occurred');
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request);
      throw new Error('Unable to reach the server. Please check your connection.');
    } else {
      // Something else happened
      console.error('Error:', error.message);
      throw new Error(error.message);
    }
  }
);

export const searchCityAQI = async (cityName) => {
  const response = await apiClient.get('/aqi/search', {
    params: { city: cityName },
  });
  return response.data;
};

export const searchCoordinatesAQI = async (lat, lng) => {
  const response = await apiClient.get('/aqi/coordinates', {
    params: { lat, lng },
  });
  return response.data;
};

export const getCacheStats = async () => {
  const response = await apiClient.get('/aqi/cache-stats');
  return response.data;
};

export const checkHealth = async () => {
  const response = await apiClient.get('/health', {
    baseURL: process.env.REACT_APP_API_BASE_URL?.replace('/api', '') || 'http://localhost:3001',
  });
  return response.data;
};

export default apiClient;
