import React, { useState } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch, loading }) => {
  const [city, setCity] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    if (city.length < 2) {
      setError('City name must be at least 2 characters');
      return;
    }

    onSearch(city.trim());
  };

  const handleChange = (e) => {
    setCity(e.target.value);
    if (error) setError('');
  };

  const handleExampleClick = (exampleCity) => {
    setCity(exampleCity);
    setError('');
    onSearch(exampleCity);
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={city}
            onChange={handleChange}
            placeholder="Enter city name (e.g., London, New York, Tokyo)"
            className={`search-input ${error ? 'error' : ''}`}
            disabled={loading}
          />
          <button 
            type="submit" 
            className="search-button"
            disabled={loading}
          >
            {loading ? '⏳' : '🔍'} Search
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </form>

      <div className="example-cities">
        <span className="example-label">Try:</span>
        {['London', 'New York', 'Tokyo', 'Paris', 'Beijing', 'Mumbai'].map((exampleCity) => (
          <button
            key={exampleCity}
            onClick={() => handleExampleClick(exampleCity)}
            className="example-city"
            disabled={loading}
          >
            {exampleCity}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
