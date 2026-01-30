const apiKey = "fa5f065a37b3eeaff8a779626c5243e0"; 
const button = document.getElementById("get-weather");
const citySelect = document.getElementById("city-input");
const currentWeatherDiv = document.getElementById("current-weather");
const forecastDiv = document.getElementById("forecast");

// City icons mapping
const cityIcons = {
    "Johannesburg": "fa-city",
    "Cape Town": "fa-mountain",
    "Durban": "fa-umbrella-beach",
    "Pretoria": "fa-landmark",
    "Port Elizabeth": "fa-ship",
    "Bloemfontein": "fa-flag",
    "Nelspruit": "fa-tree",
    "East London": "fa-water"
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Add icons to select options
    updateSelectOptions();
    
    // Add event listener
    button.addEventListener("click", fetchWeatherData);
    
    // Add Enter key support
    citySelect.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            fetchWeatherData();
        }
    });
    
    // Add loading animation to button on click
    button.addEventListener("click", function() {
        const originalContent = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        button.disabled = true;
        
        // Reset after 10 seconds if no response
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.disabled = false;
        }, 10000);
    });
});

function updateSelectOptions() {
    const options = citySelect.querySelectorAll("option");
    options.forEach(option => {
        const city = option.value;
        if (cityIcons[city]) {
            option.innerHTML = `<i class="fas ${cityIcons[city]}"></i> ${option.textContent}`;
        }
    });
}

function fetchWeatherData() {
    const city = citySelect.value;
    
    // Reset button state
    setTimeout(() => {
        button.innerHTML = '<i class="fas fa-cloud-sun"></i> Get Weather Report';
        button.disabled = false;
    }, 3000);
    
    // Fetch current weather
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},ZA&appid=${apiKey}&units=metric`)
        .then(res => res.json())
        .then(data => {
            if (data.cod === "404") {
                currentWeatherDiv.querySelector('.card-body').innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle fa-3x" style="color: #e03c31;"></i>
                        <h3>City Not Found</h3>
                        <p>Please select another city from the list.</p>
                    </div>
                `;
                return;
            }
            
            displayCurrentWeather(data);
            updateBackground(data.weather[0].main);
        })
        .catch(err => {
            console.error(err);
            currentWeatherDiv.querySelector('.card-body').innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle fa-3x" style="color: #e03c31;"></i>
                    <h3>Connection Error</h3>
                    <p>Unable to fetch weather data. Please check your connection.</p>
                </div>
            `;
        });

    // Fetch 5-day forecast
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city},ZA&appid=${apiKey}&units=metric`)
        .then(res => res.json())
        .then(data => {
            if (data.cod !== "200") {
                forecastDiv.querySelector('.card-body').innerHTML = `
                    <div class="error-message">
                        <p>Forecast data not available at the moment.</p>
                    </div>
                `;
                return;
            }
            
            displayForecast(data);
        })
        .catch(err => {
            console.error(err);
            forecastDiv.querySelector('.card-body').innerHTML = `
                <div class="error-message">
                    <p>Unable to load forecast data.</p>
                </div>
            `;
        });
}

function displayCurrentWeather(data) {
    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    const currentTime = new Date().toLocaleTimeString('en-ZA', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-ZA', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString('en-ZA', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const weatherHTML = `
        <div class="weather-display">
            <div class="weather-main">
                <div class="weather-icon-container">
                    <img src="${iconUrl}" class="weather-icon-large" alt="${data.weather[0].description}">
                    <div class="weather-description">${data.weather[0].description}</div>
                </div>
                
                <div class="temperature-display">
                    <div class="current-temp">${Math.round(data.main.temp)}°C</div>
                    <div class="temp-feels">Feels like: ${Math.round(data.main.feels_like)}°C</div>
                </div>
            </div>
            
            <div class="city-info">
                <h3><i class="fas ${cityIcons[data.name.split(',')[0]] || 'fa-city'}"></i> ${data.name}, ${data.sys.country}</h3>
                <p class="update-time">Last updated: ${currentTime}</p>
            </div>
            
            <div class="weather-details">
                <div class="detail-item">
                    <i class="fas fa-tint"></i>
                    <div class="detail-label">Humidity</div>
                    <div class="detail-value">${data.main.humidity}%</div>
                </div>
                
                <div class="detail-item">
                    <i class="fas fa-wind"></i>
                    <div class="detail-label">Wind Speed</div>
                    <div class="detail-value">${Math.round(data.wind.speed * 3.6)} km/h</div>
                </div>
                
                <div class="detail-item">
                    <i class="fas fa-temperature-low"></i>
                    <div class="detail-label">Pressure</div>
                    <div class="detail-value">${data.main.pressure} hPa</div>
                </div>
                
                <div class="detail-item">
                    <i class="fas fa-eye"></i>
                    <div class="detail-label">Visibility</div>
                    <div class="detail-value">${(data.visibility / 1000).toFixed(1)} km</div>
                </div>
                
                <div class="detail-item">
                    <i class="fas fa-sunrise"></i>
                    <div class="detail-label">Sunrise</div>
                    <div class="detail-value">${sunriseTime}</div>
                </div>
                
                <div class="detail-item">
                    <i class="fas fa-sunset"></i>
                    <div class="detail-label">Sunset</div>
                    <div class="detail-value">${sunsetTime}</div>
                </div>
            </div>
        </div>
    `;
    
    currentWeatherDiv.querySelector('.card-body').innerHTML = weatherHTML;
}

function displayForecast(data) {
    // Filter forecast to one per day at 12:00
    const dailyForecast = data.list.filter(f => f.dt_txt.includes("12:00:00"));
    
    let forecastHTML = '<div class="forecast-container">';
    
    dailyForecast.forEach(f => {
        const iconUrl = `https://openweathermap.org/img/wn/${f.weather[0].icon}@2x.png`;
        const date = new Date(f.dt_txt);
        const dayName = date.toLocaleDateString('en-ZA', { weekday: 'long' });
        const formattedDate = date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
        
        forecastHTML += `
            <div class="forecast-day">
                <h4>${dayName}</h4>
                <p class="forecast-date">${formattedDate}</p>
                <img src="${iconUrl}" class="forecast-icon" alt="${f.weather[0].description}">
                <div class="forecast-temp">${Math.round(f.main.temp)}°C</div>
                <div class="forecast-desc">${f.weather[0].description}</div>
                <div class="forecast-details">
                    <small><i class="fas fa-tint"></i> ${f.main.humidity}%</small>
                    <small><i class="fas fa-wind"></i> ${Math.round(f.wind.speed * 3.6)} km/h</small>
                </div>
            </div>
        `;
    });
    
    forecastHTML += '</div>';
    forecastDiv.querySelector('.card-body').innerHTML = forecastHTML;
}

function updateBackground(weatherCondition) {
    // Remove all weather background classes
    document.body.className = '';
    
    // Add appropriate background class
    const condition = weatherCondition.toLowerCase();
    if (condition.includes("clear")) {
        document.body.classList.add("clear-bg");
    } else if (condition.includes("cloud")) {
        document.body.classList.add("clouds-bg");
    } else if (condition.includes("rain") || condition.includes("drizzle")) {
        document.body.classList.add("rain-bg");
    } else if (condition.includes("thunder")) {
        document.body.classList.add("thunderstorm-bg");
    } else if (condition.includes("snow")) {
        document.body.classList.add("snow-bg");
    } else if (condition.includes("mist") || condition.includes("fog") || condition.includes("haze")) {
        document.body.classList.add("mist-bg");
    } else {
        // Default background
        document.body.style.background = "linear-gradient(135deg, #0c2461 0%, #1e3799 50%, #4a69bd 100%)";
    }
}
