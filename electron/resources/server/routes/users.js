'use strict'

const router = require('express').Router()
const passport = require('passport')
const Strategy = require('passport-local').Strategy
const response = require('./response')
const RequestError = require('../services/RequestError')
const services = require('../services/data-manager').users()

passport.use(new Strategy((username, password, done) =>
	services.authenticate(username, password)
		.then(user => done(null, user))
		.catch(err => done(err))))

passport.serializeUser((user, done) => done(null, user._id))

passport.deserializeUser((username, done) =>
	services.loadUser(username)
		.then(user => done(null, user))
		.catch(err => done(err)))

// Authenticate user
router.post('/login', passport.authenticate('local'), (req, res) => res.sendStatus(200))

// Register user
router.post('/register', response(req => services.register(req.body.username, req.body.password)))

// Check if user is authenticated in order to reach the endpoints defined below
router.use((req, res, next) => req.isAuthenticated() ? next() : next(new RequestError('Unauthorized', 401)))

// Log out user
router.post('/logout', (req, res) => {
	req.logout()
	res.sendStatus(200)
})

// Create project
router.post('/projects', response(req => services.createProject(req.user, req.body.name, req.body.dataset)))

// Load project
router.get('/projects/:id', response(req => services.loadProject(req.user, req.params.id)))

// Save project
router.put('/projects/:id', response(req => services.saveProject(req.user, req.params.id, req.body)))

// Delete project
router.delete('/projects/:id', response(req => services.deleteProject(req.user, req.params.id)))

// Share project
router.post('/projects/:id/share/:contributor', response(req => services.shareProject(req.user, req.params.contributor, req.params.id, req.body)))

module.exports = router