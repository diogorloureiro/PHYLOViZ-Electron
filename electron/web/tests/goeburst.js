'use strict'

const fs = require('fs')
const goeburst = require('../services/data-processor').goeburst

module.exports = {
    testGoeBurstComparatorWithSmallestId,
    testGoeBurstComparatorWithSmallestDistance,
    testGoeBurstComparatorWithAllLvls,
    testGoeBurstProcess
}

const edges = JSON.parse(fs.readFileSync('./tests/data/input/testgoeBurstComparator.json', 'utf8'))

// Tests the tie break rule of ID
function testGoeBurstComparatorWithSmallestId(test) {
    test.equal(goeburst.comparator(edges.testGoeBurstComparatorWithSmallestId[0], edges.testGoeBurstComparatorWithSmallestId[1]), 4, '')
    test.done()
}

// Tests the tie break rule of hamming distance
function testGoeBurstComparatorWithSmallestDistance(test) {
    test.equal(goeburst.comparator(edges.testGoeBurstComparatorWithSmallestDistance[0], edges.testGoeBurstComparatorWithSmallestDistance[1]), 2, '')
    test.done()
}

// Tests tie break rule of lvl count
// First assertion is for SLV count, the second is for DLV and the third is for TLV
function testGoeBurstComparatorWithAllLvls(test) {
    test.equal(goeburst.comparator(edges.testGoeBurstComparatorWithAllLvls[0], edges.testGoeBurstComparatorWithAllLvls[1]), -1, 'SLV test failed')
    test.equal(goeburst.comparator(edges.testGoeBurstComparatorWithAllLvls[2], edges.testGoeBurstComparatorWithAllLvls[3]), -1, 'DLV test failed')
    test.equal(goeburst.comparator(edges.testGoeBurstComparatorWithAllLvls[4], edges.testGoeBurstComparatorWithAllLvls[5]), -3, 'TLV test failed')
    test.done()
}

// Tests the full process of goeBurst
function testGoeBurstProcess(test) {
    //Database of Bacillus licheniformis that contains 27 profiles
    //Link https://pubmlst.org/data/profiles/blicheniformis.txt
    const profiles = JSON.parse(fs.readFileSync('./tests/data/input/testGoeBurstProcess.json', 'utf8'))
    const output = JSON.parse(fs.readFileSync('./tests/data/output/testGoeBurstProcess.json', 'utf8'))
    goeburst.process(profiles, goeburst.comparator).then(function({ graph, matrix }){
        test.deepEqual(matrix, output.matrix, 'Test of matrix failed')
        test.deepEqual(graph.edges.length, output.edges.length, 'Length didn\'t match')
        for (let index = 0; index < output.edges.length; index++) {
            test.ok(graph.edges.some(edge => JSON.stringify(edge) === JSON.stringify(output.edges[index])))
        }
        test.done()
    })
    


}

