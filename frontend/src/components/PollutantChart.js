import React from 'react';
import { getPollutantName } from '../utils/aqiHelpers';
import './PollutantChart.css';

const PollutantChart = ({ pollutants, dominantPollutant }) => {
  const pollutantData = Object.entries(pollutants)
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(([key, value]) => ({
      name: getPollutantName(key),
      key,
      value: value,
      isDominant: key === dominantPollutant,
    }));

  if (pollutantData.length === 0) {
    return (
      <div className="pollutant-chart">
        <h3>Pollutant Levels</h3>
        <p className="no-data">No pollutant data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...pollutantData.map(p => p.value), 100);

  return (
    <div className="pollutant-chart">
      <h3>💨 Pollutant Levels</h3>
      <div className="pollutants-grid">
        {pollutantData.map((pollutant) => (
          <div key={pollutant.key} className="pollutant-item">
            <div className="pollutant-header">
              <span className="pollutant-name">
                {pollutant.name}
                {pollutant.isDominant && <span className="dominant-badge">Dominant</span>}
              </span>
              <span className="pollutant-value">{pollutant.value.toFixed(1)}</span>
            </div>
            <div className="pollutant-bar-container">
              <div
                className={`pollutant-bar ${pollutant.isDominant ? 'dominant' : ''}`}
                style={{
                  width: `${(pollutant.value / maxValue) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PollutantChart;
