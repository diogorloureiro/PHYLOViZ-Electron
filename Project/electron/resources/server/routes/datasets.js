'use strict'

const router = require('express').Router()
const upload = require('multer')()
const response = require('./response')
const services = require('../services/data-manager').datasets

// Load datasets list from PubMLST
router.get('/datasets/pubmlst', response(req => services.loadDatasetsList()))

// Load dataset from URL
router.get('/datasets/:url', response(req => services.loadDatasetFromUrl(req.params.url)))

// Load dataset from file
router.post('/datasets/file', upload.single('file'), response(req => services.loadDatasetFromFile(req.file)))

// Load ancillary data from file
router.post('/ancillary/file', upload.single('file'), response(req => services.loadAncillaryFromFile(req.file)))

// Load ancillary data from URL
router.get('/ancillary/:url', response(req => services.loadAncillaryFromURL(req.params.url)))

module.exports = router