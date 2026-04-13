import { openDB } from '../../../lib/db';

export async function POST(request) {
  const { sourceCinema } = await request.json();
  const db = await openDB();
  
  // 1. Fetch entire Graph of Routes
  const routes = await db.all('SELECT * FROM CinemaRoutes');
  
  // 2. Build Adjacency List
  const graph = {};
  for (let r of routes) {
    if (!graph[r.source]) graph[r.source] = {};
    graph[r.source][r.destination] = r.distance_miles;
  }

  // 3. Dijkstra's Algorithm implementation
  const distances = {};
  const previous = {};
  const queue = new Set();

  // Initialize graph
  for (let node in graph) {
    distances[node] = Infinity;
    previous[node] = null;
    queue.add(node);
  }
  
  // Guard against missing nodes
  if(!graph[sourceCinema]){
    return new Response(JSON.stringify({ error: "Source node not mounted in graph." }), { status: 400 });
  }

  distances[sourceCinema] = 0;

  while (queue.size > 0) {
    // Find node with minimum distance in queue
    let minNode = null;
    for (let node of queue) {
      if (minNode === null || distances[node] < distances[minNode]) {
        minNode = node;
      }
    }

    if (distances[minNode] === Infinity) break;
    queue.delete(minNode);

    // Evaluate neighbors
    for (let neighbor in graph[minNode]) {
      let alt = distances[minNode] + graph[minNode][neighbor];
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        previous[neighbor] = minNode;
      }
    }
  }

  // 4. Trace the absolute shortest path to ANY other cinema
  // Filter out the source itself, and sort by shortest distance
  let options = Object.keys(distances)
    .filter(n => n !== sourceCinema && distances[n] !== Infinity)
    .sort((a,b) => distances[a] - distances[b]);

  if(options.length === 0){
    return new Response(JSON.stringify({ error: "No connected cinemas found." }), { status: 404 });
  }

  // Pick the absolute closest connected node
  const bestDest = options[0];
  const shortestDist = distances[bestDest];

  // Map the path array bridging source to dest
  const path = [];
  let current = bestDest;
  while(current) {
    path.unshift(current);
    current = previous[current];
  }

  // Mocking reserve inventory allocation for cinematic satisfaction
  const mockReserveSeats = Math.floor(Math.random() * 10) + 2;

  const result = {
    destination: bestDest,
    distance: shortestDist,
    path: path,
    reserve_seats_found: mockReserveSeats,
    message: `Dijkstra Traversal Complete: The shortest path from ${sourceCinema} is to ${bestDest} spanning ${shortestDist} miles.`
  };

  return new Response(JSON.stringify(result), { status: 200, headers: {'Content-Type': 'application/json'} });
}
