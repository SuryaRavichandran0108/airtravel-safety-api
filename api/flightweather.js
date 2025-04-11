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
    // Step 1: Get flight info from AeroDataBox (no date version)
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

   const getWeather = async (coords, label) => {
  console.log(`${label} coords:`, coords); // this will help us see logs in Vercel
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${OPENWEATHER_KEY}&units=imperial`;
  const response = await fetch(url);
  return await response.json();
};

// Force logging of coordinates before trying to fetch weather
if (dep.airport.position) {
  console.log("Departure coords:", dep.airport.position);
}
if (arr.airport.position) {
  console.log("Arrival coords:", arr.airport.position);
}

const depWeather = dep.airport.position
  ? await getWeather({
      lat: dep.airport.position.latitude,
      lon: dep.airport.position.longitude
    }, "Departure")
  : null;

const arrWeather = arr.airport.position
  ? await getWeather({
      lat: arr.airport.position.latitude,
      lon: arr.airport.position.longitude
    }, "Arrival")
  : null;


   res.status(200).json({
  flight: flightNumber.toUpperCase(),
  departure: {
    airport: dep.airport.name,
    iata: dep.airport.iata,
    scheduledTime: dep.scheduledTimeLocal,
    coords: dep.airport.position,
    weather: depWeather?.weather ? depWeather.weather[0].description : "Unavailable"
  },
  arrival: {
    airport: arr.airport.name,
    iata: arr.airport.iata,
    scheduledTime: arr.scheduledTimeLocal,
    coords: arr.airport.position,
    weather: arrWeather?.weather ? arrWeather.weather[0].description : "Unavailable"
  }
});


  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: "Internal server error. Try again later." });
  }
};
