
const { http_client } = require('./http_client');

const ROUTING_PROFILES = {
  walking: 'walking',
  driving: 'driving',
  driving_traffic: 'driving-traffic',
  cycling: 'cycling'
};

module.exports = {
  ROUTING_PROFILES,
  get: async (rounting_profile, coord1, coord2) => {
    const { data } = await http_client.get(
        `/${rounting_profile}/${coord1[0]},${coord1[1]};${coord2[0]},${coord2[1]}`
      );
    return data;
  }
}
