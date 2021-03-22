
const form = document.getElementById('form')
// stores descriptions of delays taken from TFL API in Delays function
const serviceDelays = []
// stores results of time estimate for each route (transit vs cycling)
const timeResults = []
// stores array of points scored calculated by results of each function
const travelScore = []


// Looks up cycle directions using Google JS API
const cycleDirections = () => {
  const from = document.getElementById('from');
  const to = document.getElementById('to');
  fetch(`/cycling-directions/${from.value}/${to.value}`)
    .then(response => response.json())
    .then((data) => {
      const bike = data
      const bikeTime = bike.routes[0].legs[0].duration
      const bikeDistance = bike.routes[0].legs[0].distance
      timeResults.push(bikeTime.value)
      // calls next function - transit
      transitDirections()
    });
};


// Looks up transit directions using Google JS API
const transitDirections = () => {
  const from = document.getElementById('from');
  const to = document.getElementById('to');
  fetch(`/transit-directions/${from.value}/${to.value}`)
    .then(response => response.json())
    .then((data) => {
      const transit = data
      const transitTime = transit.routes[0].legs[0].duration
      timeResults.push(transitTime.value);
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
    });
};

// Grabs Air quality info from TFL api.
const airQuality = async () => {
  const api_url = '/airquality';
  const response = await fetch(api_url);
  const json = await response.json();
  const current = json.currentForecast[0].forecastBand
  if (current == "Low") {
    travelScore.push(1)
  } else if (current == "Moderate") {
    travelScore.push(0)
  } else {
    travelScore.push(-1)
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
      console.log(data)
      // temperature
      if (data.main.feels_like < 2) {
        travelScore.push(-1)
      } else if (data.main.feels_like > 30) {
        travelScore.push(-1)
      } else {
        travelScore.push(0)
      }
      // wind
      wind = data.wind.speed
      if (wind > 10.8 && wind < 13.9) {
        travelScore.push(-1)
      } else if (wind > 13.8 && wind < 17.2) {
        travelScore.push(-2)
      } else if (wind > 17.1 && wind < 24.5) {
        travelScore.push(-3)
      } else if (wind > 24.4) {
        travelScore.push(-10)
      } else {
        travelScore.push(0)
      }
      // rain
      rainChance = data.weather[0].main
      if (rainChance == "Drizzle") {
        travelScore.push(-1)
      } else if (rainChance == "Rain") {
        travelScore.push(-2)
      } else if (rainChance == "Snow") {
        travelScore.push(-10)
      } else if (rainChance == "Thunderstorm"){
        travelScore.push(-5)
      } else {
        travelScore.push(0)
      }
      // visibility
      visibility = data.visibility
      if (visibility < 101) {
        travelScore.push(-10)
      } else if (visibility > 100 && visibility < 1000) {
        travelScore.push(-5)
      } else if (visibility > 999 && visibility < 3704) {
        travelScore.push(-1)
      } else {
        travelScore.push(0)
      }
    });
  // calls next function
  fastest()
}

// work out if cycling or transit is fater
const fastest = () => {
  const speed = timeResults[0] - timeResults[1]
  if (speed >= 0) {
    travelScore.push(1)
  } else {
    travelScore.push(-1)
  }
  // calls function to work out score of all functions
  console.log(speed)
  travelSum()
}

// sum results from travelscore array
const travelSum = () => {
  let count = 0;
  console.log(travelScore)
  for(let i = 0; i < travelScore.length; i++)
  {
    count = count + travelScore[i];
  }
  if (count < 0) {
    document.getElementById("top-banner").style.backgroundImage = "linear-gradient( rgba(192, 36, 0, 0.9), rgba(192, 36, 0, 0.9) ), url('../img/header.jpg')"
  } else {
    document.getElementById("top-banner").style.backgroundImage= "linear-gradient( rgba(36, 197, 81, 0.9), rgba(36, 197, 81, 0.9) ), url('../img/header.jpg')"
  }
  document.getElementById("content").style.display = "flex";
}


form.addEventListener('submit', (event) => {
  event.preventDefault();
  cycleDirections()
});
