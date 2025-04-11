const fetch = require('node-fetch');

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'aerodatabox.p.rapidapi.com';
const OPENWEATHER_KEY = process.env.OPENWEATHER_KEY;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const flightNumber = req.query.flight;

  if (!flightNumber) {
    return res.status(400).json({ error: "Flight number is required. Example: ?flight=AA1234" });
  }

  try {
    // Step 1: Use the no-date endpoint for broader matching
    const aeroURL = `https://${RAPIDAPI_HOST}/flights/number/${flightNumber}`;
    
    const flightRes = await fetch(aeroURL, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    });

    const flightData = await flightRes.json();

    if (!Array.isArray(flightData) || flightData.length === 0) {
      return res.status(404).json({ error: "Flight data not found. Try a major airline and current flight." });
    }

    const matchedFlight = flightData[0];

    const dep = matchedFlight.departure;
    const arr = matchedFlight.arrival;

    const getWeather = async (iata) => {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${iata}&appid=${OPENWEATHER_KEY}&units=imperial`;
      const response = await fetch(url);
      return await response.json();
    };

    const depWeather = await getWeather(dep.airport.iata);
    const arrWeather = await getWeather(arr.airport.iata);

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
    res.status(500).json({ error: "Internal server error. Try again later." });
  }
};
