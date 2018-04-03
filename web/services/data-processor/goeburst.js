'use strict'

module.exports = { process, reprocess, compare }

// Compare two edges ({ source: vertix, target: vertix, distance: 1 }) with the following tie-breaking rules:
// 1. smallest distance
// 2. biggest SLV count
// 3. biggest DLV count
// 4. biggest TLV count
// 5. oldest (= smallest) id
function compare(p, q) {
    let diff = p.distance - q.distance
    if(diff !== 0)
        return diff
    const p_source_lvs = p.source.lvs, p_target_lvs = p.target.lvs
    const q_source_lvs = q.source.lvs, q_target_lvs = q.target.lvs
    for (let lv = 1; lv <= 3; lv++) {
        diff = Math.max(q_source_lvs[lv] || 0, q_target_lvs[lv] || 0) - Math.max(p_source_lvs[lv] || 0, p_target_lvs[lv] || 0)
        if(diff !== 0)
            return diff
        diff = Math.min(q_source_lvs[lv] || 0, q_target_lvs[lv] || 0) - Math.min(p_source_lvs[lv] || 0, p_target_lvs[lv] || 0)
        if(diff !== 0)
            return diff
    }
    return Math.max(p.source.id, p.target.id) - Math.max(q.source.id, q.target.id)
}

// Generate a minimum spanning tree from an existing one using a different maximum distance
function reprocess(mst, max) {
    return {
        vertices: Object.assign({ }, mst.vertices),
        edges: mst.edges.filter(edge => egde.distance <= max)
    }
}

// Generate a minimum spanning tree (edges and distance matrices?) with the given allelic profiles file and comparator
function process(profiles, comparator, cb) {
    let graph = generateGraph(profiles)
    graph = sort(graph, comparator)
    return generateMst(graph)
}

// Generate a graph (with all edges and vertices) given the allelic profiles
// The edges will contain the ids of the vertices they connect as well as the Hamming distance
// The vertices will contain the id and the count of SLVs, DLVs and TLVs of the allelic profile
function generateGraph(profiles) {
    let index = 0
    const graph = { vertices: { }, edges: [ ] }
    for (let i = 0; i < profiles.length; i++)
        graph.vertices[profiles[i].id] = { loci: profiles[i].loci, lvs: { } }
    for (let i = 0; i < profiles.length - 1; i++) {
        const p = profiles[i]
        for (let j = i + 1; j < profiles.length; j++) {
            const q = profiles[j]
            const diff = p.loci.filter((value, index) => value !== q.loci[index]).length // Hamming distance
            const plvs = graph.vertices[p.id].lvs
            plvs[diff] = plvs[diff] ? plvs[diff] + 1 : 1
            const qlvs = graph.vertices[q.id].lvs
            qlvs[diff] = qlvs[diff] ? qlvs[diff] + 1 : 1
            graph.edges[index++] = { source: p.id, target: q.id, distance: diff }
        }
    }
    return graph
}

// Sort a graph's edges given a comparator using the counting sort algorithm
function sort(graph, comparator) {

}

// Generate the mininum spanning tree given a graph (edges and vertices) using the prim/boruvka algorithm
function generateMst(graph) {

}