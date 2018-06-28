'use strict'

const router = require('express').Router()
const response = require('./response')
const { process, goeburst } = require('../services/data-processor')

// Process profiles using goeburst algorithm and comparator
router.post('/algorithms/goeburst', response(req => process(goeburst.algorithm, goeburst.comparator, req.body)))

module.exports = router