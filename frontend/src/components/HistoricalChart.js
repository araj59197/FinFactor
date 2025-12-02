import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './HistoricalChart.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function HistoricalChart({ historicalData, loading }) {
    if (loading) {
        return <div className="no-data">Loading historical data...</div>;
    }

    if (!historicalData) {
        return <div className="no-data">No historical data available. Please try searching for a city.</div>;
    }

    if (!historicalData.history || historicalData.history.length === 0) {
        return <div className="no-data">Historical data is not available for this location.</div>;
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
        labels: historicalData.history.map(h => h.dateLabel),
        datasets: [
            {
                label: 'Daily AQI',
                data: historicalData.history.map(h => h.aqi),
                backgroundColor: historicalData.history.map(h => getColorForAQI(h.aqi)),
                borderColor: historicalData.history.map(h => getColorForAQI(h.aqi)),
                borderWidth: 1,
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
                text: 'Past 7 Days AQI History',
                font: {
                    size: 18,
                    weight: 'bold',
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const aqi = context.parsed.y;
                        const level = historicalData.history[context.dataIndex].level;
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
                    text: 'Date',
                },
                grid: {
                    display: false,
                },
            },
        },
    };

    const getTrendIcon = (trend) => {
        if (trend === 'increasing') return '📈';
        if (trend === 'decreasing') return '📉';
        return '➡️';
    };

    const getTrendColor = (trend) => {
        if (trend === 'increasing') return '#d9534f';
        if (trend === 'decreasing') return '#5cb85c';
        return '#5bc0de';
    };

    return (
        <div className="historical-chart-container">
            <div className="chart-wrapper">
                <Bar data={data} options={options} />
            </div>

            <div className="historical-stats">
                <div className="stat-card">
                    <div className="stat-label">7-Day Average</div>
                    <div className="stat-value">{historicalData.average}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Current AQI</div>
                    <div className="stat-value">{historicalData.currentAQI}</div>
                </div>
                <div className="stat-card" style={{ borderColor: getTrendColor(historicalData.trend) }}>
                    <div className="stat-label">Trend</div>
                    <div className="stat-value" style={{ color: getTrendColor(historicalData.trend) }}>
                        {getTrendIcon(historicalData.trend)} {historicalData.trend}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HistoricalChart;
