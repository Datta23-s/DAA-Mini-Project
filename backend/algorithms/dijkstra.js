/**
 * Min-Heap implementation for Dijkstra's Priority Queue
 */
class MinHeap {
  constructor() {
    this.heap = [];
  }

  push(node) {
    this.heap.push(node);
    this.bubbleUp();
  }

  pop() {
    if (this.size() === 0) return null;
    if (this.size() === 1) return this.heap.pop();
    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.bubbleDown();
    return min;
  }

  size() {
    return this.heap.length;
  }

  bubbleUp() {
    let index = this.heap.length - 1;
    while (index > 0) {
      let parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index].priority >= this.heap[parentIndex].priority) break;
      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
      index = parentIndex;
    }
  }

  bubbleDown() {
    let index = 0;
    const length = this.heap.length;
    while (true) {
      let left = 2 * index + 1;
      let right = 2 * index + 2;
      let swap = null;

      if (left < length) {
        if (this.heap[left].priority < this.heap[index].priority) {
          swap = left;
        }
      }

      if (right < length) {
        if (
          (swap === null && this.heap[right].priority < this.heap[index].priority) ||
          (swap !== null && this.heap[right].priority < this.heap[left].priority)
        ) {
          swap = right;
        }
      }

      if (swap === null) break;
      [this.heap[index], this.heap[swap]] = [this.heap[swap], this.heap[index]];
      index = swap;
    }
  }
}

/**
 * Dijkstra SSSP Algorithm
 * @param {Map} graph - Adjacency list: Map<userId, edges[]> where edge = {to: userId, weight: float}
 * @param {string} startNode - Source User ID
 * @returns {Object} distances - Map<userId, distance>
 */
const runDijkstra = (graph, startNode) => {
  const distances = {};
  const pq = new MinHeap();

  // Initialize distances
  for (let node of graph.keys()) {
    distances[node] = Infinity;
  }
  distances[startNode] = 0;
  pq.push({ id: startNode, priority: 0 });

  while (pq.size() > 0) {
    const { id: u, priority: dist } = pq.pop();

    if (dist > distances[u]) continue;

    const neighbors = graph.get(u) || [];
    for (const edge of neighbors) {
      const v = edge.to;
      const weight = edge.weight;
      const newDist = distances[u] + weight;

      if (newDist < distances[v]) {
        distances[v] = newDist;
        pq.push({ id: v, priority: newDist });
      }
    }
  }

  return distances;
};

module.exports = { runDijkstra };
