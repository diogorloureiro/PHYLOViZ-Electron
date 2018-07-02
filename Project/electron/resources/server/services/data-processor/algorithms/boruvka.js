'use strict'

// Generate a minimum spanning tree from the vertices, distance matrix and comparator using boruvka's algorithm
function process(vertices, matrix, comparator) {
	const forest = [], components = []
	vertices.forEach((vertex, index) => {
		components[vertex.id] = index
		forest[index] = []
	})
	// Loop while the forest contains more than one component
	while (forest.filter(component => component !== undefined).length > 1) {
		const cheapest = []
		for (let i = 0; i < matrix.length; i++) {
			const source = vertices[i]
			for (let j = 0; j < matrix[i].length; j++) {
				const target = vertices[j + i + 1]
				const distance = matrix[i][j]
				const sc = components[source.id], tc = components[target.id]
				if (sc !== tc) {
					const edge = { source, target, distance }
					if (!cheapest[sc] || comparator(cheapest[sc], edge) > 0)
						cheapest[sc] = edge
					if (!cheapest[tc] || comparator(cheapest[tc], edge) > 0)
						cheapest[tc] = edge
				}
			}
		}
		cheapest.forEach(edge => {
			const source = edge.source.id, sc = components[source]
			const target = edge.target.id, tc = components[target]
			if (sc !== tc) {
				const src = Math.max(sc, tc), dst = Math.min(sc, tc)
				forest[dst].push(edge)
				components[source] = components[target] = dst
				forest[src].forEach(edge => {
					forest[dst].push(edge)
					components[edge.source.id] = components[edge.target.id] = dst
				})
				delete forest[src]
			}
		})
	}
	const edges = forest[0].map(edge => ({ source: edge.source.id, target: edge.target.id, distance: edge.distance }))
	return { vertices, edges }
}

module.exports = process