const fetch = require('node-fetch');

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'aerodatabox.p.rapidapi.com';
const OPENWEATHER_KEY = process.env.OPENWEATHER_KEY;

const airportCoordsFallback = {
  ATL: { lat: 33.6407, lon: -84.4277 },
  DFW: { lat: 32.8998, lon: -97.0403 },
  DEN: { lat: 39.8561, lon: -104.6737 },
  LAX: { lat: 33.9416, lon: -118.4085 },
  ORD: { lat: 41.9742, lon: -87.9073 },
  JFK: { lat: 40.6413, lon: -73.7781 },
  MCO: { lat: 28.4312, lon: -81.3081 },
  LAS: { lat: 36.0840, lon: -115.1537 },
  CLT: { lat: 35.2140, lon: -80.9431 },
  MIA: { lat: 25.7959, lon: -80.2870 },
  SEA: { lat: 47.4502, lon: -122.3088 },
  SFO: { lat: 37.6213, lon: -122.3790 },
  EWR: { lat: 40.6895, lon: -74.1745 },
  PHX: { lat: 33.4342, lon: -112.0116 },
  IAH: { lat: 29.9902, lon: -95.3368 },
  BOS: { lat: 42.3656, lon: -71.0096 },
  FLL: { lat: 26.0726, lon: -80.1527 },
  MSP: { lat: 44.8848, lon: -93.2223 },
  DTW: { lat: 42.2124, lon: -83.3534 },
  PHL: { lat: 39.8744, lon: -75.2424 },
  SLC: { lat: 40.7899, lon: -111.9791 },
  LGA: { lat: 40.7769, lon: -73.8740 },
  BWI: { lat: 39.1754, lon: -76.6684 },
  DCA: { lat: 38.8512, lon: -77.0402 },
  IAD: { lat: 38.9531, lon: -77.4565 },
  SAN: { lat: 32.7338, lon: -117.1933 },
  FAT: { lat: 36.7762, lon: -119.7181 }
};

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

    const getCoords = (airport) => {
      if (airport?.position) return airport.position;
      return airportCoordsFallback[airport?.iata] || null;
    };

    const getWeather = async (coords) => {
      if (!coords || !coords.lat || !coords.lon) return null;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${OPENWEATHER_KEY}&units=imperial`;
      const response = await fetch(url);
      return await response.json();
    };

    const depCoords = getCoords(dep.airport);
    const arrCoords = getCoords(arr.airport);

    const depWeather = await getWeather(depCoords);
    const arrWeather = await getWeather(arrCoords);

    console.log("🛫 Departure Object:", JSON.stringify(dep, null, 2));
    console.log("🛬 Arrival Object:", JSON.stringify(arr, null, 2));

    res.status(200).json({
      flight: flightNumber.toUpperCase(),
      departure: {
  airport: dep.airport.name,
  iata: dep.airport.iata,
  scheduledTime: dep.scheduledTimeLocal || dep.scheduledTimeUtc || "Unavailable",
  coords: depCoords || { lat: "unknown", lon: "unknown" },
  weather: depWeather?.weather ? depWeather.weather[0].description : "Unavailable",
  icon: depWeather?.weather ? depWeather.weather[0].icon : "01d"
},
      arrival: {
  airport: arr.airport.name,
  iata: arr.airport.iata,
  scheduledTime: arr.scheduledTimeLocal || arr.scheduledTimeUtc || "Unavailable",
  coords: arrCoords || { lat: "unknown", lon: "unknown" },
  weather: arrWeather?.weather ? arrWeather.weather[0].description : "Unavailable",
  icon: arrWeather?.weather ? arrWeather.weather[0].icon : "01d"
}
    });

  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: "Internal server error. Try again later." });
  }
};
