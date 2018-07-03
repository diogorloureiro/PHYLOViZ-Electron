'use strict'

const comparators = require('../services/data-processor/comparators')

function testGoeburstComparatorDistanceRule(test) {
    const p = { distance: 1 }
    const q = { distance: 10 }
    test.strictEqual(comparators.goeburst(p, q), -9)
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
    test.equal(comparators.goeburst(p, q, 3), -2)
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
    test.strictEqual(comparators.goeburst(p, q, 1), -9)
    test.done()
}

module.exports = {
    testGoeburstComparatorDistanceRule,
    testGoeburstComparatorLvCountRule,
    testGoeburstComparatorIdRule
}