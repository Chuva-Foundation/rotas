const { sockets } = require('@chuva.io/less');
const { bus_positions } = require('models');

exports.process = async () => {
  const transcor_numbers = [1, 2, 3, 4, 5, 7, 9, 10, 11, 12];
  
  const transcor_bus_positions = await bus_positions(transcor_numbers);

  const connection_ids = (await ConnectionModel.getAll())
    .map(connection => connection.id);

  if (connection_ids) {
    await sockets.buses_location.publish(transcor_bus_positions, connection_ids);
  }
}