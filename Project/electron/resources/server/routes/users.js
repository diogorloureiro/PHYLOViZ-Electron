'use strict'

const router = require('express').Router()
const jwt = require('jsonwebtoken')
const upload = require('multer')()
const PouchDB = require('pouchdb')

const response = require('./response')
const config = require('../config')
const RequestError = require('../RequestError')
const services = require('../services/data-manager').users(new PouchDB(config.database))

// Authenticate user
router.post('/login', response(req => services.login(req.body.username, req.body.password)
	.then(user => ({ token: jwt.sign({ _id: user._id, hash: user.hash }, config.secret) }))))

// Register user
router.post('/register', response(req => services.register(req.body.username, req.body.password)))

// Check if user is authenticated in order to reach the endpoints defined
function authenticate(req, res, next) {
	const [schema, token] = req.get('Authorization').split(' ')
	if (schema !== 'Bearer')
		next(new RequestError('Unsupported authorization schema', 401))
	new Promise((resolve, reject) => jwt.verify(token, config.secret, (err, decoded) => err ? reject(err) : resolve(decoded)))
		.then(({ _id, hash }) => services.loadUser(_id)
			.then(user => {
				if (user.hash !== hash)
					return next(new RequestError('Wrong credentials', 401))
				req.user = user
				next()
			}))
		.catch(() => next(new RequestError('Wrong credentials', 401)))
}

// Load user
router.get('/user', authenticate, (req, res) => res.send(req.user))

// Create project
router.post('/projects', authenticate, response(req => services.createProject(req.user, req.body.name, req.body.dataset, req.body.ancillary)))

// Import project
router.post('/projects/import', authenticate, upload.single('file'), response(req => services.importProject(req.user, req.file)))

// Load project
router.get('/projects/:id', authenticate, response(req => services.loadProject(req.user, req.params.id)))

// Export project
router.get('/projects/:id/export', authenticate, response(req => services.exportProject(req.user, req.params.id)))

// Add computation to project
router.put('/projects/:id', authenticate, response(req => services.addComputation(req.user, req.params.id, req.body.algorithm, req.body.lvs, req.body.computation)))

// Delete project
router.delete('/projects/:id', authenticate, response(req => services.deleteProject(req.user, req.params.id)))

// Share project
router.post('/projects/:id/share/:contributor', authenticate, response(req => services.shareProject(req.user, req.params.contributor, req.params.id, req.body.name)))

module.exports = router