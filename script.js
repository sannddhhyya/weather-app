// 🔑 Replace with your OpenWeatherMap API key
// Get one for free at: https://openweathermap.org/api
const apiKey = "YOUR_API_KEY_HERE"; // ⚠️ IMPORTANT: Replace this!

const button = document.getElementById("get-weather");
const select = document.getElementById("city-input");
const resultDiv = document.getElementById("weather-result");

button.addEventListener("click", () => {
    const city = select.value;
    
    // Validate API key
    if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
        resultDiv.innerHTML = `
            <p style="color: #e74c3c; font-weight: bold;">
                ⚠️ Please add your OpenWeatherMap API key!
            </p>
            <p style="font-size: 0.9rem; margin-top: 10px;">
                Get a free API key at: <br>
                <a href="https://openweathermap.org/api" target="_blank">
                    https://openweathermap.org/api
                </a>
            </p>
        `;
        return;
    }

    // Show loading state
    resultDiv.innerHTML = `<p>Loading weather data...</p>`;
    button.disabled = true;
    button.textContent = "Loading...";

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},ZA&appid=${apiKey}&units=metric`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            if (data.cod !== 200) {
                throw new Error(data.message || "City not found!");
            }

            const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

            // Display weather info
            resultDiv.innerHTML = `
                <h2>${data.name}, ${data.sys.country}</h2>
                <img src="${iconUrl}" class="weather-icon" alt="${data.weather[0].description}">
                <p><strong>Temperature:</strong> ${Math.round(data.main.temp)}°C</p>
                <p><strong>Feels like:</strong> ${Math.round(data.main.feels_like)}°C</p>
                <p><strong>Weather:</strong> ${data.weather[0].description}</p>
                <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
                <p><strong>Wind:</strong> ${Math.round(data.wind.speed * 3.6)} km/h</p>
            `;

            // Change background based on weather
            updateBackground(data.weather[0].main);
        })
        .catch(err => {
            console.error(err);
            resultDiv.innerHTML = `
                <p style="color: #e74c3c;">
                    ❌ Error: ${err.message}
                </p>
                <p style="font-size: 0.9rem; margin-top: 10px;">
                    Check your API key and internet connection.
                </p>
            `;
        })
        .finally(() => {
            button.disabled = false;
            button.textContent = "Get Weather";
        });
});

function updateBackground(weatherCondition) {
    const body = document.body;
    const condition = weatherCondition.toLowerCase();
    
    if (condition.includes("cloud")) {
        body.style.background = "linear-gradient(to bottom, #bdc3c7, #2c3e50)";
    } else if (condition.includes("rain") || condition.includes("drizzle")) {
        body.style.background = "linear-gradient(to bottom, #4e54c8, #8f94fb)";
    } else if (condition.includes("clear")) {
        body.style.background = "linear-gradient(to bottom, #fceabb, #f8b500)";
    } else if (condition.includes("snow")) {
        body.style.background = "linear-gradient(to bottom, #e6e9f0, #eef1f5)";
    } else if (condition.includes("thunder")) {
        body.style.background = "linear-gradient(to bottom, #434343, #000000)";
    } else if (condition.includes("fog") || condition.includes("mist")) {
        body.style.background = "linear-gradient(to bottom, #d7dde8, #757f9a)";
    } else {
        body.style.background = "linear-gradient(to bottom, #87ceeb, #f0f8ff)";
    }
}
