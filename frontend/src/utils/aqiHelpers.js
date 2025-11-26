export const getAQILevel = (aqi) => {
  if (aqi <= 50) {
    return {
      level: 'Good',
      color: '#00E400',
      emoji: '😊',
      textColor: '#ffffff',
    };
  } else if (aqi <= 100) {
    return {
      level: 'Moderate',
      color: '#FFFF00',
      emoji: '😐',
      textColor: '#000000',
    };
  } else if (aqi <= 150) {
    return {
      level: 'Unhealthy for Sensitive Groups',
      color: '#FF7E00',
      emoji: '😷',
      textColor: '#ffffff',
    };
  } else if (aqi <= 200) {
    return {
      level: 'Unhealthy',
      color: '#FF0000',
      emoji: '😨',
      textColor: '#ffffff',
    };
  } else if (aqi <= 300) {
    return {
      level: 'Very Unhealthy',
      color: '#8F3F97',
      emoji: '🤢',
      textColor: '#ffffff',
    };
  } else {
    return {
      level: 'Hazardous',
      color: '#7E0023',
      emoji: '☠️',
      textColor: '#ffffff',
    };
  }
};

export const getPollutantName = (code) => {
  const pollutants = {
    pm25: 'PM2.5',
    pm10: 'PM10',
    o3: 'Ozone (O₃)',
    no2: 'NO₂',
    so2: 'SO₂',
    co: 'CO',
  };
  return pollutants[code] || code.toUpperCase();
};

export const getPollutantDescription = (code) => {
  const descriptions = {
    pm25: 'Fine particulate matter smaller than 2.5 micrometers',
    pm10: 'Particulate matter smaller than 10 micrometers',
    o3: 'Ground-level ozone',
    no2: 'Nitrogen dioxide',
    so2: 'Sulfur dioxide',
    co: 'Carbon monoxide',
  };
  return descriptions[code] || 'Air pollutant';
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return dateString;
  }
};

export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};
