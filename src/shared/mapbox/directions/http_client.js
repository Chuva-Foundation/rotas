const { default: axios } = require('axios');
const { MAPBOX_ACCESS_TOKEN } = process.env;
const http_client = axios.create({
  baseURL: 'https://api.mapbox.com/directions/v5/mapbox',
  params: {
    'geometries': 'geojson',
    'access_token': MAPBOX_ACCESS_TOKEN
  }
});

exports.http_client = http_client;
