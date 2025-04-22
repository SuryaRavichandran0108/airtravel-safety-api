# WeatherCheckLambda – Version 3

This Lambda function is triggered 12 hours before a user's scheduled flight and sends a personalized weather update via SMS.

## Features
- Automatically scheduled via EventBridge (12 hours before flight)
- Pulls real-time flight data from AeroDataBox API
- Pulls current weather from OpenWeatherMap API for both departure and arrival
- Translates conditions into friendly messages for user reassurance
- Sends SMS via AWS SNS
- Fallback coordinates for common U.S. airports
- Smart handling of last-minute (<12hr) submissions by triggering the Lambda immediately

## Example Message
Weather update for flight AA2025: Departure: JFK at 2025-04-23T14:30 – clear sky Looks like a smooth flight! ✈️
Arrival: DFW at 2025-04-23T17:30 – broken clouds Mild conditions expected. Nothing major in the forecast.


## Environment Variables
| Key               | Description                   |
|-------------------|-------------------------------|
| `RAPIDAPI_KEY`    | b6b4f745e5mshda6d2c5c5...  |
| `OPENWEATHER_KEY` | 981fd24ec0ab650fb48bcb...   |


