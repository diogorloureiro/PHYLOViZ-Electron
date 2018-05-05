'use strict'

const fs = require('fs')
const datasets = require('../services/data-manager').datasets

module.exports = {
    testParsingFromFile,
    testLoadDatasetsFromPubMLST,
    testSpecificDatasetFromPubMLST
}

//Tests the parsing files method
function testParsingFromFile(test) {
    fs.readFile('./tests/data/input/mhaemolytica.txt', (err, data) => {
        datasets.loadDatasetFromFile({ 'buffer': data }, (err, profiles) => {
            test.ok(!err, "failed to read from file")
            test.deepEqual(profiles, JSON.parse(fs.readFileSync('./tests/data/input/testParsingFromFile.json', 'utf8')))
            test.done()
        })
    })

}

// Tests the get method for all datasets
function testLoadDatasetsFromPubMLST(test) {
    datasets.loadDatasetsList((err, data) => {
        const single_dataset = JSON.parse(fs.readFileSync('./tests/data/output/testLoadDatasetsFromPubMLST.json', 'utf8'))
        const achromobacter = data.filter(node => node.name == 'Achromobacter spp.')[0]
        test.deepEqual(single_dataset, achromobacter)
        test.done()
    })
}

// Tests the get method for a specific dataset
function testSpecificDatasetFromPubMLST(test) {
    datasets.loadDatasetFromPubMLST('https://pubmlst.org/data/profiles/bbacilliformis.txt', (err, profiles) => {
        const expected = JSON.parse(fs.readFileSync('./tests/data/output/testSpecificDatasetFromPubMLST.json', 'utf8'))
        test.deepEqual(profiles, expected)
        test.done()
    })
}
