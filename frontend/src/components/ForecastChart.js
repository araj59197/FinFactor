import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './ForecastChart.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function ForecastChart({ forecastData }) {
    if (!forecastData || !forecastData.forecast) {
        return <div className="no-data">No forecast data available</div>;
    }

    const getColorForAQI = (aqi) => {
        if (aqi <= 50) return '#00E400';
        if (aqi <= 100) return '#FFFF00';
        if (aqi <= 150) return '#FF7E00';
        if (aqi <= 200) return '#FF0000';
        if (aqi <= 300) return '#8F3F97';
        return '#7E0023';
    };

    const data = {
        labels: forecastData.forecast.map(f => f.hourLabel),
        datasets: [
            {
                label: 'AQI Forecast',
                data: forecastData.forecast.map(f => f.aqi),
                borderColor: '#4A90E2',
                backgroundColor: 'rgba(74, 144, 226, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: forecastData.forecast.map(f => getColorForAQI(f.aqi)),
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            title: {
                display: true,
                text: '24-Hour AQI Forecast',
                font: {
                    size: 18,
                    weight: 'bold',
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const aqi = context.parsed.y;
                        const level = forecastData.forecast[context.dataIndex].level;
                        return `AQI: ${aqi} (${level})`;
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'AQI Value',
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Time',
                },
                grid: {
                    display: false,
                },
            },
        },
    };

    return (
        <div className="forecast-chart-container">
            <div className="chart-wrapper">
                <Line data={data} options={options} />
            </div>

            {forecastData.hasAlerts && (
                <div className="forecast-alerts">
                    <h3>🚨 Air Quality Alerts</h3>
                    <div className="alerts-list">
                        {forecastData.alerts.map((alert, index) => (
                            <div key={index} className="alert-item" style={{ borderLeftColor: getColorForAQI(alert.aqi) }}>
                                <span className="alert-time">{alert.time}</span>
                                <span className="alert-message">{alert.message}</span>
                                <span className="alert-aqi">AQI: {alert.aqi}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ForecastChart;
