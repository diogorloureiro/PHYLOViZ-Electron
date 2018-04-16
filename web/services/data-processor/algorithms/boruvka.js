'use strict'

module.exports = process

// Generate a minimum spanning tree (edges and vertices) and distance matrix from the given allelic profiles and comparator using boruvka's algorithm
function process(profiles, comparator, lvs) {
	const { vertices, matrix, forest, components } = generateGraph(profiles)
	// Loop while the forest contains more than one component
	while (forest.filter(component => component !== undefined).length > 1) {
		const cheapest = findCheapestEdges(vertices, matrix, components, comparator, lvs)
		addEdgesAndConnectToForest(forest, components, cheapest)
	}
	const edges = forest[0].map(edge => ({ source: edge.source.id, target: edge.target.id, distance: edge.distance }))
	const graph = { vertices, edges }
	return { graph, matrix }
}

// Generate a graph (with all edges and vertices) given the allelic profiles
// The edges will contain the ids of the vertices they connect as well as the Hamming distance
// The vertices will contain the id and the count of locus variants of the allelic profile
function generateGraph(profiles) {
	const vertices = []
	const matrix = []
	const forest = []
	const components = []
	for (let i = 0; i < profiles.length; i++) {
		const { id, loci } = profiles[i]
		vertices[i] = { id, loci, lvs: [] }
		components[id] = i
		forest[i] = []
	}
	for (let i = 0; i < profiles.length - 1; i++) {
		const ploci = profiles[i].loci
		matrix[i] = []
		for (let j = i + 1; j < profiles.length; j++) {
			const qloci = profiles[j].loci
			const diff = ploci.filter((value, index) => value !== qloci[index]).length // Hamming distance
			const plvs = vertices[i].lvs
			plvs[diff] = plvs[diff] ? plvs[diff] + 1 : 1
			const qlvs = vertices[j].lvs
			qlvs[diff] = qlvs[diff] ? qlvs[diff] + 1 : 1
			matrix[i][j - i - 1] = diff
		}
	}
	return { vertices, matrix, forest, components }
}

// Find the cheapest edges that connect different components
function findCheapestEdges(vertices, matrix, components, comparator, lvs) {
	const cheapest = []
	for (let i = 0; i < matrix.length; i++) {
		const source = vertices[i]
		for (let j = 0; j < matrix[i].length; j++) {
			const target = vertices[j + i + 1]
			const distance = matrix[i][j]
			const sc = components[source.id]
			const tc = components[target.id]
			if (sc !== tc) {
				const edge = { source, target, distance }
				if (!cheapest[sc] || comparator(cheapest[sc], edge, lvs) > 0)
					cheapest[sc] = edge
				if (!cheapest[tc] || comparator(cheapest[tc], edge, lvs) > 0)
					cheapest[tc] = edge
			}
		}
	}
	return cheapest
}

// Add the cheapest edges of this iteration to the forest
function addEdgesAndConnectToForest(forest, components, cheapest) {
	cheapest.forEach(edge => {
		const source = edge.source.id
		const target = edge.target.id
		const sc = components[source]
		const tc = components[target]
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