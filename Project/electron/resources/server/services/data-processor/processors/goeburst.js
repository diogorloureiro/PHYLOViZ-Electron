'use strict'

// Generate a minimum spanning tree (edges and vertices) and distance matrix from the given allelic profiles, comparator and algorithm
// The edges contain the ids of the vertices they connect as well as the Hamming distance
// The vertices contain the id and the count of locus variants of the allelic profile
function process(comparator, algorithm, profiles, lvs) {
	const matrix = []
	profiles.forEach(profile => profile.lvs = [])
	for (let i = 0; i < profiles.length - 1; i++) {
		const ploci = profiles[i].loci, plvs = profiles[i].lvs
		matrix.push([])
		for (let j = i + 1; j < profiles.length; j++) {
			const qloci = profiles[j].loci, qlvs = profiles[j].lvs
			const diff = ploci.filter((value, index) => value !== qloci[index]).length // Hamming distance
			plvs[diff] = (plvs[diff] || 0) + 1
			qlvs[diff] = (qlvs[diff] || 0) + 1
			matrix[i].push(diff)
		}
	}
	const graph = algorithm(profiles, matrix, (p, q) => comparator(p, q, lvs))
	return { graph, matrix }
}

module.exports = process