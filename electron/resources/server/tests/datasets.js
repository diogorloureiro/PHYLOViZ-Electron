'use strict'

const fs = require('../fspromises')
const services = require('../services/data-manager/datasets')

function testLoadDatasetsList(test) {
    test.expect(5)
    services.loadDatasetsList()
        .then(datasets => {
            test.ok(typeof datasets[0].name === 'string')
            test.ok(typeof datasets[0].count === 'number')
            test.ok(typeof datasets[0].url === 'string')
            test.ok(typeof datasets[0].loci[0].name === 'string')
            test.ok(typeof datasets[0].loci[0].url === 'string')
            test.done()
        })
}

function testLoadDatasetFromUrl(test) {
    test.expect(2)
    services.loadDatasetFromUrl('https://pubmlst.org/data/profiles/bbacilliformis.txt')
        .then(profiles => {
            test.ok(typeof profiles[0].id === 'number')
            test.ok(typeof profiles[0].loci[0] === 'number')
            test.done()
        })
}

function testLoadDatasetFromFile(test) {
    test.expect(1)
    fs.readFile('./tests/inputs/testLoadDatasetFromFile.txt')
        .then(data => services.loadDatasetFromFile({ buffer: data }))
        .then(profiles => {
            const expected = [
                { id: 1, loci: [1, 2, 1, 2, 1, 2, 1] },
                { id: 2, loci: [2, 1, 1, 1, 2, 1, 2] },
                { id: 3, loci: [2, 1, 1, 3, 2, 1, 3] },
                { id: 4, loci: [2, 1, 1, 3, 2, 1, 2] },
                { id: 5, loci: [3, 1, 2, 2, 2, 1, 1] }
            ]
            test.deepEqual(profiles, expected)
            test.done()
        })
}

module.exports = {
    testLoadDatasetsList,
    testLoadDatasetFromUrl,
    testLoadDatasetFromFile
}