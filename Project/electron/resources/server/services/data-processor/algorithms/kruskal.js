'use strict'

const UnionFind = require('union-find')

// Generate a minimum spanning tree from the vertices, distance matrix and comparator using kruskal's algorithm
function process(vertices, matrix, comparator) {
	const links = []
	for (let i = 0; i < vertices.length - 1; i++)
		for (let j = i + 1; j < vertices.length; j++)
			links.push([i, j])
	links.sort((p, q) => {
		const [psource, ptarget] = p
		const pedge = { source: vertices[psource], target: vertices[ptarget], distance: matrix[psource][ptarget - psource - 1] }
		const [qsource, qtarget] = q
		const qedge = { source: vertices[qsource], target: vertices[qtarget], distance: matrix[qsource][qtarget - qsource - 1] }
		return comparator(pedge, qedge)
	})
	const edges = []
	const forest = new UnionFind(vertices.length)
	for (let i = 0; i < links.length && edges.length < vertices.length - 1; i++) {
		const [source, target] = links[i]
		if (forest.find(source) != forest.find(target)) {
			forest.link(source, target)
			edges.push({ source: vertices[source].id, target: vertices[target].id, distance: matrix[source][target - source - 1] })
		}
	}
	return { vertices, edges }
}

module.exports = process