'use strict'

const router = require('express').Router()
const response = require('./response')
const { process, goeburst, algorithms } = require('../services/data-processor')

// Process profiles using goeburst algorithm and comparator
router.post('/process', response(req => {
    const { processor = goeburst.processor, comparator = goeburst.comparator, algorithm = algorithms.boruvka, profiles } = req.body
    return process(processor, comparator, algorithm, profiles)
}))

module.exports = router