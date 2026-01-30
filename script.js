// ============================================
// WEATHER APP FOR SOUTH AFRICA
// Uses OpenWeatherMap API - Free Tier (1000 calls/day)
// ============================================

// 🔑 REPLACE WITH YOUR OPENWEATHERMAP API KEY
// Get one for free at: https://home.openweathermap.org/users/sign_up
const API_KEY = "YOUR_API_KEY_HERE"; // ⚠️ IMPORTANT: Replace this!

// DOM Elements
const button = document.getElementById("get-weather");
const select = document.getElementById("city-input");
const resultDiv = document.getElementById("weather-result");
const apiCountElement = document.getElementById("api-count");
const usageFillElement = document.getElementById("usage-fill");

// API Usage Tracking
let apiCallsToday = 0;
const MAX_CALLS_PER_DAY = 1000;

// Mock data for fallback (in case API fails or limit reached)
const mockWeatherData = {
    "Johannesburg": { 
        temp: 22, feelsLike: 23, humidity: 45, wind: 15, 
        condition: "Clear", description: "clear sky", icon: "01d",
        pressure: 1015, sunrise: "05:45", sunset: "18:30"
    },
    "Cape Town": { 
        temp: 18, feelsLike: 17, humidity: 65, wind: 25, 
        condition: "Clouds", description: "few clouds", icon: "02d",
        pressure: 1013, sunrise: "06:15", sunset: "19:45"
    },
    "Durban": { 
        temp: 26, feelsLike: 28, humidity: 75, wind: 10, 
        condition: "Clear", description: "clear sky", icon: "01d",
        pressure: 1016, sunrise: "05:30", sunset: "18:15"
    },
    "Pretoria": { 
        temp: 24, feelsLike: 25, humidity: 50, wind: 12, 
        condition: "Clear", description: "clear sky", icon: "01d",
        pressure: 1014, sunrise: "05:40", sunset: "18:25"
    },
    "Port Elizabeth": { 
        temp: 19, feelsLike: 18, humidity: 60, wind: 30, 
        condition: "Wind", description: "windy", icon: "50d",
        pressure: 1012, sunrise: "06:00", sunset: "19:20"
    },
    "Bloemfontein": { 
        temp: 21, feelsLike: 22, humidity: 40, wind: 18, 
        condition: "Clear", description: "clear sky", icon: "01d",
        pressure: 1015, sunrise: "05:50", sunset: "18:35"
    },
    "Nelspruit": { 
        temp: 27, feelsLike: 29, humidity: 55, wind: 8, 
        condition: "Clear", description: "clear sky", icon: "01d",
        pressure: 1013, sunrise: "05:20", sunset: "18:10"
    },
    "East London": { 
        temp: 20, feelsLike: 19, humidity: 70, wind: 22, 
        condition: "Clouds", description: "scattered clouds", icon: "03d",
        pressure: 1014, sunrise: "05:55", sunset: "18:40"
    }
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadApiUsage();
    updateUsageDisplay();
    
    // Add click event to button
    button.addEventListener('click', getWeather);
    
    // Add Enter key support
    select.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            getWeather();
        }
    });
    
    // Check if API key is set
    checkApiKey();
});

// Main function to get weather
function getWeather() {
    const city = select.value;
    
    // Check API key
    if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
        showApiKeyError();
        return;
    }
    
    // Check daily limit
    if (apiCallsToday >= MAX_CALLS_PER_DAY) {
        showLimitReached(city);
        return;
    }
    
    // Show loading state
    showLoading(city);
    
    // Make API call
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city},ZA&appid=${API_KEY}&units=metric`;
    
    // Add timeout for mobile networks
    const timeout = setTimeout(() => {
        showError("Request timeout. Please check your connection.");
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-cloud-sun"></i> Get Weather';
    }, 10000);
    
    fetch(apiUrl)
        .then(response => {
            clearTimeout(timeout);
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Invalid API key. Please check your API key.");
                } else if (response.status === 404) {
                    throw new Error("City not found. Please try another city.");
                } else if (response.status === 429) {
                    apiCallsToday = MAX_CALLS_PER_DAY;
                    updateUsageDisplay();
                    throw new Error("Daily API limit reached (1000 calls). Try again tomorrow.");
                } else {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
            }
            return response.json();
        })
        .then(data => {
            // Increment API call counter
            apiCallsToday++;
            saveApiUsage();
            updateUsageDisplay();
            
            // Display weather data
            displayWeather(data);
        })
        .catch(error => {
            console.error("API Error:", error);
            
            // Show error or fallback to mock data
            if (error.message.includes("API limit") || error.message.includes("timeout")) {
                showError(error.message);
            } else {
                // Use mock data as fallback
                useMockData(city);
            }
        })
        .finally(() => {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-cloud-sun"></i> Get Weather';
        });
}

// Display weather data from API
function displayWeather(data) {
    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    const currentTime = new Date().toLocaleTimeString('en-ZA', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // Convert sunrise/sunset times
    const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-ZA', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString('en-ZA', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Update background based on weather
    updateBackground(data.weather[0].main);
    
    // Create weather display HTML
    resultDiv.innerHTML = `
        <div class="weather-card">
            <div class="city-header">
                <h2>${data.name}, ${data.sys.country}</h2>
                <p class="last-updated">Updated: ${currentTime}</p>
            </div>
            
            <img src="${iconUrl}" class="weather-icon" alt="${data.weather[0].description}">
            
            <div class="temperature">${Math.round(data.main.temp)}°C</div>
            <div class="temp-feels-like">Feels like: ${Math.round(data.main.feels_like)}°C</div>
            
            <div class="weather-description">
                ${data.weather[0].description}
            </div>
            
            <div class="weather-details">
                <div class="detail-item">
                    <i class="fas fa-tint"></i>
                    <div class="detail-label">Humidity</div>
                    <div class="detail-value">${data.main.humidity}%</div>
                </div>
                
                <div class="detail-item">
                    <i class="fas fa-wind"></i>
                    <div class="detail-label">Wind</div>
                    <div class="detail-value">${Math.round(data.wind.speed * 3.6)} km/h</div>
                </div>
                
                <div class="detail-item">
                    <i class="fas fa-tachometer-alt"></i>
                    <div class="detail-label">Pressure</div>
                    <div class="detail-value">${data.main.pressure} hPa</div>
                </div>
                
                <div class="detail-item">
                    <i class="fas fa-sun"></i>
                    <div class="detail-label">Sunrise/Sunset</div>
                    <div class="detail-value">${sunriseTime} / ${sunsetTime}</div>
                </div>
            </div>
            
            <div class="api-status">
                <small><i class="fas fa-check-circle" style="color: #4CAF50;"></i> Live data from OpenWeatherMap</small>
            </div>
        </div>
    `;
}

// Use mock data as fallback
function useMockData(city) {
    const mockData = mockWeatherData[city];
    if (!mockData) return;
    
    updateBackground(mockData.condition);
    
    resultDiv.innerHTML = `
        <div class="weather-card">
            <div class="city-header">
                <h2>${city}, South Africa</h2>
                <p class="last-updated">Demo Data (API unavailable)</p>
            </div>
            
            <img src="https://openweathermap.org/img/wn/${mockData.icon}@2x.png" class="weather-icon" alt="${mockData.description}">
            
            <div class="temperature">${mockData.temp}°C</div>
            <div class="temp-feels-like">Feels like: ${mockData.feelsLike}°C</div>
            
            <div class="weather-description">
                ${mockData.description}
            </div>
            
            <div class="weather-details">
                <div class="detail-item">
                    <i class="fas fa-tint"></i>
                    <div class="detail-label">Humidity</div>
                    <div class="detail-value">${mockData.humidity}%</div>
                </div>
                
                <div class="detail-item">
                    <i class="fas fa-wind"></i>
                    <div class="detail-label">Wind</div>
                    <div class="detail-value">${mockData.wind} km/h</div>
                </div>
                
                <div class="detail-item">
                    <i class="fas fa-tachometer-alt"></i>
                    <div class="detail-label">Pressure</div>
                    <div class="detail-value">${mockData.pressure} hPa</div>
                </div>
                
                <div class="detail-item">
                    <i class="fas fa-sun"></i>
                    <div class="detail-label">Sunrise/Sunset</div>
                    <div class="detail-value">${mockData.sunrise} / ${mockData.sunset}</div>
                </div>
            </div>
            
            <div class="mock-data-notice">
                <i class="fas fa-info-circle"></i>
                Using demo data (API limit reached or offline)
            </div>
        </div>
    `;
}

// Update page background based on weather
function updateBackground(weatherCondition) {
    const body = document.body;
    body.className = ''; // Clear all classes
    
    const condition = weatherCondition.toLowerCase();
    
    if (condition.includes("clear") || condition.includes("sun")) {
        body.classList.add('sunny');
    } else if (condition.includes("cloud")) {
        body.classList.add('cloudy');
    } else if (condition.includes("rain") || condition.includes("drizzle")) {
        body.classList.add('rainy');
    } else if (condition.includes("thunder") || condition.includes("storm")) {
        body.classList.add('thunderstorm');
    } else if (condition.includes("snow") || condition.includes("ice")) {
        body.classList.add('snow');
    } else if (condition.includes("mist") || condition.includes("fog") || condition.includes("haze")) {
        body.classList.add('mist');
    } else {
        body.classList.add('clear');
    }
}

// API Usage Tracking Functions
function loadApiUsage() {
    const today = new Date().toDateString();
    const stored = JSON.parse(localStorage.getItem('weatherApiUsage') || '{}');
    
    if (stored.date === today) {
        apiCallsToday = stored.count || 0;
    } else {
        // New day, reset counter
        apiCallsToday = 0;
        saveApiUsage();
    }
}

function saveApiUsage() {
    const usageData = {
        date: new Date().toDateString(),
        count: apiCallsToday
    };
    localStorage.setItem('weatherApiUsage', JSON.stringify(usageData));
}

function updateUsageDisplay() {
    apiCountElement.textContent = apiCallsToday;
    
    const percentage = (apiCallsToday / MAX_CALLS_PER_DAY) * 100;
    usageFillElement.style.width = `${percentage}%`;
    
    // Update color based on usage
    usageFillElement.className = 'usage-fill';
    if (percentage >= 90) {
        usageFillElement.classList.add('danger');
    } else if (percentage >= 70) {
        usageFillElement.classList.add('warning');
    }
}

// UI Helper Functions
function showLoading(city) {
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    
    resultDiv.innerHTML = `
        <div class="weather-card">
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-cloud-sun fa-spin fa-3x" style="color: #2575fc; margin-bottom: 20px;"></i>
                <h3>Loading weather for ${city}...</h3>
                <p>Fetching real-time data from OpenWeatherMap</p>
            </div>
        </div>
    `;
}

function showError(message) {
    resultDiv.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error Loading Weather</h3>
            <p>${message}</p>
            <button onclick="useMockData('${select.value}')" class="weather-btn" style="margin-top: 15px; background: #666;">
                <i class="fas fa-desktop"></i> Use Demo Data
            </button>
        </div>
    `;
}

function showApiKeyError() {
    resultDiv.innerHTML = `
        <div class="error-message">
            <i class="fas fa-key"></i>
            <h3>API Key Required</h3>
            <p>You need to add your OpenWeatherMap API key to use real weather data.</p>
            <div style="margin-top: 20px; text-align: left; background: #f5f5f5; padding: 15px; border-radius: 8px;">
                <p><strong>How to get a FREE API key:</strong></p>
                <ol style="margin-left: 20px; margin-top: 10px;">
                    <li>Go to <a href="https://home.openweathermap.org/users/sign_up" target="_blank">OpenWeatherMap Signup</a></li>
                    <li>Create a free account (takes 2 minutes)</li>
                    <li>Find your API key in your account dashboard</li>
                    <li>Replace "YOUR_API_KEY_HERE" in script.js with your key</li>
                </ol>
            </div>
            <button onclick="useMockData('${select.value}')" class="weather-btn" style="margin-top: 20px;">
                <i class="fas fa-desktop"></i> Use Demo Data Instead
            </button>
        </div>
    `;
}

function showLimitReached(city) {
    resultDiv.innerHTML = `
        <div class="error-message">
            <i class="fas fa-ban"></i>
            <h3>Daily Limit Reached</h3>
            <p>You've used all 1000 API calls for today.</p>
            <p><small>The limit will reset at midnight UTC.</small></p>
            <button onclick="useMockData('${city}')" class="weather-btn" style="margin-top: 15px; background: #666;">
                <i class="fas fa-desktop"></i> Use Demo Data
            </button>
        </div>
    `;
}

function checkApiKey() {
    if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
        console.warn("⚠️ API key not set. Using demo mode.");
    }
}

// Make functions available globally for button onclick events
window.useMockData = useMockData;
