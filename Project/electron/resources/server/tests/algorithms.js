'use strict'

const { process, goeburst, algorithms } = require('../services/data-processor')
const { compare } = require('../services/data-processor/goeburst')

function testGoeburstComparatorDistanceRule(test) {
    const p = { distance: 1 }
    const q = { distance: 10 }
    test.strictEqual(compare(p, q), -9)
    test.done()
}

function testGoeburstComparatorLvCountRule(test) {
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
    test.equal(compare(p, q, 3), -2)
    test.done()
}

function testGoeburstComparatorIdRule(test) {
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
    test.strictEqual(compare(p, q, 1), -9)
    test.done()
}

function testGoeburstBoruvka(test) {
    testProcess(test, goeburst.processor, goeburst.comparator, algorithms.boruvka)
}

function testGoeburstKruskal(test) {
    testProcess(test, goeburst.processor, goeburst.comparator, algorithms.kruskal)
}

function testGoeburstPrim(test) {
    testProcess(test, goeburst.processor, goeburst.comparator, algorithms.prim)
}

function testProcess(test, processor, comparator, algorithm) {
    test.expect(10)
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
    process(processor, comparator, algorithm, profiles)
        .then(result => {
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
            edges.forEach(edge => test.ok(result.graph.edges.find(e =>
                (edge.distance === e.distance &&
                    (edge.source === e.source && edge.target === e.target ||
                        edge.source === e.target && edge.target === e.source)))))
            test.deepEqual(result.matrix, matrix)
            test.done()
        })
}

module.exports = {
    testGoeburstComparatorDistanceRule,
    testGoeburstComparatorLvCountRule,
    testGoeburstComparatorIdRule,
    testGoeburstBoruvka,
    testGoeburstKruskal,
    testGoeburstPrim
}