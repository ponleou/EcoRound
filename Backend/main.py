import openrouteservice as ors
from openrouteservice.exceptions import ApiError
import requests
from werkzeug.exceptions import NotFound
import os
from dotenv import load_dotenv  # type: ignore
from flask import Flask, jsonify, request  # type: ignore
from flask_cors import CORS
from polyline import decode
from datetime import datetime
from tzlocal import get_localzone  # To get the server's local timezone

load_dotenv()

API_KEY = os.getenv("ORS_API_KEY")
OTP_SERVER = os.getenv("OTP_SERVER")
CLIENT = ors.Client(API_KEY)

OTP_URL = f"http://{OTP_SERVER}/otp/gtfs/v1"

app = Flask(__name__)
CORS(app)

# emission factors
carEF = 0.137
walkEF = 0.053
mikrotransEF = 0.0347
busEF = 0.0385


# function to query OTP server for route
def query_otp_route(slat, slon, dlat, dlon, mode, date=None, time=None, is_arrival=False):
    graphql_query = {
        "query": """
        query plan(
        $fromLat: Float!, 
        $fromLon: Float!, 
        $toLat: Float!, 
        $toLon: Float!,
        $mode: Mode!
        $time: String
        $date: String
        $arriveBy: Boolean!
        ) {
        plan(
            from: {lat: $fromLat, lon: $fromLon}
            to: {lat: $toLat, lon: $toLon}
            transportModes: {mode: $mode}
            time: $time
            date: $date
            arriveBy: $arriveBy
        ) {
            itineraries {
                start
                end
                legs {
                    start {
                        scheduledTime
                    }
                    end {
                        scheduledTime
                    }
                    transitLeg
                    duration
                    distance
                    mode
                    trip {
                      routeShortName
                      tripHeadsign
                    }
                    from {
                        stop {
                            name
                        }
                    }
                    to {
                        stop {
                            name
                        }
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
            "mode": mode,
            "arriveBy": is_arrival,
            "date": date,
            "time": time,
        },
    }

    headers = {
        "Content-Type": "application/json",
        "OTPTimeout": "180000",  # Timeout in milliseconds
    }

    response = requests.post(OTP_URL, headers=headers, json=graphql_query)
    response.raise_for_status()

    response_json = response.json()

    # Check if the response contains any errors
    if "errors" in response_json:
        # Loop through all errors to check their classification
        for error in response_json["errors"]:
            classification = error.get("extensions", {}).get("classification")
            message = error.get("message")

            raise ValueError(classification + ": " + message)

    # Filter out non-transit routes
    if mode == "TRANSIT":
        response_json["data"]["plan"]["itineraries"] = [
            itinerary
            for itinerary in response_json["data"]["plan"]["itineraries"]
            if any(leg["transitLeg"] for leg in itinerary["legs"])
        ]

    if len(response_json["data"]["plan"]["itineraries"]) < 1:
        raise NotFound("No routes found")

    return response_json


# function to fetch route from ORS
def fetch_route(slat, slon, dlat, dlon, profile):
    coordinates = [[float(slon), float(slat)], [float(dlon), float(dlat)]]
    route = CLIENT.directions(
        coordinates=coordinates, profile=profile, format="geojson"
    )

    return route


# function to generate step instruction (from OTP steps response)
def step_instruction(direction, street, bogus_name, absolute_direction):
    instruction = ""

    if direction.lower() == "depart":
        instruction = (
            "Head "
            + absolute_direction.title().replace("_", " ")
            + ("" if bogus_name else " on " + street)
        )
        return instruction

    if direction.lower() == "continue":
        instruction = "Continue straight " + (
            "to " + absolute_direction.title().replace("_", " ")
            if bogus_name
            else "on " + street
        )
        return instruction

    if "uturn" in direction.lower():
        instruction = direction.title().replace("_", " ") + (
            " to " + absolute_direction.title().replace("_", " ")
            if bogus_name
            else " onto " + street
        )
        return instruction

    instruction = (
        "Turn "
        + direction.lower().replace("_", " ")
        + ("" if bogus_name else " onto " + street)
    )
    return instruction


@app.get("/api/transit-route")
def transit_route():
    slat = request.args.get("slat")
    slon = request.args.get("slon")
    dlat = request.args.get("dlat")
    dlon = request.args.get("dlon")
    datetime = request.args.get("datetime")

    is_arrival = False
    if request.args.get("isarrival") == "1":
        is_arrival = True

    date = datetime.split("T")[0]
    time = datetime.split("T")[1]

    routes = query_otp_route(slat, slon, dlat, dlon, "TRANSIT", date, time, is_arrival)

    response = {"routes": []}

    route_itineraries = routes["data"]["plan"]["itineraries"]
    for route in route_itineraries:
        total_distance = 0
        total_duration = 0
        emission = 0
        segments = []

        for leg in route["legs"]:
            total_distance += leg["distance"]
            total_duration += leg["duration"]

            estimate_speed = leg["distance"] / leg["duration"]

            # Calculate emission factor based on transit type
            if leg["transitLeg"]:
                # Determine if it's a mikrolet or bus
                if leg["trip"] and "jak" in leg["trip"]["routeShortName"].lower():
                    leg_emission = leg["distance"] / 1000 * mikrotransEF
                else:
                    leg_emission = leg["distance"] / 1000 * busEF
            else:
                leg_emission = leg["distance"] / 1000 * walkEF
            
            # Add to total emission
            emission += leg_emission

            segment = {
                "start": {
                    "date": leg["start"]["scheduledTime"].split("T")[0],
                    "time": leg["start"]["scheduledTime"].split("T")[1],
                },
                "end": {
                    "date": leg["end"]["scheduledTime"].split("T")[0],
                    "time": leg["end"]["scheduledTime"].split("T")[1],
                },
                "path": decode(leg["legGeometry"]["points"]),
                "distance": leg["distance"],
                "duration": leg["duration"],
                "mode": leg["mode"],
                "transitSegment": leg["transitLeg"],
                "transitNames": (
                    {}
                    if not leg["trip"]
                    else {
                        "headsign": leg["trip"]["tripHeadsign"],
                        "code": leg["trip"]["routeShortName"],
                    }
                ),
                "stops": {
                    "startStop": (
                        "" if not leg["from"]["stop"] else leg["from"]["stop"]["name"]
                    ),
                    "endStop": (
                        "" if not leg["to"]["stop"] else leg["to"]["stop"]["name"]
                    ),
                    "middleStops": (
                        [stop["name"] for stop in leg["intermediateStops"]]
                        if leg["transitLeg"]
                        else []
                    ),
                },
                "steps": [
                    {
                        "distance": step["distance"],
                        "duration": round(step["distance"] / estimate_speed),
                        "name": "-" if step["bogusName"] else step["streetName"],
                        "instruction": step_instruction(
                            step["relativeDirection"],
                            step["streetName"],
                            step["bogusName"],
                            step["absoluteDirection"],
                        ),
                    }
                    for step in leg["steps"]
                ],
            }

            segments.append(segment)

        # Append route to response
        response["routes"].append(
            {
                "distance": round(total_distance, 2),
                "duration": round(total_duration),
                "segments": segments,
                "emission": emission,
                "start": {
                    "date": route["start"].split("T")[0],
                    "time": route["start"].split("T")[1],
                },
                "end": {
                    "date": route["end"].split("T")[0],
                    "time": route["end"].split("T")[1],
                },
            }
        )

    return jsonify(response)


@app.get("/api/walk-route")
def walk_route():
    response = None

    try:
        otp_routes = query_otp_route(
            request.args.get("slat"),
            request.args.get("slon"),
            request.args.get("dlat"),
            request.args.get("dlon"),
            "WALK",
        )

        otp_route = otp_routes["data"]["plan"]["itineraries"][0]["legs"][0]
        response = {
            "path": decode(otp_route["legGeometry"]["points"]),
            "distance": otp_route["distance"],
            "duration": otp_route["duration"],
            "steps": [
                {
                    "distance": step["distance"],
                    "duration": round(
                        step["distance"] / (otp_route["duration"] / otp_route["distance"])
                    ),
                    "name": "-" if step["bogusName"] else step["streetName"],
                    "instruction": step_instruction(
                        step["relativeDirection"],
                        step["streetName"],
                        step["bogusName"],
                        step["absoluteDirection"],
                    ),
                }
                for step in otp_route["steps"]
            ],
            "emission": otp_route["distance"] / 1000 * walkEF,
        }
    except Exception:
        # fallback to ORS if OTP got nothing
        route = fetch_route(
            request.args.get("slat"),
            request.args.get("slon"),
            request.args.get("dlat"),
            request.args.get("dlon"),
            "foot-walking",
        )
        response = {
            "path": [
                [coord[1], coord[0]]
                for coord in route["features"][0]["geometry"]["coordinates"]
            ],
            "distance": route["features"][0]["properties"]["segments"][0]["distance"],
            "duration": route["features"][0]["properties"]["segments"][0]["duration"],
            "steps": route["features"][0]["properties"]["segments"][0]["steps"],
            "emission": route["features"][0]["properties"]["segments"][0]["distance"]
            / 1000
            * walkEF,
        }

    return jsonify(response)


@app.get("/api/bike-route")
def bike_route():
    response = None

    try:
        otp_routes = query_otp_route(
            request.args.get("slat"),
            request.args.get("slon"),
            request.args.get("dlat"),
            request.args.get("dlon"),
            "BICYCLE",
        )

        otp_route = otp_routes["data"]["plan"]["itineraries"][0]["legs"][0]
        response = {
            "path": decode(otp_route["legGeometry"]["points"]),
            "distance": otp_route["distance"],
            "duration": otp_route["duration"],
            "steps": [
                {
                    "distance": step["distance"],
                    "duration": round(
                        step["distance"] / (otp_route["duration"] / otp_route["distance"])
                    ),
                    "name": "-" if step["bogusName"] else step["streetName"],
                    "instruction": step_instruction(
                        step["relativeDirection"],
                        step["streetName"],
                        step["bogusName"],
                        step["absoluteDirection"],
                    ),
                }
                for step in otp_route["steps"]
            ],
            "emission": otp_route["distance"] / 1000 * walkEF,
        }
    except Exception:
        # fallback to ORS if OTP got nothing
        route = fetch_route(
            request.args.get("slat"),
            request.args.get("slon"),
            request.args.get("dlat"),
            request.args.get("dlon"),
            "cycling-regular",
        )
        response = {
            "path": [
                [coord[1], coord[0]]
                for coord in route["features"][0]["geometry"]["coordinates"]
            ],
            "distance": route["features"][0]["properties"]["segments"][0]["distance"],
            "duration": route["features"][0]["properties"]["segments"][0]["duration"],
            "steps": route["features"][0]["properties"]["segments"][0]["steps"],
            "emission": route["features"][0]["properties"]["segments"][0]["distance"]
            / 1000
            * walkEF,
        }

    return jsonify(response)


@app.get("/api/car-route")
def car_route():
    response = None

    try:
        otp_routes = query_otp_route(
            request.args.get("slat"),
            request.args.get("slon"),
            request.args.get("dlat"),
            request.args.get("dlon"),
            "CAR",
        )

        otp_route = otp_routes["data"]["plan"]["itineraries"][0]["legs"][0]
        response = {
            "path": decode(otp_route["legGeometry"]["points"]),
            "distance": otp_route["distance"],
            "duration": otp_route["duration"],
            "steps": [
                {
                    "distance": step["distance"],
                    "duration": round(
                        step["distance"] / (otp_route["duration"] / otp_route["distance"])
                    ),
                    "name": "-" if step["bogusName"] else step["streetName"],
                    "instruction": step_instruction(
                        step["relativeDirection"],
                        step["streetName"],
                        step["bogusName"],
                        step["absoluteDirection"],
                    ),
                }
                for step in otp_route["steps"]
            ],
            "emission": otp_route["distance"] / 1000 * carEF,
        }
    except Exception:
        # fallback to ORS if OTP got nothing
        route = fetch_route(
            request.args.get("slat"),
            request.args.get("slon"),
            request.args.get("dlat"),
            request.args.get("dlon"),
            "driving-car",
        )
        response = {
            "path": [
                [coord[1], coord[0]]
                for coord in route["features"][0]["geometry"]["coordinates"]
            ],
            "distance": route["features"][0]["properties"]["segments"][0]["distance"],
            "duration": route["features"][0]["properties"]["segments"][0]["duration"],
            "steps": route["features"][0]["properties"]["segments"][0]["steps"],
            "emission": route["features"][0]["properties"]["segments"][0]["distance"]
            / 1000
            * carEF,
        }

    return jsonify(response)


@app.get("/api/points_calculation")
def points_calculation():
    base = request.args.get("base")
    value = request.args.get("value")

    points = (
        0 if float(base) - float(value) < 0 else (float(base) - float(value)) * 1000
    )

    return jsonify({"points": points})


@app.get("/api/place_name")
def place():
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    coordinate = [float(lon), float(lat)]
    place = CLIENT.pelias_reverse(coordinate)

    response = {"name": place["features"][0]["properties"]["label"]}

    return jsonify(response)


@app.get("/api/find_place")
def find_place():
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


# Jakarta bounding box
JAKARTA_BOUNDING_BOX = {
    "min_lat": -6.379377,
    "max_lat": -6.06743,
    "min_lon": 106.670417,
    "max_lon": 106.979407,
}


def is_in_jakarta(lat, lng):
    return (
        JAKARTA_BOUNDING_BOX["min_lat"] <= lat <= JAKARTA_BOUNDING_BOX["max_lat"]
        and JAKARTA_BOUNDING_BOX["min_lon"] <= lng <= JAKARTA_BOUNDING_BOX["max_lon"]
    )


@app.get("/api/check_valid_coords")
def check_valid_coords():
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    if is_in_jakarta(lat, lon):
        return jsonify({"message": "Location is within Jakarta"}), 200
    else:
        raise ValueError("Location/region is not supported")


# For development
@app.get("/api/verify")
def verify():
    return jsonify({"verify": True, "message": "Request completed"}), 200


@app.errorhandler(ApiError)
def ors_api_error(error):
    return jsonify(error.args[1]), error.status


@app.errorhandler(NotFound)
def not_found_error(error):
    response = {
        "message": str(error),
    }

    return jsonify(response), 404


@app.errorhandler(ValueError)
def value_error(error):
    response = {
        "message": str(error),
    }

    return jsonify(response), 400


@app.errorhandler(Exception)
def exception_error(error):
    response = {
        "message": str(error),
    }

    return jsonify(response), 500
