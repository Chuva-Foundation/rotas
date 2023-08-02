const { default: axios } = require('axios');
const { MAPBOX_USER_NAME, MAPBOX_ACCESS_TOKEN } = process.env;
const http_client = axios.create({
    baseURL: `https://api.mapbox.com/datasets/v1/${MAPBOX_USER_NAME}`,
    params: {
        'access_token': MAPBOX_ACCESS_TOKEN
    }
});

exports.http_client = http_client;
