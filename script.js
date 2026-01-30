const apiKey = "YOUR_API_KEY"; // Replace with your OpenWeatherMap API key
const button = document.getElementById("get-weather");
const input = document.getElementById("city-input");
const resultDiv = document.getElementById("weather-result");

button.addEventListener("click", () => {
    const city = input.value.trim();
    if (!city) {
        alert("Please enter a city name");
        return;
    }

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
        .then(res => res.json())
        .then(data => {
            if (data.cod === "404") {
                resultDiv.innerHTML = `<p>City not found!</p>`;
                return;
            }

            const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

            // Display weather info
            resultDiv.innerHTML = `
                <h2>${data.name}, ${data.sys.country}</h2>
                <img src="${iconUrl}" class="weather-icon" alt="weather icon">
                <p>Temperature: ${data.main.temp} °C</p>
                <p>Weather: ${data.weather[0].description}</p>
                <p>Humidity: ${data.main.humidity}%</p>
            `;

            // Change background based on main weather
            const weatherMain = data.weather[0].main.toLowerCase();
            if (weatherMain.includes("cloud")) {
                document.body.style.background = "linear-gradient(to bottom, #bdc3c7, #2c3e50)"; // cloudy grey
            } else if (weatherMain.includes("rain") || weatherMain.includes("drizzle")) {
                document.body.style.background = "linear-gradient(to bottom, #4e54c8, #8f94fb)"; // rainy purple
            } else if (weatherMain.includes("clear")) {
                document.body.style.background = "linear-gradient(to bottom, #fceabb, #f8b500)"; // sunny yellow
            } else if (weatherMain.includes("snow")) {
                document.body.style.background = "linear-gradient(to bottom, #e6e9f0, #eef1f5)"; // snowy light blue
            } else if (weatherMain.includes("thunder")) {
                document.body.style.background = "linear-gradient(to bottom, #434343, #000000)"; // stormy dark
            } else {
                document.body.style.background = "linear-gradient(to bottom, #87ceeb, #f0f8ff)"; // default sky
            }
        })
        .catch(err => {
            console.error(err);
            resultDiv.innerHTML = `<p>Error fetching weather data.</p>`;
        });
});
