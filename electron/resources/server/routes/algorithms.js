'use strict'

const router = require('express').Router()
const response = require('./response')
const { goeburst } = require('../services/data-processor')

// Process profiles using goeburst algorithm and comparator
router.post('/algorithms/goeburst', response(req => goeburst.process(req.body, goeburst.comparator)))

module.exports = router