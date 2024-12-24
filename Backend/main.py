import openrouteservice as ors
from openrouteservice.exceptions import ApiError
import requests
from werkzeug.exceptions import NotFound
import os
from dotenv import load_dotenv  # type: ignore
from flask import Flask, jsonify, request  # type: ignore
from flask_cors import CORS

load_dotenv()

API_KEY = os.getenv("ORS_API_KEY")
CLIENT = ors.Client(API_KEY)

OTP_URL = "http://localhost:8080/otp/gtfs/v1"

app = Flask(__name__)
CORS(app)

def fetchRoute(slat, slon, dlat, dlon, profile):
    coordinates = [[float(slon), float(slat)], [float(dlon), float(dlat)]]
    route = CLIENT.directions(
        coordinates=coordinates, profile=profile, format="geojson"
    )

    return route

def stepInstruction(direction, street, bogusName, absoluteDirection):
    instruction = ""

    if direction.lower() == "depart":
        instruction = "Head " + absoluteDirection.lower() + "" if bogusName else ("on " + street)
        return instruction


    if direction.lower() == "continue":
        instruction = "Continue straight " + ("to " + absoluteDirection.lower()) if bogusName else ("on " + street)
        return instruction
    
    if "uturn" in direction.lower():
        instruction = direction.title() + (" to " + absoluteDirection.lower()) if bogusName else (" onto " + street)
        return instruction

    instruction = "Turn " + direction.lower() + "" if bogusName else (" onto " + street)
    return instruction

def decode_polyline(encoded_polyline):
    # Initialize the list to store the decoded points
    decoded_points = []
    
    # Variables for current latitude and longitude
    index = 0
    lat = 0
    lon = 0

    while index < len(encoded_polyline):
        # Decode latitude
        shift = 0
        result = 0
        while True:
            byte = ord(encoded_polyline[index]) - 63
            index += 1
            result |= (byte & 0x1f) << shift
            shift += 5
            if byte < 0x20:
                break
        lat_change = ~(result & 1) + (result >> 1)
        lat += lat_change

        # Decode longitude
        shift = 0
        result = 0
        while True:
            byte = ord(encoded_polyline[index]) - 63
            index += 1
            result |= (byte & 0x1f) << shift
            shift += 5
            if byte < 0x20:
                break
        lon_change = ~(result & 1) + (result >> 1)
        lon += lon_change

        # Add the decoded point (latitude, longitude) to the list
        decoded_points.append([lat / 1E5, lon / 1E5])  # Convert to decimal and divide by 1E5

    return decoded_points


@app.get("/api/transit-route")
def transitRoute():
    slat = request.args.get("slat")
    slon = request.args.get("slon")
    dlat = request.args.get("dlat")
    dlon = request.args.get("dlon")

    graphql_query = {
        "query": """
        query plan(
        $fromLat: Float!, 
        $fromLon: Float!, 
        $toLat: Float!, 
        $toLon: Float!, 
        ) {
        plan(
            from: {lat: $fromLat, lon: $fromLon}
            to: {lat: $toLat, lon: $toLon}
            transportModes: {mode: TRANSIT}
        ) {
            itineraries {
            duration
            legs {
                transitLeg
                duration
                distance
                mode
                headsign
                from {
                name
                }
                to {
                name
                }
                intermediateStops {
                name
                }
                steps {
                distance
                relativeDirection
                absoluteDirection
                streetName
                bogusName
                }
                legGeometry {
                points
                }
            }
            }
        }
        }
        """,
        "variables": {
            "fromLat": float(slat),
            "fromLon": float(slon),
            "toLat": float(dlat),
            "toLon": float(dlon),
        }
    }

    headers = {
        "Content-Type": "application/json",
        "OTPTimeout": "180000"  # Timeout in milliseconds
    }

    response = requests.post(OTP_URL, headers=headers, json=graphql_query).json()
    print(decode_polyline(response['data']['plan']['itineraries'][0]['legs'][0]['legGeometry']['points']))

    return jsonify(response)


@app.get("/api/walk-route")
def walkRoute():
    route = fetchRoute(request.args.get("slat"), request.args.get("slon"), request.args.get("dlat"), request.args.get("dlon"), "foot-walking")

    response = {
        "path": [[coord[1], coord[0]] for coord in route["features"][0]["geometry"]["coordinates"]],
        "distance": route["features"][0]["properties"]["segments"][0]["distance"],
        "duration": route["features"][0]["properties"]["segments"][0]["duration"],
        "steps": route["features"][0]["properties"]["segments"][0]["steps"],
    }

    return jsonify(response)

@app.get("/api/bike-route")
def bikeRoute():
    route = fetchRoute(request.args.get("slat"), request.args.get("slon"), request.args.get("dlat"), request.args.get("dlon"), "cycling-regular")

    response = {
        "path": [[coord[1], coord[0]] for coord in route["features"][0]["geometry"]["coordinates"]],
        "distance": route["features"][0]["properties"]["segments"][0]["distance"],
        "duration": route["features"][0]["properties"]["segments"][0]["duration"],
        "steps": route["features"][0]["properties"]["segments"][0]["steps"],
    }

    return jsonify(response)

@app.get("/api/car-route")
def carRoute():
    route = fetchRoute(request.args.get("slat"), request.args.get("slon"), request.args.get("dlat"), request.args.get("dlon"), "driving-car")

    response = {
        "path": [[coord[1], coord[0]] for coord in route["features"][0]["geometry"]["coordinates"]],
        "distance": route["features"][0]["properties"]["segments"][0]["distance"],
        "duration": route["features"][0]["properties"]["segments"][0]["duration"],
        "steps": route["features"][0]["properties"]["segments"][0]["steps"],
    }

    return jsonify(response)


@app.get("/api/place_name")
def place():
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    coordinate = [float(lon), float(lat)]
    place = CLIENT.pelias_reverse(coordinate)

    response = {"name": place["features"][0]["properties"]["label"]}

    return jsonify(response)


@app.get("/api/find_place")
def findPlace():
    search = request.args.get("search")
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    place = CLIENT.pelias_search(
        text=search,
        circle_point=(float(lon), float(lat)),
        circle_radius=1000,
        validate=False,
        focus_point=(float(lon), float(lat)),
    )

    response = {
        "places": [],
    }

    for place in place["features"]:
        response["places"].append(
            {
                "name": place["properties"]["name"],
                "label": place["properties"]["label"],
                "lat": place["geometry"]["coordinates"][1],
                "lon": place["geometry"]["coordinates"][0],
            }
        )

    return jsonify(response)


@app.errorhandler(ApiError)
def orsApiError(error):
    return jsonify(error.args[1]), error.status


@app.errorhandler(NotFound)
def notFoundError(error):
    response = {
        "message": str(error),
    }

    return jsonify(response), error.code


@app.errorhandler(ValueError)
def valueError(error):
    response = {
        "message": str(error),
    }

    return jsonify(response), 400


@app.errorhandler(Exception)
def exceptionError(error):
    response = {
        "message": str(error),
    }

    return jsonify(response), 500
