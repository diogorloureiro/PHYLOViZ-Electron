'use strict'

const PouchDB = require('pouchdb')
const bcrypt = require('bcrypt')
const uuid = require('uuid/v4')

module.exports = { authenticate, register, loadUser, loadProject, createProject, saveProject }

const db = new PouchDB('projects')

function authenticate(username, password) {
	return db.get(username)
		.then(user => {
			if (user.error) throw new Error(user.error)
			return bcrypt.compare(password, user.hash)
				.then(equal => {
					if (!equal) throw new Error('Wrong credentials.')
					return user
				})
		})
}

function register(username, password) {
	const user = {
		_id: username,
		projects: {},
		shared: {}
	}
	return db.get(username)
		.then(
			() => { throw new Error(`User ${username} already exists.`) },
			() => bcrypt.hash(password, 10))
		.then(hash => {
			user.hash = hash
			return db.put(user)
		})
		.then(res => {
			user._rev = res._rev
			return user
		})
}

function loadUser(username) {
	return db.get(username)
}

function loadProject(user, _id) {
	return db.get(_id)
		.then(project => {
			if (project.owner !== user._id && !project.users[user._id])
				throw new Error('Not Found')
			return project
		})
}

function createProject(user, name, dataset, cb) {
	const _id = uuid()
	user.projects[_id] = name
	const project = {
		_id,
		name,
		owner: user._id,
		users: {},
		dataset,
		computations: []
	}
	return db.put(user)
		.then(res => {
			user._rev = res._rev
			return db.put(project)
		})
		.then(res => {
			project._rev = res._rev
			return { user, project }
		})
}

function saveProject(user, project, cb) {
	return new Promise((resolve, reject) =>
		(project.owner === user._id || project.users[user._id]) ? resolve() : reject(new Error('Not Found')))
		.then(() => {
			if (user.projects[project._id] !== project.name) {
				user.projects[project._id] = project.name
				return db.put(user)
					.then(res => user._rev = res._rev)
			}
		})
		.then(() => db.put(project))
		.then(res => {
			project._rev = res._rev
			return { user, project }
		})
}

function shareProject(owner, contributor, id, name, cb) {
	return db.get(id)
		.then(project => {
			if (project.owner !== owner._id)
				throw new Error('Unauthorized')
			if (owner._id === contributor || project.contributors[contributor])
				throw new Error('Duplicated')
			return db.get(contributor)
				.then(user => {
					user.shared[id] = name
					return db.put(user)
				})
				.then(() => {
					project.contributors[contributor] = contributor
					return db.put(project)
				})
				.then(res => {
					project._rev = res._rev
					return project
				})
		})
}