
const form = document.getElementById('form')
// stores list of stations visited
// const stations = []
// stores descriptions of delays taken from TFL API in Delays function
const serviceDelays = []

// Looks up directions using Google JS API
const googleDirections = () => {
  const from = document.getElementById('from');
  const to = document.getElementById('to');
  // For cycling
  fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${from.value}&destination=${to.value}&mode=bicycling&key=${GOOGLE_API_KEY}`)
    .then(response => response.json())
    .then((data) => {
      const bike = data
      const bikeTime = bike.routes[0].legs[0].duration
      const bikeDistance = bike.routes[0].legs[0].distance
    });
  // on public transport
  fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${from.value}&destination=${to.value}&mode=transit&key=${GOOGLE_API_KEY}`)
    .then(response => response.json())
    .then((data) => {
      const transit = data
      const transitTime = transit.routes[0].legs[0].duration
      const route = transit.routes[0].legs[0].steps
      const lines = []
      for (element of route) {
        if (element.travel_mode == "TRANSIT") {
          lines.push(element.transit_details.line.short_name)
        }
      };
      delays(lines)
    });
};

// Looks up stations on the route
// const stationLookup = (stations) => {
//   for (element of stations) {
//   fetch(`https://api.tfl.gov.uk/Stoppoint/Search/${element}`)
//     .then(response => response.json())
//     .then((data) => {
//       console.log(data)
//     });
//   }
// };

// Looks up delays on the route using TFL API
const delays = (lines) => {
  fetch('https://api.tfl.gov.uk/line/mode/tube/disruption')
    .then(response => response.json())
    .then((data) => {
      console.log(data)
      for (element of lines) {
        let re = new RegExp(`${element}`);
        console.log(re)
        for (element of data) {
          if (re.test(element.description)) {
            serviceDelays.push(element.description)
            console.log(serviceDelays)
          }
        }
      }
    });
};

// Grabs Air quality info from TFL api.
const airQuality = () => {
  fetch('https://api.tfl.gov.uk/AirQuality/')
    .then(response => response.json())
    .then((data) => {
      const p = data.currentForecast[0].forecastBand;
    });
};

// Gets weather data from open weather api
const weatherData = () => {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=london&units=metric&appid=${WEATHER_API_KEY}`)
    .then(response => response.json())
    .then((data) => {
      // temperature
      if (data.main.feels_like < 2) {
        console.log("too cold")
      } else if (data.main.feels_like > 30) {
        console.log("too hot")
      } else {
        console.log("temp good")
      }
      // wind
      wind = data.wind.speed
      if (wind > 10.8 && wind < 13.9) {
        console.log("strong winds")
      } else if (wind > 13.8 && wind < 17.2) {
      console.log("Very Strong Winds")
    } else if (wind > 17.1 && wind < 24.5) {
      console.log("Gale Force Winds")
    } else if (wind > 24.4) {
      console.log("Full on Gale")
    } else
      console.log("Not too Windy")
      // rain

      // visibility
      // sunset
    });
}


form.addEventListener('submit', (event) => {
  event.preventDefault();
  googleDirections()
  airQuality()
  weatherData()
});




