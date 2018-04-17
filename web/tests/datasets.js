'use strict'

const fs = require('fs')
const datasets = require('../services/data-manager').datasets

module.exports = {
    test_parsingFromFile,
    test_loadDatasetsFromPubMLST,
    test_specificDatasetFromPubMLST
}

//Tests the parsing files method
function test_parsingFromFile(test) {
    datasets.loadDatasetFromFile('./tests/data/input/mhaemolytica.txt', (err, profiles) => {
        test.ok(!err, "failed to read from file")
        test.deepEqual(profiles, JSON.parse(fs.readFileSync('./tests/data/input/test_parsing_from_file.json', 'utf8')))
        test.done()
    })
}

// Tests the get method for all datasets
function test_loadDatasetsFromPubMLST(test) {
    datasets.loadDatasetsList((err, data) => {
        const single_dataset = JSON.parse(fs.readFileSync('./tests/data/output/test_loadDatasetsFromPubMLSTOutput.json','utf8'))
        const achromobacter = data.filter((node) => { return node.name == "Achromobacter spp." })[0]
        test.deepEqual(single_dataset, achromobacter)
        test.done()
    })
}

// Tests the get method for a specific dataset
function test_specificDatasetFromPubMLST(test) {
    datasets.loadDatasetFromPubMLST('https://pubmlst.org/data/profiles/bbacilliformis.txt', (err,profiles) => {
        const expected = JSON.parse(fs.readFileSync('./tests/data/output/test_specificDatasetFromPubMLST.json','utf8'))
        test.deepEqual(profiles,expected)
        test.done()
    })
}
