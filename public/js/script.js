
const form = document.getElementById('form')
const seeRoute = document.getElementById('see-route')
const loader = document.getElementById('loader')
// stores descriptions of delays taken from TFL API in Delays function
const serviceDelays = []
// stores results of time estimate for each route (transit vs cycling)
const timeResults = []
const timeText = []
// stores array of points scored calculated by results of each function
const travelScore = []
let count = 0;
// Looks up cycle directions using Google JS API
const cycleDirections = () => {
  loader.style.display = "block";
  const from = document.getElementById('from');
  const to = document.getElementById('to');
  fetch(`/cycling-directions/${from.value}/${to.value}`)
    .then(response => response.json())
    .then((data) => {
      if (data.status == "OK") {
      const bike = data
      const bikeTime = bike.routes[0].legs[0].duration
      const bikeDistance = bike.routes[0].legs[0].distance
      timeResults.push(bikeTime.value);
      timeText.push(bikeTime.text);
      // calls next function - transit
      transitDirections()
    } else {
    document.getElementById("top-banner").style.backgroundImage = "linear-gradient( rgba(192, 36, 0, 0.9), rgba(192, 36, 0, 0.9) ), url('../img/header.jpg')"
    document.getElementById("no-bike").innerHTML = "Sorry, we couldn't find a route, please try again?";
    document.getElementById("no-bike").style.display = "flex";
    loader.style.display = "none";
    }
    });
};


// Looks up transit directions using Google JS API
const transitDirections = () => {
  const from = document.getElementById('from');
  const to = document.getElementById('to');
  fetch(`/transit-directions/${from.value}/${to.value}`)
    .then(response => response.json())
    .then((data) => {
      if (data.status == "OK"){
      const transit = data
      const transitTime = transit.routes[0].legs[0].duration
      timeResults.push(transitTime.value);
      timeText.push(transitTime.text);
      const route = transit.routes[0].legs[0].steps
      const lines = []
      for (element of route) {
        if (element.travel_mode == "TRANSIT") {
          lines.push(element.transit_details.line.short_name)
        }
      };
      // calls delays function to check if reported delays on any routes being used
      delays(lines)
      // calls next function - air quality
      airQuality()
    } else {
    document.getElementById("top-banner").style.backgroundImage = "linear-gradient( rgba(192, 36, 0, 0.9), rgba(192, 36, 0, 0.9) ), url('../img/header.jpg')"
    document.getElementById("no-bike").innerHTML = "Sorry, we couldn't find a route, please try again?";
    document.getElementById("no-bike").style.display = "flex";
    }
    });

  }

// Looks up delays on the route using TFL API
const delays = (lines) => {
  fetch('https://api.tfl.gov.uk/line/mode/tube/disruption')
    .then(response => response.json())
    .then((data) => {
      for (element of lines) {
        let re = new RegExp(`${element}`);
        for (element of data) {
          if (re.test(element.description)) {
            serviceDelays.push(element.description)
            travelScore.push(1)
          }
        }
      }
      if (serviceDelays.length > 0) {
        document.getElementById("delays-text").innerHTML = "Delays have been reported on the following lines:"
        document.getElementById('delays-list').appendChild(makeUL(serviceDelays));
        document.getElementById("delays").style.boxShadow = "0 0 15px rgb(192 36 0 / 40%)"
      } else {
        document.getElementById("delays-text").innerHTML = "No delays have been reported on your route."
        document.getElementById("delays-list").style.display = "none"
        document.getElementById("delays").style.boxShadow = "0 0 15px rgb(36 197 81 / 40%)"
      }
    });
};

// makes UL for service delays
function makeUL(array) {
    // Create the list element:
    let list = document.createElement('ul');
    for(let i = 0; i < array.length; i++) {
        // Create the list item:
        let item = document.createElement('li');
        // Set its contents:
        item.appendChild(document.createTextNode(array[i]));
        // Add it to the list:
        list.appendChild(item);
    }

    // Finally, return the constructed list:
    return list;
}

// Grabs Air quality info from TFL api.
const airQuality = async () => {
  const api_url = '/airquality';
  const response = await fetch(api_url);
  const json = await response.json();
  const current = json.currentForecast[0].forecastBand
  if (current == "Low") {
    travelScore.push(1)
    document.getElementById("air-image").src = "../img/bike.jpg"
    document.getElementById("air-text").innerHTML = "Air pollutant levels are low, good for cycling."
    document.getElementById("air").style.boxShadow = "0 0 15px rgb(36 197 81 / 40%)"
  } else if (current == "Moderate") {
    travelScore.push(0)
    document.getElementById("air-image").src = "../img/fumes.jpg"
    document.getElementById("air-text").innerHTML = "Air pollutant levels are moderate."
    document.getElementById("air").style.boxShadow = "0 0 15px rgb(36 197 81 / 40%)"
  } else {
    travelScore.push(-2)
    document.getElementById("air-image").src = "../img/fumes.jpg"
    document.getElementById("air-text").innerHTML = "Air pollutant levels are high, get the tube."
    document.getElementById("air").style.boxShadow = "0 0 15px rgb(192 36 0 / 40%)"
  }
  // calls weather data for day
  weatherData()
};

// Gets weather data from open weather api
const weatherData = async () => {
  const api_url = '/weather'
  const response = await fetch(api_url);
  const json = await response.json()
    .then((data) => {
       const temp = data.main.feels_like
      // temperature
      if (temp < 2) {
        travelScore.push(-1)
        document.getElementById("temp-image").src = "../img/cold-outside.png"
        document.getElementById("temp-text").innerHTML = `It's about ${temp.toFixed(0)} degress C outside, very cold! Wrap up warm and watch for ice.`
        document.getElementById("temp").style.boxShadow = "0 0 15px rgb(192 36 0 / 40%)"
      } else if (temp > 30) {
        travelScore.push(-1)
        document.getElementById("temp-image").src = "../img/hot-outside.png"
        document.getElementById("temp-text").innerHTML = `It's about ${temp.toFixed(0)} degress C outside, very warm! Take plenty of water.`
        document.getElementById("temp").style.boxShadow = "0 0 15px rgb(192 36 0 / 40%)"
      } else {
        travelScore.push(0)
        document.getElementById("temp-image").src = "../img/bike.jpg"
        document.getElementById("temp-text").innerHTML = `It's about ${temp.toFixed(0)} degress C outside, a good temperature for cycling.`
        document.getElementById("temp").style.boxShadow = "0 0 15px rgb(36 197 81 / 40%)"
      }
      // wind
      wind = data.wind.speed
      if (wind > 10.8 && wind < 13.9) {
        travelScore.push(-1)
        document.getElementById("wind-image").src = "../img/not-windy.jpg"
        document.getElementById("wind").style.boxShadow = "0 0 15px rgb(192 36 0 / 40%)"
        document.getElementById("wind-text").innerHTML = "It's quite windy, enjoy the Dutch hills!"
      } else if (wind > 13.8 && wind < 17.2) {
        travelScore.push(-2)
        document.getElementById("wind-image").src = "../img/windy.jpeg"
        document.getElementById("wind").style.boxShadow = "0 0 15px rgb(192 36 0 / 40%)"
        document.getElementById("wind-text").innerHTML = "It's very windy, watch out for cross winds!"
      } else if (wind > 17.1 && wind < 24.5) {
        travelScore.push(-3)
        document.getElementById("wind-image").src = "../img/windy.jpeg"
        document.getElementById("wind").style.boxShadow = "0 0 15px rgb(192 36 0 / 40%)"
        document.getElementById("wind-text").innerHTML = "It's extremely windy, get the tube."
      } else if (wind > 24.4) {
        travelScore.push(-10)
        document.getElementById("wind-image").src = "../img/windy.jpeg"
        document.getElementById("wind").style.boxShadow = "0 0 15px rgb(192 36 0 / 40%)"
        document.getElementById("wind-text").innerHTML = "It's extremely windy, just stay indoors!!"
      } else {
        travelScore.push(0)
        document.getElementById("wind-image").src = "../img/not-windy.jpg"
        document.getElementById("wind-text").innerHTML = "It's not particularly windy, so no Dutch hills to climb!"
        document.getElementById("wind").style.boxShadow = "0 0 15px rgb(36 197 81 / 40%)"
      }
      // rain
      rainChance = data.weather[0].main
      icon = data.weather[0].icon
      document.getElementById("rain-image").src = `http://openweathermap.org/img/wn/${icon}@2x.png`
      if (rainChance == "Drizzle") {
        travelScore.push(-1)
        document.getElementById("rain-text").innerHTML = `The weather forecast is for ${data.weather[0].description}. So you may get wet`
        document.getElementById("rain").style.boxShadow = "0 0 15px rgb(192 36 0 / 40%)"
      } else if (rainChance == "Rain") {
        travelScore.push(-2)
        document.getElementById("rain-text").innerHTML = `The weather forecast is for ${data.weather[0].description}. So you will probably get wet`
        document.getElementById("rain").style.boxShadow = "0 0 15px rgb(192 36 0 / 40%)"
      } else if (rainChance == "Snow") {
        travelScore.push(-10)
        document.getElementById("rain-text").innerHTML = `The weather forecast is for ${data.weather[0].description}. So get the tube, if it's running!`
        document.getElementById("rain").style.boxShadow = "0 0 15px rgb(192 36 0 / 40%)"
      } else if (rainChance == "Thunderstorm"){
        travelScore.push(-5)
        document.getElementById("rain-text").innerHTML = `The weather forecast is for ${data.weather[0].description}. So get the tube!`
        document.getElementById("rain").style.boxShadow = "0 0 15px rgb(192 36 0 / 40%)"
      } else {
        travelScore.push(0)
        document.getElementById("rain-text").innerHTML = `The weather forecast is for ${data.weather[0].description}. So you're probably good to cycle.`
        document.getElementById("rain").style.boxShadow = "0 0 15px rgb(36 197 81 / 40%)"
      }
      // visibility
      visibility = data.visibility
      if (visibility < 101) {
        travelScore.push(-10)
        document.getElementById("visibility-text").innerHTML = "<b>Visibility is currently zero, stay indoors.</b>"
      } else if (visibility > 100 && visibility < 1000) {
        travelScore.push(-5)
        document.getElementById("visibility-text").innerHTML = "<b>Visibility is currently very poor.</b>"
      } else if (visibility > 999 && visibility < 3704) {
        travelScore.push(-1)
        document.getElementById("visibility-text").innerHTML = "<b>Visibility is currently quite poor.</b>"
      } else {
        travelScore.push(0)
        document.getElementById("visibility-text").innerHTML = "<b>Visibility is good.</b>"
      }
    });
  // calls next function
  fastest()
}

// work out if cycling or transit is fater
const fastest = () => {
  const speed = timeResults[0] - timeResults[1]
  console.log(speed)
  if (speed < 0) {
    travelScore.push(1)
    document.getElementById("speed-image").src = "../img/bike.jpg"
    document.getElementById("speed-text").innerHTML = `Cycling will take ${timeText[0]}, public transport will take ${timeText[1]}, so Cycling is faster.`
    document.getElementById("speed").style.boxShadow = "0 0 15px rgb(36 197 81 / 40%)"
  } else if (speed == 0) {
    travelScore.push(0)
    document.getElementById("speed-image").src = "../img/bike.jpg"
    document.getElementById("speed-text").innerHTML = `Both cycling and the tube will take roughly ${timeText[0]}.`
    document.getElementById("speed").style.boxShadow = "0 0 15px rgb(36 197 81 / 40%)"
  } else if (speed > 0 && speed < 450) {
    travelScore.push(-1)
    document.getElementById("speed-image").src = "../img/bike.jpg"
    document.getElementById("speed-text").innerHTML = `Cycling will take ${timeText[0]}, public transport will take ${timeText[1]}, so Public Transport is a bit faster.`
    document.getElementById("speed").style.boxShadow = "0 0 15px rgb(192 36 0 / 40%)"
  }
  else {
    travelScore.push(-2)
    document.getElementById("speed-image").src = "../img/underground.png"
    document.getElementById("speed-text").innerHTML = `Cycling will take ${timeText[0]}, public transport will take ${timeText[1]}, so Public Transport is much faster.`
    document.getElementById("speed").style.boxShadow = "0 0 15px rgb(192 36 0 / 40%)"
  }
  // calls function to work out score of all functions
  travelSum()
}

// sum results from travelscore array
const travelSum = () => {
  console.log(travelScore)
  for(let i = 0; i < travelScore.length; i++)
  {
    count = count + travelScore[i];
  }
  if (count < 0) {
    document.getElementById("top-banner").style.backgroundImage = "linear-gradient( rgba(192, 36, 0, 0.9), rgba(192, 36, 0, 0.9) ), url('../img/header.jpg')"
    document.getElementById("no-bike").style.display = "flex";
  } else {
    document.getElementById("top-banner").style.backgroundImage= "linear-gradient( rgba(36, 197, 81, 0.9), rgba(36, 197, 81, 0.9) ), url('../img/header.jpg')"
    document.getElementById("yes-bike").style.display = "flex";
  }
  loader.style.display = "none";
  document.getElementById("content").style.display = "flex";
  document.getElementById("find-more").style.display = "block";
}


form.addEventListener('submit', (event) => {
  event.preventDefault();
  document.getElementById("yes-bike").style.display = "none";
  document.getElementById("no-bike").style.display = "none";
  serviceDelays.length = 0
  timeResults.length = 0
  timeText.length = 0
  travelScore.length = 0
  cycleDirections();
});

seeRoute.addEventListener('click', (event) => {
  initMap()
  calcRoute(count)
});
