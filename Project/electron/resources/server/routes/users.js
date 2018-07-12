'use strict'

const router = require('express').Router()
const upload = require('multer')()
const response = require('./response')
const RequestError = require('../RequestError')
const services = require('../services/data-manager').users()

// Authenticate user
router.post('/login', response(req => services.login(req.body.username, req.body.password)))

// Register user
router.post('/register', response(req => services.register(req.body.username, req.body.password)))

// Check if user is authenticated in order to reach the endpoints defined below
router.use((req, res, next) => {
	const [schema, token] = req.get('Authorization').split(' ')
	if (schema !== 'Bearer')
		next(new RequestError('Unsupported authorization schema', 401))
	services.authenticate(token)
		.then(user => {
			req.user = user
			next()
		})
		.catch(err => next(err))
})

// Load user
router.get('/user', (req, res) => res.send(req.user))

// Create project
router.post('/projects', response(req => services.createProject(req.user, req.body.name, req.body.dataset, req.body.ancillary)))

// Import project
router.post('/projects/import', upload.single('file'), response(req => services.importProject(req.user, req.file)))

// Load project
router.get('/projects/:id', response(req => services.loadProject(req.user, req.params.id)))

// Export project
router.get('/projects/:id/export', response(req => services.exportProject(req.user, req.params.id)))

// Add computation to project
router.put('/projects/:id', response(req => services.addComputation(req.user, req.params.id, req.body.algorithm, req.body.lvs, req.body.computation)))

// Delete project
router.delete('/projects/:id', response(req => services.deleteProject(req.user, req.params.id)))

// Share project
router.post('/projects/:id/share/:contributor', response(req => services.shareProject(req.user, req.params.contributor, req.params.id, req.body.name)))

module.exports = router