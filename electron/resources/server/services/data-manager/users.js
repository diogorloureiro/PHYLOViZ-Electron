'use strict'

const PouchDB = require('pouchdb')
const bcrypt = require('bcrypt')
const uuid = require('uuid/v4')
const RequestError = require('../RequestError')

function init(name) {
	const db = name ? new PouchDB(name) : new PouchDB('database')

	function authenticate(username, password) {
		return db.get(username)
			.then(user => bcrypt.compare(password, user.hash))
			.then(equal => {
				if (!equal) throw new RequestError('Wrong credentials', 401)
				return user
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
				() => { throw new RequestError(`User ${username} already exists`, 403) },
				() => bcrypt.hash(password, 10))
			.then(hash => {
				user.hash = hash
				return db.put(user)
			})
	}

	function loadUser(username) {
		return db.get(username)
	}

	function createProject(user, name, dataset) {
		const _id = uuid()
		user.projects[_id] = name
		const project = {
			_id,
			name,
			owner: user._id,
			contributors: {},
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
				return project
			})
	}

	function loadProject(user, _id) {
		return db.get(_id)
			.then(project => {
				if (project.owner !== user._id && !project.users[user._id])
					throw new RequestError('Not Found', 404)
				return project
			})
	}

	function saveProject(user, project) {
		return new Promise((resolve, reject) =>
			(project.owner === user._id || project.users[user._id]) ? resolve() : reject(new RequestError('Not Found', 404)))
			.then(() => db.put(project))
			.then(res => {
				project._rev = res._rev
				return project
			})
	}

	function deleteProject(user, id) {
		return db.get(id)
			.then(project => {
				if (project.owner === user._id) {
					delete user.projects[id]
					return db.put(user).then(() => db.remove(project))
				} else if (project.contributors[user._id]) {
					delete user.shared[id]
					return db.put(user)
				} else
					throw new RequestError('Not Found', 404)
			})
	}

	function shareProject(owner, contributor, id, name) {
		return db.get(id)
			.then(project => {
				if (project.owner !== owner._id)
					throw new RequestError('Only the owner can share the project', 401)
				if (owner._id === contributor || project.contributors[contributor])
					throw new RequestError('User already has access to project', 403)
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

	return {
		authenticate,
		register,
		loadUser,
		createProject,
		loadProject,
		saveProject,
		deleteProject,
		shareProject
	}
}

module.exports = init