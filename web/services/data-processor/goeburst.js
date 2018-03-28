'use strict'

module.exports = { process, reprocess }

// Generate a minimum spanning tree from an existing one using a different maximum distance
function reprocess(mst, max, comparator) {
    
}

// Generate a minimum spanning tree (edges and distance matrices?) with the given allelic profiles and comparator
function process(profiles, comparator) {
    
}

// Generate a graph (with all edges and vertices) given the allelic profiles
// The edges will contain the ids of the vertices they connect as well as the Hamming distance
// The vertices will contain the id and the count of SLVs, DLVs and TLVs of the allelic profile
function generateGraph(profiles) {

}

// Sort a graph (edges and vertices) given a comparator using the counting sort algorithm
function sort(vertices, edges, comparator) {

}

// Generate the mininum spanning tree given a graph (edges and vertices) using the prim/boruvka algorithm
function generateMst(vertices, edges) {

}