'use strict'

const passport = require('passport')
const Strategy = require('passport-local').Strategy
const service = require('../services/data-manager/users')
const router = require('express').Router()

passport.use(new Strategy((username, password, cb) => {
	service.authenticate(username, password, cb)
}))

// Authenticate user
router.post('/login', passport.authenticate('local', {
	successFlash: 'Welcome!',
	failureFlash: 'Invalid username or password.'
}))

// Register a new user
router.post('/register', (req, res, next) => {
	const { username, password } = req.body
	service.register(username, password, (err, user, info) => {
		if (err) return next(err)
		if (info) {
			req.flash('error', info)
			return next(new Error(info))
		}
		req.flash('info', 'Successfully registered.')
		res.sendStatus(200)
	})
})

// Get a user's project
router.get('/users/:username/projects/:id', (req, res, next) => {
	const { username, id } = req.path
	service.loadProject(username, id, (err, project) => {
		if (err) return next(err)
		res.send(project)
	})
})

// Create a new project
router.post('/users/:username/projects', (req, res, next) => {
	const { name, dataset } = req.body
	service.createProject(req.path.username, name, dataset, (err, user, project) => {
		if (err) return next(err)
		res.send(project)
	})
})

// Edit an existing project
router.put('/users/:username/projects/:id', (req, res, next) => {
	service.saveProject(req.path.username, req.body.project, err => {
		if (err) return next(err)
		req.flash('Project successfully saved.')
	})
})

router.post('/logout', (req, res) => {
	req.logout()
})

passport.serializeUser((user, cb) => {
	cb(null, user._id)
})

passport.deserializeUser((username, cb) => {
	service.getUser(username, cb)
})

module.exports = router