'use strict'

const router = require('express').Router()
const { process, comparator } = require('../services/data-processor').goeburst

router.post('/goeburst', (req, res, next) => {
    const profiles = req.body
    process(profiles, comparator).then(data => {
        res.send(data)
    })
})

module.exports = router