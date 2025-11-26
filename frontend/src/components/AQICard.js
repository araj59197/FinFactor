import React from 'react';
import { formatDate } from '../utils/aqiHelpers';
import PollutantChart from './PollutantChart';
import './AQICard.css';

const AQICard = ({ data }) => {
  const { 
    aqi: qualityIndex, 
    city: location, 
    dominantPollutant: mainPollutant, 
    time: timeInfo, 
    coordinates: coords, 
    pollutants: pollutantData, 
    weather: weatherData, 
    aqiLevel: qualityLevel, 
    healthImplication: healthInfo, 
    cached: isCached, 
    station: stationInfo 
  } = data;

  return (
    <div className="aqi-card-container">
      <div className="aqi-main-card" style={{ background: qualityLevel.color }}>
        <div className="aqi-header">
          <div className="city-info">
            <h1 className="city-name" style={{ color: qualityLevel.textColor }}>{location}</h1>
            {stationInfo?.name && stationInfo.name !== location && (
              <p className="station-name" style={{ color: qualityLevel.textColor }}>
                Station: {stationInfo.name}
              </p>
            )}
          </div>
          {isCached && (
            <div className="cache-badge">
              ⚡ Cached
            </div>
          )}
        </div>

        <div className="aqi-value-section">
          <div className="aqi-emoji">{qualityLevel.emoji}</div>
          <div className="aqi-value" style={{ color: qualityLevel.textColor }}>{qualityIndex}</div>
          <div className="aqi-level" style={{ color: qualityLevel.textColor }}>{qualityLevel.level}</div>
        </div>

        <div className="aqi-meta" style={{ color: qualityLevel.textColor }}>
          <div className="meta-item">
            <span className="meta-label">Updated:</span>
            <span className="meta-value">{formatDate(timeInfo?.local || timeInfo?.utc)}</span>
          </div>
          {coords?.latitude && coords?.longitude && (
            <div className="meta-item">
              <span className="meta-label">Location:</span>
              <span className="meta-value">
                {coords.latitude.toFixed(4)}°, {coords.longitude.toFixed(4)}°
              </span>
            </div>
          )}
        </div>
      </div>

      {healthInfo && (
        <div className="health-card">
          <h3>🏥 Health Implications</h3>
          <div className="health-content">
            <p className="health-message">{healthInfo.message}</p>
            <div className="health-detail">
              <strong>Caution:</strong>
              <p>{healthInfo.cautionaryStatement}</p>
            </div>
            <div className="health-detail recommendation">
              <strong>Recommendation:</strong>
              <p>{healthInfo.recommendation}</p>
            </div>
          </div>
        </div>
      )}

      {pollutantData && <PollutantChart pollutants={pollutantData} dominantPollutant={mainPollutant} />}

      {weatherData && Object.keys(weatherData).length > 0 && (
        <div className="weather-card">
          <h3>🌤️ Weather Conditions</h3>
          <div className="weather-grid">
            {weatherData.temperature !== undefined && weatherData.temperature !== null && (
              <div className="weather-item">
                <div className="weather-icon">🌡️</div>
                <div className="weather-label">Temperature</div>
                <div className="weather-value">{weatherData.temperature}°C</div>
              </div>
            )}
            {weatherData.humidity !== undefined && weatherData.humidity !== null && (
              <div className="weather-item">
                <div className="weather-icon">💧</div>
                <div className="weather-label">Humidity</div>
                <div className="weather-value">{weatherData.humidity}%</div>
              </div>
            )}
            {weatherData.pressure !== undefined && weatherData.pressure !== null && (
              <div className="weather-item">
                <div className="weather-icon">🔽</div>
                <div className="weather-label">Pressure</div>
                <div className="weather-value">{weatherData.pressure} hPa</div>
              </div>
            )}
            {weatherData.wind !== undefined && weatherData.wind !== null && (
              <div className="weather-item">
                <div className="weather-icon">💨</div>
                <div className="weather-label">Wind Speed</div>
                <div className="weather-value">{weatherData.wind} m/s</div>
              </div>
            )}
            {weatherData.dewPoint !== undefined && weatherData.dewPoint !== null && (
              <div className="weather-item">
                <div className="weather-icon">💦</div>
                <div className="weather-label">Dew Point</div>
                <div className="weather-value">{weatherData.dewPoint}°C</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AQI Scale Reference */}
      <div className="aqi-scale-card">
        <h3>📊 AQI Scale Reference</h3>
        <div className="aqi-scale">
          <div className="scale-item" style={{ background: '#00E400' }}>
            <span className="scale-range">0-50</span>
            <span className="scale-label">Good</span>
          </div>
          <div className="scale-item" style={{ background: '#FFFF00', color: '#000' }}>
            <span className="scale-range">51-100</span>
            <span className="scale-label">Moderate</span>
          </div>
          <div className="scale-item" style={{ background: '#FF7E00' }}>
            <span className="scale-range">101-150</span>
            <span className="scale-label">Unhealthy (Sensitive)</span>
          </div>
          <div className="scale-item" style={{ background: '#FF0000' }}>
            <span className="scale-range">151-200</span>
            <span className="scale-label">Unhealthy</span>
          </div>
          <div className="scale-item" style={{ background: '#8F3F97' }}>
            <span className="scale-range">201-300</span>
            <span className="scale-label">Very Unhealthy</span>
          </div>
          <div className="scale-item" style={{ background: '#7E0023' }}>
            <span className="scale-range">301+</span>
            <span className="scale-label">Hazardous</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AQICard;
