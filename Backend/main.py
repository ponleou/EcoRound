import openrouteservice as ors
import os
from dotenv import load_dotenv # type: ignore
from flask import Flask, jsonify, request # type: ignore
from flask_cors import CORS

load_dotenv()

api_key = os.getenv("ORS_API_KEY")
client = ors.Client(api_key)

app = Flask(__name__)
CORS(app)

# @app.route('/route')
# def route():
#     startCoords = request.args.get('startCoords')

#     route = client.directions(
#         coordinates=[[8.34234,48.23424],[8.34423,48.26424]],
#         profile='driving-car',
#         format='geojson'
#     )

#     return jsonify(route)

@app.get('/api/place_name')
def place():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    place = client.pelias_reverse([float(lon), float(lat)])

    place_name = {"name": place["features"][0]["properties"]["label"]}

    return jsonify(place_name)

# def main():
#     route = client.directions(
#         coordinates=[[8.34234,48.23424],[8.34423,48.26424]],
#         profile='driving-car',
#         format='geojson'
#     )

#     print(route)

# if __name__ == "__main__":
#     main()