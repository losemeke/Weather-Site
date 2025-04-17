let inputField = document.getElementById("city"); 
let weatherButton = document.getElementById(`get_weather`)
let displayCardDiv = document.getElementById(`display-card`)
let whiteText = document.getElementById(`white-text`)

weatherButton.addEventListener("click", function(event){
    event.preventDefault();

    const cityName = inputField.value
    if (!cityName) {
        console.error("City name cannot be empty");
        return; // Stop execution if no city name is provided
    }

    const API_KEY = "010324f6cbd6095654c3584fadcb1492"
    const endPoint = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`

    fetchAPI(endPoint)
})

function fetchAPI(endPoint){
    fetch(endPoint).then((response)=>{
        return response.json()
    }).then((responseData)=>{ 
        let cityInput = responseData.name;
        let country = responseData.sys.country;
        let flag = getCountryFlag(country);
        let humidity = responseData.main.humidity;
        let tempCelsius = (responseData.main.temp - 273.15).toFixed(1);
        let windSpeedKmH = (responseData.wind.speed * 3.6).toFixed(1);
        let sunriseTime = convertUnixTimestampToTime(responseData.sys.sunrise);
        let sunsetTime = convertUnixTimestampToTime(responseData.sys.sunset);
        
        let description = responseData.weather[0].description;
        if (description.includes("clear sky")) {
            description = "☀️ Clear Sky";
        } else if (description.includes("scattered clouds")) {
            description = "Scattered Clouds 🌥️";
        } else if (description.includes("broken clouds")) {
            description = "Broken Clouds ☁️";
        } else if (description.includes("overcast clouds")) {
            description = "Overcast Clouds ☁️";
        } else if (description.includes("shower rain")) {
            description = "Shower Rain 🌧️";
        } else if (description.includes("light rain")) {
            description = "Light Rain 🌦️";
        } else if (description.includes("moderate rain")) {
            description = "Moderate Rain 🌧️";
        } else if (description.includes("heavy rain")) {
            description = "Heavy Rain 🌧️💦";
        } else if (description.includes("thunderstorm")) {
            description = "Thunderstorm ⛈️";
        } else if (description.includes("snow")) {
            description = "Snow ❄️";
        } else if (description.includes("mist")) {
            description = "Mist 🌫️";
        } else if (description.includes("fog")) {
            description = "Fog 🌁";
        } else if (description.includes("haze")) {
            description = "Haze 🌫️";
        } else {
            description = `${description.charAt(0).toUpperCase() + description.slice(1)} 🌈`; // fallback
        }
        

        // Extract precipitation data (rain or snow)
        const rainVolume = responseData.rain?.["1h"] || 0;
        const snowVolume = responseData.snow?.["1h"] || 0;

        let precipitationText = "0%";
        if (rainVolume > 0) {
            precipitationText = `Rain 🌧️: ${rainVolume} mm`;
        } else if (snowVolume > 0) {
            precipitationText = `Snow ❄️: ${snowVolume} mm`;
        }

        printWeatherUI({
            cityInput, 
            flag, 
            description,
            humidity, 
            tempCelsius, 
            windSpeedKmH,
            sunriseTime, 
            sunsetTime, 
            precipitationText
        });

        fetchCityImage(cityInput);

        // revealWeatherCard()

    }).catch(()=>{
        console.error("Failed to fetch weather data:");
    })
}

// Convert Unix timestamp to HH:MM:SS format
function convertUnixTimestampToTime(unixTimestamp) {
    let date = new Date(unixTimestamp * 1000);
    let hours = date.getHours().toString().padStart(2, "0");
    let minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
}

// Convert country code to flag emoji
function getCountryFlag(countryCode) {
    return countryCode ? String.fromCodePoint(...[...countryCode.toUpperCase()].map(c => 127397 + c.charCodeAt(0))) : "";
}


function printWeatherUI(data){ 
    displayCardDiv.querySelectorAll(".weather-card").forEach(card => card.remove());

    const {
        cityInput,
        flag,
        description,
        humidity,
        tempCelsius,
        windSpeedKmH,
        sunriseTime,
        sunsetTime,
        precipitationText
    } = data;

    let weatherCardDiv = document.createElement(`div`)
    weatherCardDiv.classList.add(`weather-card`)

    let headerDiv = document.createElement(`div`)
    headerDiv.classList.add(`wc1`)

    let cityElement = document.createElement(`h2`)
    cityElement.textContent = cityInput

    let flagElement = document.createElement(`span`)
    flagElement.classList.add(`country-flag`)
    flagElement.textContent = flag

    headerDiv.append(cityElement, flagElement)

    // Middle
    let midSectionDiv = document.createElement(`div`)
    midSectionDiv.classList.add(`wc2`)

    let descriptionElement = document.createElement(`p`)
    descriptionElement.classList.add(`weather-description`)
    descriptionElement.textContent = `${description}`

    let temperatureElement = document.createElement(`p`)
    temperatureElement.classList.add(`temperature`)
    temperatureElement.textContent = `${tempCelsius}°C`

    midSectionDiv.append(descriptionElement, temperatureElement)

    // Footer
    let footerDiv = document.createElement(`div`)
    footerDiv.classList.add(`wc3`)

    // Function to create the weather-tidbits container with a paragraph element
    function createWeatherTidbit(classNames, icon, label, value) {
        let container = document.createElement("div");
        container.classList.add("weather-tidbits");
        
        // this function is created to support easy CSS. It lets us add multiple classnames like HTML. See lines 195-198 for execution
        if (typeof classNames === "string") {
            container.classList.add(...classNames.split(" "));
        } else if (Array.isArray(classNames)) {
            container.classList.add(...classNames);
        }
    
        // Line 1: label + icon
        let labelLine = document.createElement("p");
        labelLine.classList.add("tidbit-label");
        labelLine.textContent = `${label} ${icon}`;

        // Line 2: value
        let valueLine = document.createElement("p");
        valueLine.classList.add("tidbit-value");
        valueLine.textContent = value;

        container.append(labelLine, valueLine);
        return container;
    }
    // Create each weather tidbit container
    let humidityContainer = createWeatherTidbit("humidity conditions", "💧", "Humidity", `${humidity}%`);
    let windSpeedContainer = createWeatherTidbit("wind-speed conditions", "💨", "Wind Speed", `${windSpeedKmH} km/h`);
    let sunriseContainer = createWeatherTidbit("sunrise conditions", "🌅", "Sunrise", `${sunriseTime}`);
    let sunsetContainer = createWeatherTidbit("sunset conditions", "🌇", "Sunset", `${sunsetTime}`);
    
    // Append all tidbit containers to wc3
    footerDiv.append(humidityContainer, windSpeedContainer, sunriseContainer, sunsetContainer);
    weatherCardDiv.append(headerDiv, midSectionDiv, footerDiv);
    displayCardDiv.append(weatherCardDiv);   
}


// Fetch a city image from Unsplash API
function fetchCityImage(city) {
    const UNSPLASH_KEY = "MHfMqpBmYUMENmF1u6cs1do--Bxb7rtzSWqhXjxP6b0";
    const unsplashURL = `https://api.unsplash.com/photos/random?query=${city} landscape&client_id=${UNSPLASH_KEY}`;

    fetch(unsplashURL)
        .then((res) => res.json())
        .then((data) => {
            document.body.style.backgroundImage = `url(${data.urls.regular})`;
        })
        .catch((err) => {
            console.error("Failed to fetch background image:", err);
        });
}

