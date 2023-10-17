const { get: get_directions, ROUNTING_PROFILES } = require('models/mapbox/directions');

const GEOMETRY_TYPES = {
  line: "LineString",
  point: "Point",
};
const BUS = "Bus";
const ORIGIN_ID = "Origin";
const AVERAGE_WALKING_SPEED = 0.001;
const DESTINATION_ID = "Destination";
const BUS_STOPS_TRANSITION_TIME = 40;
const MAX_DISTANCE_BETWEEN_BUSES_POINTS = 0.5;

class Graph {
  constructor() {
    this.vertices = new Map();
  }

  addVertex(vertex) {
    if (!this.vertices.has(vertex)) {
      this.vertices.set(vertex, []);
    }
  }

  addEdge(vertex1, vertex2, data) {
    if (this.vertices.has(vertex1) && this.vertices.has(vertex2)) {
      this.vertices.get(vertex1).push({ vertex: vertex2, data });
    }
  }

  getAdjacentVertices(vertex) {
    if (this.vertices.has(vertex)) {
      return this.vertices.get(vertex);
    }
    return [];
  }

  printGraph() {
    for (const [vertex, edges] of this.vertices.entries()) {
      const edgeList = edges
        .map((edge) => `${edge.vertex}(${JSON.stringify(edge.data)})`)
        .join(", ");
      console.log(`${vertex} -> ${edgeList}`);
    }
  }

  getdata(vertex1, vertex2) {
    const edges = this.vertices.get(vertex1);
    for (const edge of edges) {
      if (edge.vertex === vertex2) {
        return edge.data;
      }
    }
    return null; // Return null if there's no edge or vertex
  }

  bfs(cb) {
    const visited = new Set();
    const [startVertex] = this.vertices.entries().next().value;
    const queue = [startVertex];

    visited.add(startVertex);

    while (queue.length > 0) {
      const currentVertex = queue.shift();
      cb(currentVertex);

      const adjacentVertices = this.getAdjacentVertices(currentVertex);
      for (const { vertex } of adjacentVertices) {
        if (!visited.has(vertex)) {
          visited.add(vertex);
          queue.push(vertex);
        }
      }
    }
  }
}

const get_points = (datas) =>
  datas.features
    .filter((data) => data.geometry.type === GEOMETRY_TYPES.point)
    .map((data) => data.geometry.coordinates);

const get_lines = (datas) =>
  datas.features.find((data) => data.geometry.type === GEOMETRY_TYPES.line)
    .geometry.coordinates;

const distanceBetweenPoints = (point1, point2) => {
  const [lon1, lat1] = point1;
  const [lon2, lat2] = point2;

  const radlat1 = (Math.PI * lat1) / 180;
  const radlat2 = (Math.PI * lat2) / 180;
  const theta = lon1 - lon2;
  const radtheta = (Math.PI * theta) / 180;
  let distance =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  distance = Math.acos(distance);
  distance = (distance * 180) / Math.PI;
  distance = distance * 60 * 1.1515;
  distance = distance * 1.609344; // Convert to kilometers

  return distance;
};

const graph_from_bus_line = (line) => {
  const graph = new Graph();
  const points = get_points(line);

  if (points.length < 2) {
    return undefined;
  }

  graph.addVertex(0);

  for (let i = 1; i < points.length; i++) {
    graph.addVertex(i);
    const distance = distanceBetweenPoints(points[i - 1], points[i]);
    graph.addEdge(i - 1, i, { distance });
  }

  const distance = distanceBetweenPoints(points[points.length - 1], points[0]);
  graph.addEdge(points.length - 1, 0, { distance });

  return graph;
};

const generate_all_buses_graphs = (lines, transcor_numbers) =>
  transcor_numbers.map((item, index) => ({
    [`${BUS}_${item}`]: graph_from_bus_line(lines[index]),
  }));

const generate_complete_graph = (
  bus_graphs,
  transcor_numbers,
  origin_coordinates,
  destination_coordinates
) => {
  const graph = new Graph();
  const distance = distanceBetweenPoints(
    origin_coordinates,
    destination_coordinates
  );

  graph.addVertex(ORIGIN_ID);
  graph.addVertex(DESTINATION_ID);

  graph.addEdge(ORIGIN_ID, DESTINATION_ID, {
    time: distance / AVERAGE_WALKING_SPEED,
  });

  const top = 2;
  const top_best_transfer = 4;

  const top_best_stops_near_origin = [];
  const top_best_stops_near_destination = [];

  for (let i = 0; i < transcor_numbers.length; i++) {
    top_best_stops_near_origin.push([]);
    top_best_stops_near_destination.push([]);
    for (let j = 0; j < top; j++) {
      top_best_stops_near_origin[i].push({
        vertex: ORIGIN_ID,
        distance: Infinity,
      });
      top_best_stops_near_destination[i].push({
        vertex: DESTINATION_ID,
        distance: Infinity,
      });
    }
  }

  for (let i = 0; i < transcor_numbers.length; i++) {
    const bus_stops = stops_and_trajectories[i].stops;
    bus_graphs[`${BUS}_${transcor_numbers[i]}`].bfs((vertex) => {
      const bus_point_1 = `${BUS}_${transcor_numbers[i]}_${vertex}`;
      if (vertex === 0) {
        graph.addVertex(bus_point_1);
      }

      let distance_origin_to_point = distanceBetweenPoints(
        bus_stops[vertex],
        origin_coordinates
      );
      let distance_point_to_destination = distanceBetweenPoints(
        bus_stops[vertex],
        destination_coordinates
      );

      let current_vertex_to_origin = bus_point_1;
      let current_vertex_to_destination = bus_point_1;

      for (let j = 0; j < top; j++) {
        if (
          distance_origin_to_point < top_best_stops_near_origin[i][j].distance
        ) {
          const tmp_vertex = top_best_stops_near_origin[i][j].vertex;
          const tmp_distance = top_best_stops_near_origin[i][j].distance;
          top_best_stops_near_origin[i][j].vertex = current_vertex_to_origin;
          top_best_stops_near_origin[i][j].distance = distance_origin_to_point;
          current_vertex_to_origin = tmp_vertex;
          distance_origin_to_point = tmp_distance;
        }
        if (
          distance_point_to_destination <
          top_best_stops_near_destination[i][j].distance
        ) {
          const tmp_vertex = top_best_stops_near_destination[i][j].vertex;
          const tmp_distance = top_best_stops_near_destination[i][j].distance;
          top_best_stops_near_destination[i][
            j
          ].vertex = current_vertex_to_destination;
          top_best_stops_near_destination[i][
            j
          ].distance = distance_point_to_destination;
          current_vertex_to_destination = tmp_vertex;
          distance_point_to_destination = tmp_distance;
        }
      }

      const adjacent_vertice = bus_graphs[
        `${BUS}_${transcor_numbers[i]}`
      ].getAdjacentVertices(vertex);
      const bus_point_2 = `${BUS}_${transcor_numbers[i]}_${adjacent_vertice[0].vertex}`;

      graph.addVertex(bus_point_2);
      graph.addEdge(bus_point_1, bus_point_2, { time: BUS_STOPS_TRANSITION_TIME });

      const top_best_transfer_points = [];
      for (let j = 0; j < transcor_numbers.length; j++) {
        top_best_transfer_points.push([]);
        for (let k = 0; k < top_best_transfer; k++) {
          top_best_transfer_points[j].push({
            vertex: bus_point_1,
            distance: Infinity,
          });
        }
      }

      if (i < transcor_numbers.length - 1) {
        for (let j = 0; j < transcor_numbers.length; j++) {
          if (i == j) {
            continue;
          }
          bus_graphs[`${BUS}_${transcor_numbers[j]}`].bfs(
            (_vertex) => {
              let bus_point_b = `${BUS}_${transcor_numbers[j]}_${_vertex}`;
              let distance = distanceBetweenPoints(
                stops_and_trajectories[j].stops[_vertex],
                bus_stops[vertex]
              );
              for (let k = 0; k < top_best_transfer; k++) {
                if (top_best_transfer_points[j][k].distance > distance) {
                  const tmp_bus_vertex = top_best_transfer_points[j][k].vertex;
                  const tmp_distance = top_best_transfer_points[j][k].distance;
                  top_best_transfer_points[j][k].vertex = bus_point_b;
                  top_best_transfer_points[j][k].distance = distance;
                  bus_point_b = tmp_bus_vertex;
                  distance = tmp_distance;
                }
              }
            }
          );
        }

        for (let j = 0; j < transcor_numbers.length; j++) {
          for (let k = 0; k < top_best_transfer; k++) {
            if (
              top_best_transfer_points[j][k].vertex.split("_")[1] !==
                bus_point_1.split("_")[1] &&
              top_best_transfer_points[j][k].distance <= MAX_DISTANCE_BETWEEN_BUSES_POINTS
            ) {
              graph.addEdge(
                bus_point_1,
                top_best_transfer_points[j][k].vertex,
                { time: top_best_transfer_points[j][k].distance / AVERAGE_WALKING_SPEED }
              );
            }
          }
        }
      }
    });
  }

  const _top_best_stops_near_origin = top_best_stops_near_origin
    .flat()
    .sort((point1, point2) => point1.distance - point2.distance);

  const _top_best_stops_near_destination = top_best_stops_near_destination.flat();
  for (let i = 0; i < transcor_numbers.length * top; i++) {
    if (_top_best_stops_near_origin[i].vertex !== ORIGIN_ID) {
      graph.addEdge(ORIGIN_ID, _top_best_stops_near_origin[i].vertex, {
        time: _top_best_stops_near_origin[i].distance / AVERAGE_WALKING_SPEED,
      });
    }
    if (_top_best_stops_near_destination[i].vertex !== DESTINATION_ID) {
      graph.addEdge(
        _top_best_stops_near_destination[i].vertex,
        DESTINATION_ID,
        { time: _top_best_stops_near_destination[i].distance / AVERAGE_WALKING_SPEED }
      );
    }
  }

  return graph;
};

const findTheBestPath = (graph, destination, stack, best_path) => {
  const [currentNode, currentDistance, currentCost, path] = stack.pop();
  const _distance = currentDistance + currentNode.data.time;
  let cost;
  let _path;
  if (path?.length) {
    _path = [...path, currentNode.vertex];
    if (
      currentNode.vertex !== ORIGIN_ID &&
      currentNode.vertex !== DESTINATION_ID &&
      currentNode.vertex.split("_")[1] !== path[path.length - 1].split("_")[1]
    ) {
      cost = currentCost + 43;
    } else {
      cost = currentCost;
    }
  } else {
    _path = [currentNode.vertex];
    cost = currentCost;
  }

  if (currentNode.vertex === destination) {
    if (best_path.length === 0) {
      best_path.push({ path: _path, sum: _distance, cost });
    } else {
      if (
        best_path[0].sum > _distance ||
        (best_path[0].sum <= _distance &&
          best_path[0].cost > cost &&
          _distance - best_path[0].sum <= 200)
      ) {
        best_path.pop();
        best_path.push({ path: _path, sum: _distance, cost });
      }
    }
    return;
  } else {
    if (best_path.length !== 0 && _distance > best_path[0].sum) {
      return;
    }
  }

  // const adjacent_vertices = getAdjacentVerticesSorted(graph, currentNode.vertex);
  const adjacent_vertices = graph.getAdjacentVertices(currentNode.vertex);

  for (let node of adjacent_vertices) {
    if (
      !_path.some(
        (item) =>
          item === node.vertex ||
          (node.vertex !== destination
            ? node.vertex.split("_")[1] !== currentNode.vertex.split("_")[1] &&
              node.vertex.split("_")[1] === item.split("_")[1]
            : null)
      )
    ) {
      findTheBestPath(graph, destination, [[node, _distance, cost, _path]]);
    }
  }
};

const sectionLine = (start, end, line) => {
  let min_start = Infinity;
  let min_end = Infinity;
  let start_index;
  let end_index;
  line.forEach((item, index) => {
    const distance_start = distanceBetweenPoints(item, start);
    const distance_end = distanceBetweenPoints(item, end);
    if (distance_start < min_start) {
      min_start = distance_start;
      start_index = index;
    }
    if (distance_end < min_end) {
      min_end = distance_end;
      end_index = index;
    }
  })

  let section_line;
  if (start_index > end_index) {
    section_line = [ ...line.slice(start_index, line.length - 1), ...line.slice(0, end_index) ];
  } else {
    section_line = [ ...line.slice(start_index, end_index) ];
  }
  
  return section_line;
};

const draw_line = async (path, origin, destination, lines, transcor_numbers) => {
  const split_vetex_id = (vertex_id) =>
    vertex_id.split("_").map((item) => Number(item));
  const all_stops = lines.map((line) => get_points(line));
  const all_lines = lines.map((line) => get_lines(line));
  let sub_line;
  const line = [];
  let response;

  if (path.length === 2) {
    try {
      response = await get_directions(ROUNTING_PROFILES.walking, origin, destination);
      line.push({
        from: ORIGIN_ID,
        to: DESTINATION_ID,
        geometry: JSON.parse(response).routes[0].geometry,
      });
    } catch (error) {
      console.log('Error: ', error);
    }

    return line;
  }
  path.shift();
  let point;
  for (let i = 0; i < path.length; i++) {
    let point_a = split_vetex_id(path[i]);
    if (i === 0) {
      response = await get_directions(
        ROUNTING_PROFILES.walking,
        origin,
        all_stops[transcor_numbers.indexOf(point_a[1])][point_a[2]]
      );

      sub_line = {
        from: ORIGIN_ID,
        to: path[i],
        geometry: JSON.parse(response).routes[0].geometry,
      };
      point = point_a;
      line.push(sub_line);
    } else {
      if (path[i] === DESTINATION_ID) {
        point_a = split_vetex_id(path[i - 1]);
        const point_coordinate =
          all_stops[transcor_numbers.indexOf(point_a[1])][point_a[2]];
        const bus_line = all_lines[transcor_numbers.indexOf(point[1])];
        const bus_stops = all_stops[transcor_numbers.indexOf(point[1])];
        const bus_sub_line = sectionLine(
          bus_stops[point[2]],
          bus_stops[point_a[2]],
          bus_line
        );

        response = await get_directions(
          ROUNTING_PROFILES.walking,
          point_coordinate,
          destination
        );

        sub_line = [
          {
            from: `${BUS}_${point[1]}_${point[2]}`,
            to: path[i - 1],
            geometry: { coordinates: bus_sub_line },
          },
          {
            from: path[i - 1],
            to: DESTINATION_ID,
            geometry: JSON.parse(response).routes[0].geometry,
          },
        ];
        line.push(...sub_line);
      } else if (point[1] !== point_a[1]) {
        const point_b = split_vetex_id(path[i - 1]);
        const bus_line = all_lines[transcor_numbers.indexOf(point[1])];
        const bus_a_stops = all_stops[transcor_numbers.indexOf(point_b[1])];
        const bus_b_stops = all_stops[transcor_numbers.indexOf(point_a[1])];
        const bus_sub_line = sectionLine(
          bus_a_stops[point[2]],
          bus_a_stops[point_b[2]],
          bus_line
        );

        response = await get_directions(
          ROUNTING_PROFILES.walking,
          bus_a_stops[point_b[2]],
          bus_b_stops[point_a[2]]
        );

        sub_line = [
          {
            from: `${BUS}_${point[1]}_${point[2]}`,
            to: path[i - 1],
            geometry: { coordinates: bus_sub_line },
          },
          {
            from: path[i - 1],
            to: path[i],
            geometry: JSON.parse(response).routes[0].geometry,
          },
        ];
        point = point_a;
        line.push(...sub_line);
      }
    }
  }

  return line;
};

module.exports = {
  BUS,
  Graph,
  get_lines,
  ORIGIN_ID,
  draw_line,
  get_points,
  findTheBestPath,
  DESTINATION_ID,
  graph_from_bus_line,
  distanceBetweenPoints,
  generate_complete_graph,
  generate_all_buses_graphs,
};
