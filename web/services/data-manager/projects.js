'use strict'

const pouchdb = require('pouchdb')
const authentication = require('pouchdb-authentication')
const bcrypt = require('bcrypt')
const uuid = require('uuid/v4')
const Project = require('../../model/Project')

module.exports = { logIn, register, loadProject, createProject, saveProject }

const localDB = new PouchDB('projects')
const remoteDB = new PouchDB('Still no link')

// Choose database (local or remote) accordingly
function getDB(local) {
	return local ? localDB : remoteDB
}

// Log in user given it's username and password
function logIn(local, username, password, cb) {
	getDB(local).get(username, function (err, user) {
		const error = err || user.error
		if (error) return cb(error)
		bcrypt.compare(password, user.hash, function (err, res) {
			cb(err || !res, user)
		})
	})
}

// Register user given a username and password
function register(local, username, password, cb) {
	const db = getDB(local)
	db.get(username, function (err, user) {
		if (err) return cb(err)
		if (!user.error) return cb(`User ${username} already exists`)
		const saltRounds = 10
		bcrypt.hash(password, saltRounds, function (err, hash) {
			if (err) return cb(err)
			user = {
				_id = username,
				hash,
				projects = []
			}
			db.put(user, function (err) {
				cb(err, user)
			})
		})
	})
}

// Load user's project given it's id
function loadProject(local, user, _id, cb) {
	if (!user.projects[_id]) return cb(new Error('Not Found'))
	getDB(local).get(_id, cb)
}

// Create a new project given a name and dataset
function createProject(local, user, name, dataset, cb) {
	const db = getDB(local)
	const _id = uuid()
	user.projects[_id] = name
	db.put(user, function (err) {
		if (err) return cb(err)
		db.put(new Project(_id, name, dataset), cb)
	})
}

// Save user's project
function saveProject(local, user, project, cb) {
	if (!user.projects[project._id]) return cb(new Error('Not Found'))
	getDB(local).put(project, cb)
}