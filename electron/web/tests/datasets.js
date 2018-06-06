'use strict'

const fs = require('fs')
const datasets = require('../services/data-manager').datasets

function testLoadDatasetsList(test) {
    datasets.loadDatasetsList((err, data) => {
        const single_dataset = JSON.parse(fs.readFileSync('./tests/data/output/testLoadDatasetsList.json', 'utf8'))
        const achromobacter = data.filter(node => node.name == 'Achromobacter spp.')[0]
        test.deepEqual(single_dataset, achromobacter)
        test.done()
    })
}

function testLoadDatasetFromUrl(test) {
    datasets.loadDatasetFromUrl('https://pubmlst.org/data/profiles/bbacilliformis.txt', (err, profiles) => {
        const expected = JSON.parse(fs.readFileSync('./tests/data/output/testLoadDatasetFromUrl.json', 'utf8'))
        test.deepEqual(profiles, expected)
        test.done()
    })
}

function testLoadDatasetFromFile(test) {
    fs.readFile('./tests/data/input/mhaemolytica.txt', (err, data) => {
        datasets.loadDatasetFromFile({ buffer: data }, (err, profiles) => {
            test.ok(!err, 'failed to read from file')
            test.deepEqual(profiles, JSON.parse(fs.readFileSync('./tests/data/input/testLoadDatasetFromFile.json', 'utf8')))
            test.done()
        })
    })
}

module.exports = {
    testLoadDatasetsList,
    testLoadDatasetFromUrl,
    testLoadDatasetFromFile
}