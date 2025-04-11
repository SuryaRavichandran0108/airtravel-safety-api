const fetch = require('node-fetch');

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'aerodatabox.p.rapidapi.com';
const OPENWEATHER_KEY = process.env.OPENWEATHER_KEY;

module.exports = async (req, res) => {
  const flightNumber = req.query.flight;

  if (!flightNumber) {
    return res.status(400).json({ error: "Flight number is required. Example: ?flight=AA1234" });
  }

  try {
    // Step 1: Get flight info from AeroDataBox
    const dateToday = new Date().toISOString().split('T')[0]; // format: YYYY-MM-DD
    const aeroURL = `https://${RAPIDAPI_HOST}/flights/number/${flightNumber}/${dateToday}`;
    
    const flightRes = await fetch(aeroURL, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    });

    const flightData = await flightRes.json();

    if (!flightData || !flightData.departure || !flightData.arrival) {
      return res.status(404).json({ error: "Flight data not found." });
    }

    const dep = flightData.departure;
    const arr = flightData.arrival;

    // Step 2: Get weather for departure and arrival airports
    const weather = async (iata) => {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${iata}&appid=${OPENWEATHER_KEY}&units=imperial`;
      const res = await fetch(url);
      return await res.json();
    };

    const depWeather = await weather(dep.airport.iata);
    const arrWeather = await weather(arr.airport.iata);

    // Step 3: Respond with combined info
    res.status(200).json({
      flight: flightNumber.toUpperCase(),
      departure: {
        airport: dep.airport.name,
        iata: dep.airport.iata,
        scheduledTime: dep.scheduledTimeLocal,
        weather: depWeather.weather ? depWeather.weather[0].description : "Unavailable"
      },
      arrival: {
        airport: arr.airport.name,
        iata: arr.airport.iata,
        scheduledTime: arr.scheduledTimeLocal,
        weather: arrWeather.weather ? arrWeather.weather[0].description : "Unavailable"
      }
    });
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};
