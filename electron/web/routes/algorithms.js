'use strict'

const router = require('express').Router()
const { process, comparator } = require('../services/data-processor').goeburst

router.post('/goeburst', respond(req => {
    const profiles = req.body
    return process(profiles, comparator)
}))

function respond(service) {
	return (req, res, next) => service(req)
		.then(result => res.send(result))
		.catch(err => next(err))
}

module.exports = router