'use strict'

const router = require('express').Router()
const multer = require('multer')
const upload = multer()
const service = require('../services/data-manager/datasets')

router.get('/datasets', (req, res, next) => {
    service.loadDatasetsList((err, datasets) => {
        if (err) return next(err)
        res.send(datasets)
    })
})

router.get('/pubmlst-datasets', (req, res, next) => {
    const url = req.query.url
    service.loadDatasetFromPubMLST(url, (err, profiles) => {
        if (err) return next(err)
        res.send(profiles)
    })
})

router.post('/file-datasets', upload.single('file'), (req, res, next) => {
    service.loadDatasetFromFile(req.file, (err, profiles) => {
        if (err) return next(err)
        res.send(profiles)
    })
})

module.exports = router