'use strict'


const fs = require('fs')
const goeburst = require('../services/data-processor').goeburst

module.exports = {
    testgoeBurstComparator_withSmallestId,
    testgoeBurstComparator_withSmallestDistance,
    testgoeBurstComparator_withmaxlvl,
    testProcess,
    testBoruvka
}
/**
 * Tests the tie break rule of ID
 * @param {*} test 
 */
function testgoeBurstComparator_withSmallestId(test) {
    //These edges are from Bartonella henselae Database
    const edge1 = {
        source: { id: 10, loci: [2, 3, 1, 2, 2, 1, 1, 2], lvs: [0, 4, 3, 4, 7, 10, 4] },
        target: { id: 31, loci: [2, 3, 4, 2, 2, 1, 1, 2], lvs: [0, 3, 3, 2, 7, 7, 10] },
        distance: 1
    }
    const edge2 = {
        source: { id: 6, loci: [2, 3, 2, 2, 2, 1, 1, 2], lvs: [0, 4, 3, 4, 6, 6, 9] },
        target: { id: 31, loci: [2, 3, 4, 2, 2, 1, 1, 2], lvs: [0, 3, 3, 2, 7, 7, 10] },
        distance: 1
    }
    test.deepEqual(goeburst.comparator(edge1, edge2), 4, '')
    test.done()
}

/**
 * Tests the tie break rule of hamming distance
 * @param {*} test 
 */
function testgoeBurstComparator_withSmallestDistance(test) {
    const edge1 = {
        source: { id: 10, loci: [3, 4, 1, 2, 2, 1, 1, 2], lvs: [0, 4, 3, 4, 7, 10, 4] },
        target: { id: 31, loci: [2, 3, 4, 2, 2, 1, 1, 2], lvs: [0, 3, 3, 2, 7, 7, 10] },
        distance: 3
    }
    const edge2 = {
        source: { id: 6, loci: [2, 3, 2, 2, 2, 1, 1, 2], lvs: [0, 4, 3, 4, 6, 6, 9] },
        target: { id: 31, loci: [2, 3, 4, 2, 2, 1, 1, 2], lvs: [0, 3, 3, 2, 7, 7, 10] },
        distance: 1
    }
    test.deepEqual(goeburst.comparator(edge1, edge2), 2, '')
    test.done()
}

/**
 * Tests tie break rule of lvl count
 * First assertion is for SLV count, the second is for DLV and the third is for TLV
 * @param {*} test 
 */
function testgoeBurstComparator_withmaxlvl(test) {
    let edge1 = {
        source: { id: 10, loci: [2, 3, 1, 2, 2, 1, 1, 2], lvs: [0, 5, 3, 4, 7, 10, 4] },
        target: { id: 31, loci: [2, 3, 4, 2, 2, 1, 1, 2], lvs: [0, 3, 3, 2, 7, 7, 10] },
        distance: 1
    }
    let edge2 = {
        source: { id: 6, loci: [2, 3, 2, 2, 2, 1, 1, 2], lvs: [0, 4, 3, 4, 6, 6, 9] },
        target: { id: 31, loci: [2, 3, 4, 2, 2, 1, 1, 2], lvs: [0, 3, 3, 2, 7, 7, 10] },
        distance: 1
    }
    test.deepEqual(goeburst.comparator(edge1, edge2), -1, 'SLV test failed')

    edge1 = {
        source: { id: 10, loci: [2, 3, 1, 2, 2, 1, 1, 2], lvs: [0, 4, 4, 4, 7, 10, 4] },
        target: { id: 31, loci: [2, 3, 4, 2, 2, 1, 1, 2], lvs: [0, 3, 3, 2, 7, 7, 10] },
        distance: 1
    }
    edge2 = {
        source: { id: 6, loci: [2, 3, 2, 2, 2, 1, 1, 2], lvs: [0, 4, 3, 4, 6, 6, 9] },
        target: { id: 31, loci: [2, 3, 4, 2, 2, 1, 1, 2], lvs: [0, 3, 3, 2, 7, 7, 10] },
        distance: 1
    }
    test.deepEqual(goeburst.comparator(edge1, edge2), -1, 'DLV test failed')

    edge1 = {
        source: { id: 10, loci: [2, 3, 1, 2, 2, 1, 1, 2], lvs: [0, 4, 3, 7, 7, 10, 4] },
        target: { id: 31, loci: [2, 3, 4, 2, 2, 1, 1, 2], lvs: [0, 3, 3, 2, 7, 7, 10] },
        distance: 1
    }
    edge2 = {
        source: { id: 6, loci: [2, 3, 2, 2, 2, 1, 1, 2], lvs: [0, 4, 3, 4, 6, 6, 9] },
        target: { id: 31, loci: [2, 3, 4, 2, 2, 1, 1, 2], lvs: [0, 3, 3, 2, 7, 7, 10] },
        distance: 1
    }
    test.deepEqual(goeburst.comparator(edge1, edge2), -3, 'TLV test failed')

    test.done()
}

/**
 * Tests the full process of goeBurst
 * @param {*} test 
 */
function testgoeBurstProcess(test) {
    //Database of Bacillus licheniformis that contains 27 profiles
    //Link https://pubmlst.org/data/profiles/blicheniformis.txt
    const { graph, matrix } = goeburst.process([
        { id: 1, loci: [1, 1, 1, 1, 1, 1] },
        { id: 2, loci: [2, 1, 1, 2, 1, 2] },
        { id: 3, loci: [2, 1, 1, 1, 1, 2] },
        { id: 4, loci: [3, 2, 2, 3, 2, 3] },
        { id: 5, loci: [2, 3, 1, 1, 3, 1] },
        { id: 6, loci: [3, 4, 3, 3, 2, 4] },
        { id: 7, loci: [2, 1, 1, 2, 4, 2] },
        { id: 8, loci: [4, 5, 4, 4, 5, 5] },
        { id: 9, loci: [2, 1, 1, 1, 1, 1] },
        { id: 10, loci: [2, 6, 1, 1, 6, 1] },
        { id: 11, loci: [3, 7, 5, 3, 7, 3] },
        { id: 12, loci: [2, 8, 1, 1, 1, 2] },
        { id: 13, loci: [2, 9, 1, 2, 1, 1] },
        { id: 14, loci: [3, 7, 2, 3, 2, 3] },
        { id: 15, loci: [3, 2, 5, 3, 8, 3] },
        { id: 16, loci: [3, 10, 5, 3, 2, 6] },
        { id: 17, loci: [3, 7, 5, 5, 2, 7] },
        { id: 18, loci: [3, 10, 3, 3, 2, 3] },
        { id: 19, loci: [2, 1, 1, 2, 3, 1] },
        { id: 20, loci: [2, 1, 1, 2, 3, 2] },
        { id: 21, loci: [3, 2, 2, 3, 2, 8] },
        { id: 22, loci: [2, 1, 1, 1, 1, 9] },
        { id: 23, loci: [2, 11, 1, 1, 1, 1] },
        { id: 24, loci: [2, 3, 1, 1, 1, 2] },
        { id: 25, loci: [2, 9, 1, 1, 1, 1] },
        { id: 26, loci: [2, 1, 1, 2, 1, 1] },
        { id: 27, loci: [3, 2, 5, 3, 9, 3] }
    ], goeburst.comparator)

    //These edges were the output from npm library goeBurst
    const edges_to_compare =
        [
            { source: 1, target: 9, distance: 1 },
            { source: 3, target: 9, distance: 1 },
            { source: 9, target: 26, distance: 1 },
            { source: 9, target: 25, distance: 1 },
            { source: 9, target: 23, distance: 1 },
            { source: 9, target: 22, distance: 1 },
            { source: 2, target: 3, distance: 1 },
            { source: 3, target: 24, distance: 1 },
            { source: 3, target: 12, distance: 1 },
            { source: 2, target: 20, distance: 1 },
            { source: 19, target: 26, distance: 1 },
            { source: 13, target: 26, distance: 1 },
            { source: 2, target: 7, distance: 1 },
            { source: 5, target: 9, distance: 2 },
            { source: 9, target: 10, distance: 2 },
            { source: 4, target: 9, distance: 6 },
            { source: 4, target: 14, distance: 1 },
            { source: 4, target: 21, distance: 1 },
            { source: 4, target: 15, distance: 2 },
            { source: 15, target: 27, distance: 1 },
            { source: 4, target: 18, distance: 2 },
            { source: 11, target: 14, distance: 2 },
            { source: 16, target: 18, distance: 2 },
            { source: 6, target: 18, distance: 2 },
            { source: 14, target: 17, distance: 3 },
            { source: 8, target: 9, distance: 6 }
        ]
    //This matrix was the output of the npm library goeBurst
    const matrix_to_compare =
        [
            [3, 2, 6, 3, 6, 4, 6, 1, 3, 6, 3, 3, 6, 6, 6, 6, 6, 3, 4, 6, 2, 2, 3, 2, 2, 6],
            [1, 6, 4, 6, 1, 6, 2, 4, 6, 2, 2, 6, 6, 6, 6, 6, 2, 1, 6, 2, 3, 2, 3, 1, 6],
            [6, 3, 6, 2, 6, 1, 3, 6, 1, 3, 6, 6, 6, 6, 6, 3, 2, 6, 1, 2, 1, 2, 2, 6],
            [6, 3, 6, 6, 6, 6, 3, 6, 6, 1, 2, 3, 4, 2, 6, 6, 1, 6, 6, 6, 6, 6, 2],
            [6, 4, 6, 2, 2, 6, 3, 3, 6, 6, 6, 6, 6, 2, 3, 6, 3, 2, 2, 2, 3, 6],
            [6, 6, 6, 6, 4, 6, 6, 3, 4, 3, 4, 2, 6, 6, 3, 6, 6, 6, 6, 6, 4],
            [6, 3, 4, 6, 3, 3, 6, 6, 6, 6, 6, 2, 1, 6, 3, 4, 3, 4, 2, 6],
            [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
            [2, 6, 2, 2, 6, 6, 6, 6, 6, 2, 3, 6, 1, 1, 2, 1, 1, 6],
            [6, 3, 3, 6, 6, 6, 6, 6, 3, 4, 6, 3, 2, 3, 2, 3, 6],
            [6, 6, 2, 2, 3, 3, 3, 6, 6, 4, 6, 6, 6, 6, 6, 2],
            [3, 6, 6, 6, 6, 6, 4, 3, 6, 2, 2, 1, 2, 3, 6],
            [6, 6, 6, 6, 6, 2, 3, 6, 3, 2, 3, 1, 1, 6],
            [3, 3, 3, 2, 6, 6, 2, 6, 6, 6, 6, 6, 3],
            [3, 4, 3, 6, 6, 3, 6, 6, 6, 6, 6, 1],
            [3, 2, 6, 6, 3, 6, 6, 6, 6, 6, 3],
            [4, 6, 6, 4, 6, 6, 6, 6, 6, 4],
            [6, 6, 3, 6, 6, 6, 6, 6, 3],
            [1, 6, 3, 3, 4, 3, 1, 6],
            [6, 3, 4, 3, 4, 2, 6],
            [6, 6, 6, 6, 6, 3],
            [2, 2, 2, 2, 6],
            [2, 1, 2, 6],
            [2, 3, 6],
            [2, 6],
            [6]
        ]

    test.deepEqual(matrix, matrix_to_compare, "Test of matrix failed")
    test.deepEqual(graph.edges.length, edges_to_compare.length)
    for (let index = 0; index < edges_to_compare.length; index++) {
        test.ok(graph.edges.some(edge => JSON.stringify(edge) === JSON.stringify(edges_to_compare[index])))
    }
    test.done()
}

