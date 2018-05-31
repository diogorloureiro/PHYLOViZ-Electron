'use strict'

const router = require('express').Router()
const upload = require('multer')()
const services = require('../services/data-manager').datasets

// Load datasets list from PubMLST
router.get('/datasets/pubmlst', respond(req => services.loadDatasetsList()))

// Load dataset from PubMLST
router.get('/datasets/:url', respond(req => services.loadDatasetFromUrl(req.params.url)))

// Load dataset from file
router.post('/datasets/file', upload.single('file'), respond(req => services.loadDatasetFromFile(req.file)))

function respond(service) {
	return (req, res, next) => service(req)
		.then(result => res.send(result))
		.catch(err => next(err))
}

module.exports = router