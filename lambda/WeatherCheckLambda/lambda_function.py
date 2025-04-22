import json
import boto3
import requests
import os

RAPIDAPI_KEY = os.environ['RAPIDAPI_KEY']
RAPIDAPI_HOST = "aerodatabox.p.rapidapi.com"
OPENWEATHER_KEY = os.environ['OPENWEATHER_KEY']

fallback_coords = {
    "ATL": {"lat": 33.6407, "lon": -84.4277},
    "DFW": {"lat": 32.8998, "lon": -97.0403},
    "DEN": {"lat": 39.8561, "lon": -104.6737},
    "LAX": {"lat": 33.9416, "lon": -118.4085},
    "ORD": {"lat": 41.9742, "lon": -87.9073},
    "JFK": {"lat": 40.6413, "lon": -73.7781},
    "MCO": {"lat": 28.4312, "lon": -81.3081},
    "LAS": {"lat": 36.0840, "lon": -115.1537},
    "CLT": {"lat": 35.2140, "lon": -80.9431},
    "MIA": {"lat": 25.7959, "lon": -80.2870},
    "SEA": {"lat": 47.4502, "lon": -122.3088},
    "SFO": {"lat": 37.6213, "lon": -122.3790},
    "EWR": {"lat": 40.6895, "lon": -74.1745},
    "PHX": {"lat": 33.4342, "lon": -112.0116},
    "IAH": {"lat": 29.9902, "lon": -95.3368},
    "BOS": {"lat": 42.3656, "lon": -71.0096},
    "FLL": {"lat": 26.0726, "lon": -80.1527},
    "MSP": {"lat": 44.8848, "lon": -93.2223},
    "DTW": {"lat": 42.2124, "lon": -83.3534},
    "PHL": {"lat": 39.8744, "lon": -75.2424},
    "SLC": {"lat": 40.7899, "lon": -111.9791},
    "LGA": {"lat": 40.7769, "lon": -73.8740},
    "BWI": {"lat": 39.1754, "lon": -76.6684},
    "DCA": {"lat": 38.8512, "lon": -77.0402},
    "IAD": {"lat": 38.9531, "lon": -77.4565},
    "SAN": {"lat": 32.7338, "lon": -117.1933},
    "FAT": {"lat": 36.7762, "lon": -119.7181}
}

def lambda_handler(event, context):
    phone = event.get("phone_number")
    flight_number = event.get("flight_number")

    aero_url = f"https://{RAPIDAPI_HOST}/flights/number/{flight_number}"

    try:
        flight_res = requests.get(aero_url, headers={
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": RAPIDAPI_HOST
        })
        flight_data = flight_res.json()

        if not isinstance(flight_data, list) or not flight_data:
            raise Exception("Flight data not found")

        matched_flight = flight_data[0]
        dep = matched_flight["departure"]
        arr = matched_flight["arrival"]

        def get_coords(airport):
            pos = airport.get("position")
            if pos and "lat" in pos and "lon" in pos:
                return pos
            return fallback_coords.get(airport.get("iata"))

        def get_weather(coords):
            if not coords:
                return None
            lat, lon = coords["lat"], coords["lon"]
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_KEY}&units=imperial"
            return requests.get(url).json()

        dep_coords = get_coords(dep["airport"])
        arr_coords = get_coords(arr["airport"])
        dep_weather = get_weather(dep_coords)
        arr_weather = get_weather(arr_coords)

        dep_summary = f"{dep['airport'].get('iata', 'Unknown')} at {dep['scheduledTime'].get('local', 'Unknown')}"
        arr_summary = f"{arr['airport'].get('iata', 'Unknown')} at {arr['scheduledTime'].get('local', 'Unknown')}"
        dep_conditions = dep_weather["weather"][0]["description"] if dep_weather.get("weather") else "Unavailable"
        arr_conditions = arr_weather["weather"][0]["description"] if arr_weather.get("weather") else "Unavailable"

        message = (
            f"Weather update for flight {flight_number}:\n"
            f"Departure: {dep_summary} – {dep_conditions}\n"
            f"Arrival: {arr_summary} – {arr_conditions}\n"
            f"✈️ We'll notify you if anything changes."
        )

        # Send via SNS
        sns = boto3.client("sns")
        sns.publish(
            Message=message,
            PhoneNumber=phone
        )

        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Weather alert sent"})
        }

    except Exception as e:
        print("ERROR:", e)
        return {
            "statusCode": 400,
            "body": json.dumps({"error": str(e)})
        }
