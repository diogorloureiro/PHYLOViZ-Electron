'use strict'

const router = require('express').Router()
const response = require('./response')
const process = require('../services/data-processor')('promises')

// Process profiles using goeburst algorithm and comparator
router.post('/process', response(req => {
    const { processor, comparator, algorithm, profiles, lvs } = req.body
    return process(processor, comparator, algorithm, profiles, lvs)
}))

module.exports = router