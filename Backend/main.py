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
CLIENT = ors.Client(API_KEY)

OTP_URL = "http://localhost:8080/otp/gtfs/v1"

app = Flask(__name__)
CORS(app)

# emission factors
carEF = 0.137
walkEF = 0.053
mikrotransEF = 0.0347
busEF = 0.0385


# function to query OTP server for route
def queryOTPRoute(slat, slon, dlat, dlon, mode, date=None, time=None, isArrival=False):
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
            "arriveBy": isArrival,
            "date": date,
            "time": time,
        },
    }

    headers = {
        "Content-Type": "application/json",
        "OTPTimeout": "180000",  # Timeout in milliseconds
    }

    response = requests.post(OTP_URL, headers=headers, json=graphql_query).json()

    return response


# function to fetch route from ORS
def fetchRoute(slat, slon, dlat, dlon, profile):
    coordinates = [[float(slon), float(slat)], [float(dlon), float(dlat)]]
    route = CLIENT.directions(
        coordinates=coordinates, profile=profile, format="geojson"
    )

    return route


# function to generate step instruction (from OTP steps response)
def stepInstruction(direction, street, bogusName, absoluteDirection):
    instruction = ""

    if direction.lower() == "depart":
        instruction = (
            "Head "
            + absoluteDirection.title().replace("_", " ")
            + ("" if bogusName else " on " + street)
        )
        return instruction

    if direction.lower() == "continue":
        instruction = "Continue straight " + (
            "to " + absoluteDirection.title().replace("_", " ")
            if bogusName
            else "on " + street
        )
        return instruction

    if "uturn" in direction.lower():
        instruction = direction.title().replace("_", " ") + (
            " to " + absoluteDirection.title().replace("_", " ")
            if bogusName
            else " onto " + street
        )
        return instruction

    instruction = (
        "Turn "
        + direction.lower().replace("_", " ")
        + ("" if bogusName else " onto " + street)
    )
    return instruction


def toServerTimezone(datetime_str):
    # Parse the input datetime with offset (format: "YYYY-MM-DDTHH:MM:SS±HH:MM")
    naive_time = datetime.strptime(datetime_str, "%Y-%m-%dT%H:%M:%S%z")

    # Get the server's local timezone
    server_tz = get_localzone()
    server_time = naive_time.astimezone(server_tz)

    # Return the result in 'YYYY-MM-DDTHH:MM:SS' format
    return server_time.strftime("%Y-%m-%dT%H:%M:%S")


@app.get("/api/transit-route")
def transitRoute():
    slat = request.args.get("slat")
    slon = request.args.get("slon")
    dlat = request.args.get("dlat")
    dlon = request.args.get("dlon")
    datetime = request.args.get("datetime")
    isArrival = True if request.args.get("isarrival") == "1" else False

    datetime = toServerTimezone(datetime)
    date = datetime.split("T")[0]
    time = datetime.split("T")[1]

    routes = queryOTPRoute(slat, slon, dlat, dlon, "TRANSIT", date, time, isArrival)

    response = {"routes": []}

    for route in routes["data"]["plan"]["itineraries"]:
        totalDistance = 0
        totalDuration = 0
        emission = 0
        segments = []

        #  Check if the route is a transit route (which has at least one transit leg)
        isTransitRoute = False
        for leg in route["legs"]:
            if leg["transitLeg"]:
                isTransitRoute = True
                break
        # Skip if not a transit route
        if not isTransitRoute:
            continue

        for leg in route["legs"]:
            totalDistance += leg["distance"]
            totalDuration += leg["duration"]

            estSpeed = leg["distance"] / leg["duration"]

            emission += (
                (
                    leg["distance"] / 1000 * mikrotransEF
                    if "jak" in leg["trip"]["routeShortName"].lower()
                    else leg["distance"] / 1000 * busEF
                )
                if leg["transitLeg"]
                else leg["distance"] / 1000 * walkEF
            )

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
                        "duration": round(step["distance"] / estSpeed),
                        "name": "-" if step["bogusName"] else step["streetName"],
                        "instruction": stepInstruction(
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
                "distance": round(totalDistance, 2),
                "duration": round(totalDuration),
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

    # TODO: better error handling (put it as a function or route)
    if len(response["routes"]) < 1:
        return jsonify({"message": "No transit routes found"}), 404

    return jsonify(response)


@app.get("/api/walk-route")
def walkRoute():
    OTPRoutes = queryOTPRoute(
        request.args.get("slat"),
        request.args.get("slon"),
        request.args.get("dlat"),
        request.args.get("dlon"),
        "WALK",
    )["data"]["plan"]["itineraries"]
    response = None

    # check if OTP returned any routes
    if len(OTPRoutes) > 0:
        OTPRoute = OTPRoutes[0]["legs"][0]
        response = {
            "path": decode(OTPRoute["legGeometry"]["points"]),
            "distance": OTPRoute["distance"],
            "duration": OTPRoute["duration"],
            "steps": [
                {
                    "distance": step["distance"],
                    "duration": round(
                        step["distance"] / (OTPRoute["duration"] / OTPRoute["distance"])
                    ),
                    "name": "-" if step["bogusName"] else step["streetName"],
                    "instruction": stepInstruction(
                        step["relativeDirection"],
                        step["streetName"],
                        step["bogusName"],
                        step["absoluteDirection"],
                    ),
                }
                for step in OTPRoute["steps"]
            ],
            "emission": OTPRoute["distance"] / 1000 * walkEF,
        }
    # fallback to ORS if OTP got nothing
    else:
        route = fetchRoute(
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
def bikeRoute():
    route = fetchRoute(
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
def carRoute():
    route = fetchRoute(
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
def pointsCalculation():
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


# Jakarta bounding box
JAKARTA_BOUNDING_BOX = {
    "min_lat": -6.379377,
    "max_lat": -6.06743,
    "min_lon": 106.670417,
    "max_lon": 106.979407,
}


def isInJakarta(lat, lng):
    return (
        JAKARTA_BOUNDING_BOX["min_lat"] <= lat <= JAKARTA_BOUNDING_BOX["max_lat"]
        and JAKARTA_BOUNDING_BOX["min_lon"] <= lng <= JAKARTA_BOUNDING_BOX["max_lon"]
    )


@app.get("/api/check_valid_coords")
def checkValidCoords():
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    if isInJakarta(lat, lon):
        return jsonify({"message": "Location is within Jakarta"}), 200
    else:
        return jsonify({"message": "Location is outside Jakarta"}), 403


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
