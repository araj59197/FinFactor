import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import AQICard from './components/AQICard';
import Loading from './components/Loading';
import ForecastChart from './components/ForecastChart';
import HistoricalChart from './components/HistoricalChart';
import { searchCityAQI, getForecast, getHistoricalData } from './services/api';
import './App.css';

function App() {
  const [airQualityInfo, setAirQualityInfo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('current');
  const [forecastData, setForecastData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [currentCity, setCurrentCity] = useState(null);

  const performSearch = async (location) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setAirQualityInfo(null);
    setForecastData(null);
    setHistoricalData(null);
    setCurrentCity(location);

    try {
      const result = await searchCityAQI(location);
      if (result.success) {
        setAirQualityInfo(result.data);
        
        try {
          const forecast = await getForecast(location);
          if (forecast.success) {
            setForecastData(forecast.data);
          }
        } catch (err) {
          console.error('Forecast error:', err);
        }

        try {
          const historical = await getHistoricalData(location);
          if (historical.success) {
            setHistoricalData(historical.data);
          }
        } catch (err) {
          console.error('Historical data error:', err);
        }
      } else {
        setErrorMsg(result.message || 'Failed to fetch AQI data');
      }
    } catch (error) {
      setErrorMsg(error.message || 'An error occurred while fetching data');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="app">
      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <h1 className="app-title">
              <span className="title-icon">🌍</span>
              Air Quality Index Search
            </h1>
            <p className="app-subtitle">
              Check real-time air quality information for cities worldwide
            </p>
          </div>
        </header>

        <div className="search-section">
          <SearchBar onSearch={performSearch} loading={isProcessing} />
        </div>

        <div className="results-section">
          {isProcessing && <Loading />}

          {errorMsg && (
            <div className="error-container">
              <div className="error-icon">❌</div>
              <h3>Oops! Something went wrong</h3>
              <p className="error-message">{errorMsg}</p>
              <p className="error-help">
                Please try again with a different city name or check your internet connection.
              </p>
            </div>
          )}

          {!isProcessing && !errorMsg && airQualityInfo && (
            <>
              <div className="tabs-container">
                <button
                  className={`tab-button ${activeTab === 'current' ? 'active' : ''}`}
                  onClick={() => setActiveTab('current')}
                >
                  📊 Current
                </button>
                <button
                  className={`tab-button ${activeTab === 'forecast' ? 'active' : ''}`}
                  onClick={() => setActiveTab('forecast')}
                >
                  🔮 Forecast (24h)
                </button>
                <button
                  className={`tab-button ${activeTab === 'historical' ? 'active' : ''}`}
                  onClick={() => setActiveTab('historical')}
                >
                  📈 History (7d)
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'current' && <AQICard data={airQualityInfo} />}
                {activeTab === 'forecast' && <ForecastChart forecastData={forecastData} />}
                {activeTab === 'historical' && <HistoricalChart historicalData={historicalData} />}
              </div>
            </>
          )}

          {!isProcessing && !errorMsg && !airQualityInfo && (
            <div className="welcome-container">
              <div className="welcome-icon">🔍</div>
              <h2>Welcome to AQI Search!</h2>
              <p>Enter a city name above to check its air quality index.</p>
              <div className="info-cards">
                <div className="info-card">
                  <div className="info-card-icon">⚡</div>
                  <h4>Fast & Cached</h4>
                  <p>Lightning-fast results with intelligent caching</p>
                </div>
                <div className="info-card">
                  <div className="info-card-icon">🌐</div>
                  <h4>Global Coverage</h4>
                  <p>Access AQI data from 30,000+ monitoring stations worldwide</p>
                </div>
                <div className="info-card">
                  <div className="info-card-icon">📊</div>
                  <h4>Detailed Insights</h4>
                  <p>View pollutant levels, health implications, and more</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="app-footer">
          <p>
            Data provided by{' '}
            <a
              href="https://aqicn.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              AQICN (World Air Quality Index)
            </a>
          </p>
          <p className="footer-note">
            Real-time air quality data • Updated every hour
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
