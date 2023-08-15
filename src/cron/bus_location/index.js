const { sockets } = require('@chuva.io/less');
const { BusLocationModel } = require('models/database');
const { features, get: get_datasets } = require('mapbox/datasets');
const { bus_graphs } = require('models');
const { get_lines } = bus_graphs;
const bus_dataset_name = process.env.BUS_DATASET_NAME;

exports.process = async () => {
  let bus_locations = BusLocationModel.getAll();
  if (!bus_locations) {
    const bus_datasets = (await get_datasets())
      .filter(dataset => dataset.name.startsWith(bus_dataset_name))
      .map(dataset => {
        transcor_numbers.push(dataset.name.split(bus_dataset_name)[1]);
        return {
          id: dataset.id,
          name: dataset.name
        }
      });

    for (let bus_dataset of bus_datasets) {
      const bus_location = await BusLocationModel.create({
        dataset_id: bus_dataset.id,
        name: bus_dataset.name
      });
      bus_locations.push(bus_location);
    }
  }

  let new_bus_locations = [];
  for (let bus_location of bus_locations) {
    const bus_features = await features.get(bus_location.dataset_id);
    const bus_line = get_lines(bus_features);
    const bus_coordinates = 
      bus_location.longitude
      && bus_line.indexOf([bus_location.longitude, bus_location.latitude]) < bus_line.length - 1
        ? bus_line[bus_line.indexOf([bus_location.longitude, bus_location.latitude]) + 1]
        : bus_line[0];

    await BusLocationModel.update(
      {
        longitude: bus_coordinates[0],
        latitude: bus_coordinates[1]
      },
      {
        where: { id: bus_location.id }
      }
    );

    new_bus_locations.push({
      ...bus_location,
      longitude: bus_coordinates[0],
      latitude: bus_coordinates[1]
    });
  }

  const connection_ids = (await ConnectionModel.getAll())
    .map(connection => connection.id);

  if (connection_ids) {
    await sockets.buses_location.publish(new_bus_locations, connection_ids);
  }
}