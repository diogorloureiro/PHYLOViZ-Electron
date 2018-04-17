'use strict'


const fs = require('fs')
const goeburst = require('../services/data-processor').goeburst

module.exports = {
    testgoeBurstComparator_withSmallestId,
    testgoeBurstComparator_withSmallestDistance,
    testgoeBurstComparator_withalllvls,
    testgoeBurstProcess
}

const edges = JSON.parse(fs.readFileSync('./tests/data/input/testgoeBurstComparator.json', 'utf8'))

// Tests the tie break rule of ID
function testgoeBurstComparator_withSmallestId(test) {
    test.equal(goeburst.comparator(edges.testgoeBurstComparator_withSmallestId[0], edges.testgoeBurstComparator_withSmallestId[1]), 4, '')
    test.done()
}

// Tests the tie break rule of hamming distance
function testgoeBurstComparator_withSmallestDistance(test) {
    test.equal(goeburst.comparator(edges.testgoeBurstComparator_withSmallestDistance[0], edges.testgoeBurstComparator_withSmallestDistance[1]), 2, '')
    test.done()
}

// Tests tie break rule of lvl count
// First assertion is for SLV count, the second is for DLV and the third is for TLV
function testgoeBurstComparator_withalllvls(test) {
    test.equal(goeburst.comparator(edges.testgoeBurstComparator_withalllvls[0], edges.testgoeBurstComparator_withalllvls[1]), -1, 'SLV test failed')
    test.equal(goeburst.comparator(edges.testgoeBurstComparator_withalllvls[2], edges.testgoeBurstComparator_withalllvls[3]), -1, 'DLV test failed')
    test.equal(goeburst.comparator(edges.testgoeBurstComparator_withalllvls[4], edges.testgoeBurstComparator_withalllvls[5]), -3, 'TLV test failed')
    test.done()
}

// Tests the full process of goeBurst
function testgoeBurstProcess(test) {
    //Database of Bacillus licheniformis that contains 27 profiles
    //Link https://pubmlst.org/data/profiles/blicheniformis.txt
    const profiles = JSON.parse(fs.readFileSync('./tests/data/input/testgoeBurstProcessInput.json', 'utf8'))
    const output = JSON.parse(fs.readFileSync('./tests/data/output/testgoeBurstProcessOutput.json', 'utf8'))
    const { graph, matrix } = goeburst.process(profiles, goeburst.comparator)
    test.deepEqual(matrix, output.matrix, "Test of matrix failed")
    test.deepEqual(graph.edges.length, output.edges.length)
    for (let index = 0; index < output.edges.length; index++) {
        test.ok(graph.edges.some(edge => JSON.stringify(edge) === JSON.stringify(output.edges[index])))
    }
    test.done()


}

