const { bus_graphs } = require('models');
const { features, get: get_datasets } = require('mapbox/datasets');
const {
  BUS,
  ORIGIN_ID,
  findTheBestPath,
  generate_all_buses_graphs,
  generate_complete_graph,
  draw_line,
} = bus_graphs;

module.exports = {
  create: async (req, res) => {
    const { origin, destination } = req.body;
    const bus_dataset_name = process.env.BUS_DATASET_NAME;

    const transcor_numbers = [];
    const bus_dataset_ids = (await get_datasets())
      .filter(dataset => dataset.name.startsWith(bus_dataset_name))
      .map(dataset => {
        transcor_numbers.push(dataset.name.split(bus_dataset_name)[1]);
        return dataset.id
      });

    const buses_features = [];
    for (let dataset_id of bus_dataset_ids) {
      const dataset_features = await features.get(dataset_id);
      buses_features.push(dataset_features);
    }

    const buses_graphs = generate_all_buses_graphs(buses_features, transcor_numbers);

    const graph = generate_complete_graph(
      buses_graphs,
      transcor_numbers,
      origin,
      destination,
      buses_features
    );

    const best_path = [];
    const stack = [[{ vertex: ORIGIN_ID, data: { time: 0 } }, 0, 0, []]];
    findTheBestPath(graph, destination, stack, best_path);

    let line;
    await draw_line(best_path[0].path).then((values) => {
      const fetch_point_type = (value) => {
        let data;
        const from_splited = value.from.split("_");
        const to_splited = value.to.split("_");
        if (from_splited[0] === BUS) {
          data = {
            from_bus: `Autocarro ${from_splited[1]}`,
            from_stop: Number(from_splited[2]) + 1,
          };
        } else {
          data = {
            from: value.from,
          };
        }
        if (to_splited[0] === BUS) {
          data = {
            ...data,
            to_bus: `Autocarro ${to_splited[1]}`,
            to_stop: Number(to_splited[2]) + 1,
          };
        } else {
          data = {
            ...data,
            to: value.to,
          };
        }
        return data;
      };

      line = {
        type: "FeatureCollection",
        features: values.map((value) => ({
          type: "Feature",
          properties: fetch_point_type(value),
          geometry: {
            coordinates: value.geometry.coordinates,
            type: "LineString",
          },
        })),
      };
    });

    res.body = line;

    return res;
  },
};
