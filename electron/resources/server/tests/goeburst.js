'use strict'

const goeburst = require('../services/data-processor/goeburst')

function testComparatorDistanceRule(test) {
    const p = { distance: 1 }
    const q = { distance: 10 }
    test.strictEqual(goeburst.comparator(p, q), -9)
    test.done()
}

function testComparatorLvCountRule(test) {
    const p = {
        distance: 1,
        source: { lvs: [, 1, 1, 3] },
        target: { lvs: [, 1, 1, 1] }
    }
    const q = {
        distance: 1,
        source: { lvs: [, 1, 1, 1] },
        target: { lvs: [, 1, 1, 1] }
    }
    test.equal(goeburst.comparator(p, q, 3), -2)
    test.done()
}

function testComparatorIdRule(test) {
    const p = {
        distance: 1,
        source: { id: 1, lvs: [, 1] },
        target: { id: 2, lvs: [, 1] }
    }
    const q = {
        distance: 1,
        source: { id: 10, lvs: [, 1] },
        target: { id: 20, lvs: [, 1] }
    }
    test.strictEqual(goeburst.comparator(p, q, 1), -9)
    test.done()
}

function testProcess(test) {
    const profiles = [
        { id: 1, loci: [1, 1, 1, 1, 1, 1, 1] },
        { id: 2, loci: [2, 1, 1, 2, 2, 2, 2] },
        { id: 3, loci: [2, 1, 2, 1, 3, 3, 2] },
        { id: 4, loci: [3, 2, 1, 3, 4, 2, 2] },
        { id: 5, loci: [4, 1, 1, 1, 5, 1, 1] },
        { id: 6, loci: [5, 3, 3, 3, 6, 4, 2] },
        { id: 7, loci: [6, 4, 4, 1, 7, 2, 1] },
        { id: 8, loci: [7, 5, 5, 4, 8, 5, 2] },
        { id: 9, loci: [7, 6, 6, 1, 9, 6, 2] }
    ]
    const result = goeburst.process(profiles, goeburst.comparator)
    const vertices = [
        { id: 1, loci: [1, 1, 1, 1, 1, 1, 1], lvs: [, , 1, , , 3, 2, 2] },
        { id: 2, loci: [2, 1, 1, 2, 2, 2, 2], lvs: [, , , , 2, 2, 4] },
        { id: 3, loci: [2, 1, 2, 1, 3, 3, 2], lvs: [, , , , 1, 3, 4] },
        { id: 4, loci: [3, 2, 1, 3, 4, 2, 2], lvs: [, , , , 1, 1, 6] },
        { id: 5, loci: [4, 1, 1, 1, 5, 1, 1], lvs: [, , 1, , , 3, 2, 2] },
        { id: 6, loci: [5, 3, 3, 3, 6, 4, 2], lvs: [, , , , , 1, 4, 3] },
        { id: 7, loci: [6, 4, 4, 1, 7, 2, 1], lvs: [, , , , , 2, 4, 2] },
        { id: 8, loci: [7, 5, 5, 4, 8, 5, 2], lvs: [, , , , , 1, 4, 3] },
        { id: 9, loci: [7, 6, 6, 1, 9, 6, 2], lvs: [, , , , , 2, 6] }
    ]
    const edges = [
        { source: 1, target: 5, distance: 2 },
        { source: 1, target: 7, distance: 5 },
        { source: 1, target: 2, distance: 5 },
        { source: 2, target: 3, distance: 4 },
        { source: 2, target: 4, distance: 4 },
        { source: 4, target: 6, distance: 5 },
        { source: 3, target: 9, distance: 5 },
        { source: 8, target: 9, distance: 5 }
    ]
    const matrix = [
        [5, 5, 6, 2, 7, 5, 7, 6],
        [4, 4, 5, 6, 6, 6, 6],
        [6, 5, 6, 6, 6, 5],
        [6, 5, 6, 6, 6],
        [7, 5, 7, 6],
        [7, 6, 6],
        [7, 6],
        [5]
    ]
    test.deepEqual(result.graph.vertices, vertices)
    test.deepEqual(result.graph.edges, edges)
    test.deepEqual(result.matrix, matrix)
    test.done()
}

module.exports = {
    testComparatorDistanceRule,
    testComparatorLvCountRule,
    testComparatorIdRule,
    testProcess
}