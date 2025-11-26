function getAQILevel(aqi) {
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
}

function getHealthImplication(aqi) {
  if (aqi <= 50) {
    return {
      message: 'Air quality is satisfactory, and air pollution poses little or no risk.',
      cautionaryStatement: 'None',
      recommendation: 'Enjoy your normal outdoor activities.',
    };
  } else if (aqi <= 100) {
    return {
      message: 'Air quality is acceptable. However, there may be a risk for some people.',
      cautionaryStatement: 'Unusually sensitive people should consider limiting prolonged outdoor exertion.',
      recommendation: 'Moderate outdoor activities are acceptable.',
    };
  } else if (aqi <= 150) {
    return {
      message: 'Members of sensitive groups may experience health effects.',
      cautionaryStatement: 'People with respiratory or heart conditions, children, and older adults should limit prolonged outdoor exertion.',
      recommendation: 'Sensitive groups should reduce outdoor activities.',
    };
  } else if (aqi <= 200) {
    return {
      message: 'Some members of the general public may experience health effects.',
      cautionaryStatement: 'Everyone should limit prolonged outdoor exertion, especially sensitive groups.',
      recommendation: 'Limit outdoor activities. Wear a mask if going outside.',
    };
  } else if (aqi <= 300) {
    return {
      message: 'Health alert: The risk of health effects is increased for everyone.',
      cautionaryStatement: 'Everyone should avoid prolonged outdoor exertion. Sensitive groups should remain indoors.',
      recommendation: 'Avoid outdoor activities. Stay indoors with air purification.',
    };
  } else {
    return {
      message: 'Health warning of emergency conditions: everyone is more likely to be affected.',
      cautionaryStatement: 'Everyone should avoid all outdoor exertion.',
      recommendation: 'Stay indoors. Use air purifiers. Seek medical attention if experiencing symptoms.',
    };
  }
}

/**
 * Get pollutant name
 * @param {string} code - Pollutant code
 * @returns {string} Full name
 */
function getPollutantName(code) {
  const pollutants = {
    pm25: 'PM2.5',
    pm10: 'PM10',
    o3: 'Ozone',
    no2: 'Nitrogen Dioxide',
    so2: 'Sulfur Dioxide',
    co: 'Carbon Monoxide',
  };
  return pollutants[code] || code.toUpperCase();
}

/**
 * Get pollutant description
 * @param {string} code - Pollutant code
 * @returns {string} Description
 */
function getPollutantDescription(code) {
  const descriptions = {
    pm25: 'Fine particulate matter (diameter < 2.5 μm)',
    pm10: 'Coarse particulate matter (diameter < 10 μm)',
    o3: 'Ground-level ozone',
    no2: 'Nitrogen dioxide gas',
    so2: 'Sulfur dioxide gas',
    co: 'Carbon monoxide gas',
  };
  return descriptions[code] || 'Air pollutant';
}

module.exports = {
  getAQILevel,
  getHealthImplication,
  getPollutantName,
  getPollutantDescription,
};
