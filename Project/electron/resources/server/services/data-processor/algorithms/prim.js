'use strict'

const Heap = require('heap')

// Generate a minimum spanning tree from the vertices, distance matrix and comparator using prim's algorithm
function process(vertices, matrix, comparator) {
	const UNREACHED = 0, REACHED = 1, VISITED = 2
	const pi = []
	const state = []
	for (let i = 0; i < vertices.length; i++)
		state[i] = UNREACHED
	const edges = []
	const heap = new Heap((p, q) => {
		const [psource, ptarget, pdistance] = pi[p], pedge = { source: vertices[psource], target: vertices[ptarget], distance: pdistance }
		const [qsource, qtarget, qdistance] = pi[q], qedge = { source: vertices[qsource], target: vertices[qtarget], distance: qdistance }
		return comparator(pedge, qedge)
	})
	heap.push(0)
	while (!heap.empty()) {
		const i = heap.pop()
		state[i] = VISITED
		if (i !== 0) {
			const [source, target, distance] = pi[i]
			edges.push({ source: vertices[source].id, target: vertices[target].id, distance: distance })
		}
		for (let j = 0; j < vertices.length; j++) {
			if (i !== j && state[j] !== VISITED) {
				const distance = i < j ? matrix[i][j - i - 1] : matrix[j][i - j - 1]
				const edge = [i, j, distance]
				if (state[j] === UNREACHED) {
					state[j] = REACHED
					pi[j] = edge
					heap.push(j)
				} else {
					const [psource, ptarget, pdistance] = edge, pedge = { source: vertices[psource], target: vertices[ptarget], distance: pdistance }
					const [qsource, qtarget, qdistance] = pi[j], qedge = { source: vertices[qsource], target: vertices[qtarget], distance: qdistance }
					if (comparator(pedge, qedge) < 0) {
						pi[j] = edge
						heap.updateItem(j)
					}
				}
			}
		}
	}
	return { vertices, edges }
}

module.exports = process