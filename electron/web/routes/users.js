'use strict'

const router = require('express').Router()
const passport = require('passport')
const Strategy = require('passport-local').Strategy
const response = require('./response')
const services = require('../services/data-manager').users

passport.use(new Strategy((username, password, done) =>
	services.authenticate(username, password)
		.then(user => done(null, user))
		.catch(done)))

passport.serializeUser((user, done) => done(null, user._id))

passport.deserializeUser((username, done) =>
	services.loadUser(username)
		.then(user => done(null, user))
		.catch(done))

// Authenticate user
router.post('/login', passport.authenticate('local', {
	successFlash: 'Welcome!',
	failureFlash: 'Invalid username or password...'
}))

// Register user
router.post('/register', response(req => services.register(req.body.username, req.body.password)))

// Check if user is authenticated in order to reach the endpoints below
router.use((req, res, next) => req.isAuthenticated() ? next() : next(new Error('Unauthorized')))

// Log out user
router.post('/logout', req => req.logout())

// Create project
router.post('/projects', response(req => services.createProject(req.user, req.body.name, req.body.dataset)))

// Load project
router.get('/projects/:id', response(req => loadProject(req.user, req.path.id)))

// Save project
router.put('/projects/:id', response(req => services.saveProject(req.user, req.body.project)))

// Delete project
router.delete('/projects/:id', response(req => services.deleteProject(req.user, req.path.id)))

// Share project
router.post('/projects/:id/share/:contributor', response(req => services.shareProject(req.user, req.path.contributor, req.path.id)))

module.exports = router