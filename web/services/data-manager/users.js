'use strict'

const PouchDB = require('pouchdb')
const bcrypt = require('bcrypt')
const uuid = require('uuid/v4')
const Project = require('../../model/Project')

module.exports = { authenticate, register, loadProject, createProject, saveProject }

const db = new PouchDB('projects')

// Authenticate user given it's username and password
function authenticate(username, password, cb) {
	db.get(username, function (err, user) {
		const error = err || user.error
		if (error) return cb(error)
		bcrypt.compare(password, user.hash, (err, res) => cb(err || !res, user))
	})
}

// Register user given a username and password
function register(username, password, cb) {
	db.get(username, function (err, user) {
		if (!err) return cb(null, null, `User ${username} already exists.`)
		const saltRounds = 10
		bcrypt.hash(password, saltRounds, function (err, hash) {
			if (err) return cb(err)
			const user = { _id: username, hash, projects: {} }
			db.put(user, (err) => cb(err, user))
		})
	})
}

// Load user's project given it's id
function loadProject(user, _id, cb) {
	if (!user.projects[_id]) return cb(new Error('Not Found'))
	db.get(_id, function (err, project) {
		cb(err, new Project(project._id, project._rev, project.name, project.dataset, project.computations))
	})
}

// Create a new project given a name and dataset
function createProject(user, name, dataset, cb) {
	const _id = uuid()
	user.projects[_id] = name
	db.put(user, function (err) {
		if (err) return cb(err)
		const project = new Project(_id, undefined, name, dataset)
		db.put(project, (err) => cb(err, user, project))
	})
}

// Save user's project
function saveProject(user, project, cb) {
	if (!user.projects[project._id]) return cb(new Error('Not Found'))
	db.put(project, cb)
}