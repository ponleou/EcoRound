import openrouteservice as ors
from openrouteservice.exceptions import ApiError
from werkzeug.exceptions import NotFound
import os
from dotenv import load_dotenv # type: ignore
from flask import Flask, jsonify, request # type: ignore
from flask_cors import CORS

load_dotenv()

api_key = os.getenv("ORS_API_KEY")
client = ors.Client(api_key)

app = Flask(__name__)
CORS(app)

@app.get('/api/route')
def route():
    slat = request.args.get('slat')
    slon = request.args.get('slon')
    dlat = request.args.get('dlat')
    dlon = request.args.get('dlon')

    profile = request.args.get('profile')

    coordinates = [[float(slon), float(slat)],[float(dlon), float(dlat)]]
    route = client.directions(
        coordinates=coordinates,
        profile=profile,
        format='geojson'
    )

    return jsonify(route["features"][0])
    

@app.get('/api/place_name')
def place():
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    coordinate = [float(lon), float(lat)]
    place = client.pelias_reverse(coordinate)
    place_name = {"name": place["features"][0]["properties"]["label"]}

    return jsonify(place_name)

@app.get('/api/find_place')
def findPlace():
    search = request.args.get('search')
    place = client.pelias_search(text=search)

    return jsonify(place)

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
def valueError (error):
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