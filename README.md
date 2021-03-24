# should_I_Cycle

See if your it's better to cycle to work or to see friends or whatever or get the tube. (this only works in London right now, see API below)

App built in Node JS, Javascript and EJS using following APIs:
- TFL unified for Delays and Air Quality
- Google maps for directions
- Open Weather Map for weather. 

# to_run_locally

- First run NPM install to install dependencies
- You will need to create API keys for Google Maps and open weather and save these keys to an ENV file, check names in app.js file (currently WEATHER_API_KEY and GOOGLE_API_KEY)
- open index.ejs and replace google maps API key on line 132 with your own (this one is protected)
- use NPM start to start sever locally
- navigate to localhost:5000 
