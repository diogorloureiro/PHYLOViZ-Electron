'use strict'

const fs = require('fs')
const datasets = require('../services/data-manager').datasets

module.exports = {
    test_parsing_from_file
}

/**
 * Tests the parsing method
 * @param {*} test 
 */
function test_parsing_from_file(test) {
    datasets.loadDatasetFromFile('./tests/data/input/mhaemolytica.txt', (err, profiles) => {
        test.ok(!err, "failed to read from file")
        test.deepEqual(profiles,JSON.parse(fs.readFileSync('./tests/data/input/test_parsing_from_file.json', 'utf8')))
        test.done()
    })
}
