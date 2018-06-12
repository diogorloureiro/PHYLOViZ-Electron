'use strict'

const fs = require('../fspromises')
const services = require('../services/data-manager/datasets')

function testLoadDatasetsList(test) {
    test.expect(5)
    services.loadDatasetsList()
        .then(datasets => {
            const dataset = datasets[0]
            test.ok(typeof dataset.name === 'string')
            test.ok(typeof dataset.count === 'number')
            test.ok(typeof dataset.url === 'string')
            test.ok(typeof dataset.loci[0].name === 'string')
            test.ok(typeof dataset.loci[0].url === 'string')
            test.done()
        })
}

function testLoadDatasetFromUrl(test) {
    test.expect(3)
    services.loadDatasetFromUrl('https://pubmlst.org/data/profiles/bbacilliformis.txt')
        .then(profiles => {
            const profile = profiles.body[0]
            test.ok(typeof profiles.head[0] === 'string')
            test.ok(typeof profile.id === 'number')
            test.ok(typeof profile.loci[0] === 'number')
            test.done()
        })
}

function testLoadDatasetFromFile(test) {
    test.expect(1)
    fs.readFile('./tests/inputs/testLoadDatasetFromFile.txt')
        .then(data => services.loadDatasetFromFile({ buffer: data }))
        .then(profiles => {
            const expected = {
                head: ['adk', 'aroE', 'deoD', 'gapDH', 'gnd', 'mdh', 'zwf', 'clonal_complex'],
                body: [
                    { id: 1, loci: [1, 2, 1, 2, 1, 2, 1] },
                    { id: 2, loci: [2, 1, 1, 1, 2, 1, 2] },
                    { id: 3, loci: [2, 1, 1, 3, 2, 1, 3] },
                    { id: 4, loci: [2, 1, 1, 3, 2, 1, 2] },
                    { id: 5, loci: [3, 1, 2, 2, 2, 1, 1] }
                ]
            }
            test.deepEqual(profiles, expected)
            test.done()
        })
}

function testLoadAncillaryDataFromFile(test) {
    test.expect(1)
    fs.readFile('./tests/inputs/testLoadAncillaryDataFromFile.db')
        .then(data => services.loadAncillaryDataFromFile({ buffer: data }))
        .then(profiles => {
            const expected = {
                head: ['id', 'strain', 'st', 'country', 'yeaR', 'age_yR', 'sex', 'diagnosis1', 'diagnosis2', 'diagnosis3', 'source'],
                body: [
                    { id: 1, strain: 'NCTC11906-19F', st: 1, country: 'UK', yeaR: 1978 },
                    { id: 2, strain: 'SAF-17244-19', st: 52, country: 'South Africa' },
                    { id: 3, strain: 'PJ23/1', st: 300, country: 'Sweden', yeaR: 1992, source: 'blood' },
                    { id: 4, strain: 'SP264-23F', st: 81, country: 'Spain', yeaR: 1984, age_yR: 67, diagnosis1: 'pneumonia', source: 'blood' },
                    { id: 5, strain: '87-029044-14', st: 20, country: 'Slovakia', yeaR: 1987 }
                ]
            }
            test.deepEqual(profiles, expected)
            test.done()
        })
}

module.exports = {
    testLoadDatasetsList,
    testLoadDatasetFromUrl,
    testLoadDatasetFromFile,
    testLoadAncillaryDataFromFile
}