'use strict'

// Generate a minimum spanning tree (edges and vertices) and distance matrix from the given allelic profiles, comparator and algorithm
// The edges contain the ids of the vertices they connect as well as the Hamming distance
// The vertices contain the id and the count of locus variants of the allelic profile
function process(profiles, comparator, algorithm, lvs) {
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

// Compare two edges ({ source: vertex, target: vertex, distance: 1 }) with the following tie-breaking rules:
// 1. biggest distance
// 2. smallest LV count up to lvs
// 3. youngest (= biggest id)
function compare(p, q, lvs) {
	let diff = p.distance - q.distance
	if (diff !== 0)
		return diff
	const p_source_lvs = p.source.lvs, p_target_lvs = p.target.lvs
	const q_source_lvs = q.source.lvs, q_target_lvs = q.target.lvs
	for (let lv = 1; lv <= lvs; lv++) {
		diff = Math.max(q_source_lvs[lv] || 0, q_target_lvs[lv] || 0) - Math.max(p_source_lvs[lv] || 0, p_target_lvs[lv] || 0)
		if (diff !== 0)
			return diff
		diff = Math.min(q_source_lvs[lv] || 0, q_target_lvs[lv] || 0) - Math.min(p_source_lvs[lv] || 0, p_target_lvs[lv] || 0)
		if (diff !== 0)
			return diff
	}
	diff = Math.min(p.source.id, p.target.id) - Math.min(q.source.id, q.target.id)
	return diff !== 0 ? diff : (Math.max(p.source.id, p.target.id) - Math.max(q.source.id, q.target.id))
}

module.exports = {
	process,
	compare
}