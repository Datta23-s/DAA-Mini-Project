const { runDijkstra } = require('./backend/algorithms/dijkstra');

// Mock Graoh
const graph = new Map();
graph.set('A', [{ to: 'B', weight: 1 }, { to: 'C', weight: 4 }]);
graph.set('B', [{ to: 'A', weight: 1 }, { to: 'C', weight: 2 }, { to: 'D', weight: 5 }]);
graph.set('C', [{ to: 'A', weight: 4 }, { to: 'B', weight: 2 }, { to: 'D', weight: 1 }]);
graph.set('D', [{ to: 'B', weight: 5 }, { to: 'C', weight: 1 }]);

console.log('Running test Dijkstra from Node A...');
const distances = runDijkstra(graph, 'A');

console.log('Results:');
console.log(distances);

// Expected: A:0, B:1, C:3, D:4
if (distances.D === 4 && distances.C === 3) {
  console.log('✅ Dijkstra Logic Verified!');
} else {
  console.log('❌ Dijkstra Logic Failed!');
}
