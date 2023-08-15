require('dotenv').config(); // Load environment variables from .env file
const axios = require('axios');

const data = `controller=localizar-autocarrosAjax&action=listar-rotas-paragens-autocarros&x-csrf-token=${process.env.CSRF_TOKEN}&cod_linha=`;

const config = {
  headers: {
    Cookie: process.env.COOKIE,
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  },
};

exports.handler = async (transcor_numbers) => { 
  const bus_positions = [];

  for (const transcor_number of transcor_numbers) {
    const url = `https://www.transcor.cv/localizar-autocarros/${transcor_number}/DispatcherAjax`;
    let transcor_line;
    await axios.post(url, `${data}${transcor_number}`, config)
      .then(response => {
        const response_data = response.data;

        transcor_line = response_data.data.autocarros.map(bus => ({
          Bus: `transcor_linha_${transcor_number}`,
          coordinates: [bus.Gps_Longitude, bus.Gps_Latitude]
        }));
        if (transcor_line.length) {
          bus_positions.push(transcor_line[0]);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  return bus_positions;
};
