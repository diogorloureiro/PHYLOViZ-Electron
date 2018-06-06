'use strict'

const router = require('express').Router()
const passport = require('passport')
const Strategy = require('passport-local').Strategy
const services = require('../services/data-manager').users

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
router.post('/login', passport.authenticate('local', {
	successFlash: 'Welcome!',
	failureFlash: 'Invalid username or password...'
}), (req, res) => res.send(req.user))

// Register user
router.post('/register', respond(req => {
	const { username, password } = req.body
	return services.register(username, password)
}))

// Check if user is authenticated in order to reach the endpoints below
router.use((req, res, next) => req.isAuthenticated() ? next() : next(new Error('Unauthorized')))

// Log out user
router.post('/logout', req => req.logout())

// Create project
router.post('/projects', respond(req => {
	const { name, dataset } = req.body
	return services.createProject(req.user, name, dataset)
}))

// Load project
router.get('/projects/:id', respond(req => {
	const { id } = req.path
	services.loadProject(req.user, id)
}))

// Save project
router.put('/projects/:id', respond(req => {
	const { project } = req.body
	return services.saveProject(req.user, project)
}))

// Share project
router.post('/projects/:id/share/:contributor', respond(req => {
	const { id, contributor } = req.path
	return services.shareProject(req.user, contributor, id)
}))

function respond(service) {
	return (req, res, next) => service(req)
		.then(result => res.send(result))
		.catch(err => next(err))
}

module.exports = router