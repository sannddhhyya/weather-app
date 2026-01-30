const apiKey = "fa5f065a37b3eeaff8a779626c5243e0"; 
const button = document.getElementById("get-weather");
const citySelect = document.getElementById("city-input");
const currentWeatherDiv = document.getElementById("current-weather");
const forecastDiv = document.getElementById("forecast");

button.addEventListener("click", () => {
    const city = citySelect.value;

    // Fetch current weather
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},ZA&appid=${apiKey}&units=metric`)
        .then(res => res.json())
        .then(data => {
            if (data.cod === "404") {
                currentWeatherDiv.innerHTML = `<p>City not found!</p>`;
                return;
            }

            const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

            currentWeatherDiv.innerHTML = `
                <h2>${data.name}, ${data.sys.country}</h2>
                <img src="${iconUrl}" class="weather-icon" alt="weather icon">
                <p>Temperature: ${data.main.temp} °C</p>
                <p>Weather: ${data.weather[0].description}</p>
                <p>Humidity: ${data.main.humidity}%</p>
                <p>Wind: ${data.wind.speed} m/s</p>
            `;

            // Background color based on weather
            const weatherMain = data.weather[0].main.toLowerCase();
            if (weatherMain.includes("cloud")) {
                document.body.style.background = "linear-gradient(to bottom, #bdc3c7, #2c3e50)";
            } else if (weatherMain.includes("rain") || weatherMain.includes("drizzle")) {
                document.body.style.background = "linear-gradient(to bottom, #4e54c8, #8f94fb)";
            } else if (weatherMain.includes("clear")) {
                document.body.style.background = "linear-gradient(to bottom, #fceabb, #f8b500)";
            } else if (weatherMain.includes("snow")) {
                document.body.style.background = "linear-gradient(to bottom, #e6e9f0, #eef1f5)";
            } else if (weatherMain.includes("thunder")) {
                document.body.style.background = "linear-gradient(to bottom, #434343, #000000)";
            } else {
                document.body.style.background = "linear-gradient(to bottom, #87ceeb, #f0f8ff)";
            }
        })
        .catch(err => {
            console.error(err);
            currentWeatherDiv.innerHTML = `<p>Error fetching current weather.</p>`;
        });

    // Fetch 5-day forecast
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city},ZA&appid=${apiKey}&units=metric`)
        .then(res => res.json())
        .then(data => {
            if (data.cod !== "200") {
                forecastDiv.innerHTML = `<p>Forecast data not available.</p>`;
                return;
            }

            // Filter forecast to one per day at 12:00
            const dailyForecast = data.list.filter(f => f.dt_txt.includes("12:00:00"));
            forecastDiv.innerHTML = "";
            dailyForecast.forEach(f => {
                const iconUrl = `https://openweathermap.org/img/wn/${f.weather[0].icon}@2x.png`;
                const date = new Date(f.dt_txt).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' });

                forecastDiv.innerHTML += `
                    <div class="forecast-day">
                        <p>${date}</p>
                        <img src="${iconUrl}" alt="icon">
                        <p>${Math.round(f.main.temp)} °C</p>
                    </div>
                `;
            });
        })
        .catch(err => {
            console.error(err);
            forecastDiv.innerHTML = `<p>Error fetching forecast.</p>`;
        });
});
