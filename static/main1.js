// API endpoint
const API_ENDPOINT = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';
const API_KEY = 'ZEKBSKBU2HRJ3DC7MRBJYJ26N'; // Replace with your actual API key

let currentLocation = '';

// Fetch weather data
async function fetchWeatherData(location) {
    try {
        const url = `${API_ENDPOINT}/${location}?unitGroup=us&key=${API_KEY}&contentType=json&include=current,days`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Weather data not found for this location');
        }
        const data = await response.json();
        updateWeatherUI(data);
        document.getElementById('weather-summary').style.display = 'block';
        document.getElementById('prediction-tool').style.display = 'block';
        return data; // Return data for use in plant growth prediction
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert(error.message);
    }
}

// Update weather UI
function updateWeatherUI(data) {
    document.getElementById('current-location').textContent = data.resolvedAddress;
    document.getElementById('temperature').textContent = data.currentConditions.temp;
    document.getElementById('humidity').textContent = data.currentConditions.humidity;
    document.getElementById('precipitation').textContent = data.currentConditions.precip;

    // Update forecast summary
    const forecastSummary = document.getElementById('forecast-summary');
    forecastSummary.innerHTML = '';
    data.days.slice(0, 7).forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.textContent = `${new Date(day.datetime).toLocaleDateString('en-US', { weekday: 'short' })}: ${day.temp}°F`;
        forecastSummary.appendChild(dayElement);
    });
}

// Predict plant growth
function predictGrowth(plantType, plantingDate, weatherData) {
    // This is a simplified prediction model. You should implement a more sophisticated model based on plant-specific data and growth patterns.
    const growthDays = {
        'tomato': 80,
        'pepper': 70,
        'cucumber': 60
    };

    const plantingDateObj = new Date(plantingDate);
    const harvestDate = new Date(plantingDateObj.setDate(plantingDateObj.getDate() + growthDays[plantType]));

    // Use weather data to adjust predictions
    const avgTemp = weatherData.days.reduce((sum, day) => sum + day.temp, 0) / weatherData.days.length;
    const avgPrecip = weatherData.days.reduce((sum, day) => sum + day.precip, 0) / weatherData.days.length;

    let growthRate = 1; // Normal growth rate
    if (avgTemp > 80) growthRate *= 1.2; // Faster growth in warmer weather
    if (avgTemp < 60) growthRate *= 0.8; // Slower growth in cooler weather
    if (avgPrecip < 0.1) growthRate *= 0.9; // Slower growth in dry conditions

    const adjustedGrowthDays = Math.round(growthDays[plantType] / growthRate);

    return {
        harvestDate: new Date(plantingDateObj.setDate(plantingDateObj.getDate() + adjustedGrowthDays)).toLocaleDateString('en-US'),
        growthStages: [
            { stage: 'Germination', days: Math.round(7 / growthRate) },
            { stage: 'Seedling', days: Math.round(14 / growthRate) },
            { stage: 'Vegetative', days: Math.round(30 / growthRate) },
            { stage: 'Flowering', days: Math.round(20 / growthRate) },
            { stage: 'Fruiting', days: adjustedGrowthDays - Math.round(71 / growthRate) }
        ],
        recommendations: [
            `Water ${plantType} plants deeply ${avgPrecip < 0.1 ? 'twice' : 'once'} a week`,
            `Ensure plants receive ${avgTemp > 80 ? '4-6' : '6-8'} hours of sunlight daily`,
            `Watch for pests common to ${plantType} plants`,
            avgTemp > 80 ? 'Provide shade during the hottest part of the day' : '',
            avgTemp < 60 ? 'Consider using row covers to protect from cold' : ''
        ].filter(Boolean)
    };
}

// Update prediction UI
function updatePredictionUI(prediction) {
    document.getElementById('prediction-results').style.display = 'block';
    document.getElementById('harvest-date').textContent = prediction.harvestDate;

    const timeline = document.getElementById('growth-timeline');
    timeline.innerHTML = '';
    prediction.growthStages.forEach(stage => {
        const stageElement = document.createElement('div');
        stageElement.textContent = `${stage.stage}: ${stage.days} days`;
        timeline.appendChild(stageElement);
    });

    const recommendations = document.getElementById('recommendations');
    recommendations.innerHTML = '';
    prediction.recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        recommendations.appendChild(li);
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('location-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        currentLocation = document.getElementById('location').value;
        await fetchWeatherData(currentLocation);
    });

    document.getElementById('prediction-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const plantType = document.getElementById('plant-type').value;
        const plantingDate = document.getElementById('planting-date').value;
        
        const weatherData = await fetchWeatherData(currentLocation);
        if (weatherData) {
            const prediction = predictGrowth(plantType, plantingDate, weatherData);
            updatePredictionUI(prediction);
        }
    });

    // Plant of the Day feature remains unchanged
});