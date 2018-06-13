'use strict'

const PouchDB = require('pouchdb')
const bcrypt = require('bcryptjs')
const uuid = require('uuid/v4')
const RequestError = require('../../RequestError')

function init(db = new PouchDB('database')) {

	function authenticate(username, password) {
		return loadUser(username)
			.then(user => bcrypt.compare(password, user.hash)
				.then(equal => {
					if (!equal)
						throw new RequestError('Wrong credentials', 401)
					return user
				}))
	}

	function register(username, password) {
		return db.get(username)
			.then(
				() => { throw new RequestError(`User already exists`, 403) },
				() => bcrypt.hash(password, 10))
			.then(hash => {
				const user = {
					_id: username,
					hash,
					projects: [],
					shared: []
				}
				return db.put(user)
			})
	}

	function loadUser(username) {
		return db.get(username)
			.catch(() => { throw new RequestError('User not found', 404) })
	}

	function createProject(user, name, dataset) {
		const _id = uuid()
		user.projects.push({ _id, name })
		const project = {
			_id,
			name,
			owner: user._id,
			contributors: [],
			dataset,
			computations: {}
		}
		return db.put(user)
			.then(() => db.put(project))
			.then(res => {
				project._rev = res.rev
				return project
			})
	}

	function loadProject(user, _id) {
		return db.get(_id)
			.catch(() => { throw new RequestError('Project not found', 404) })
			.then(project => {
				if (project.owner !== user._id && !project.contributors.includes(user._id))
					throw new RequestError('Project not found', 404)
				return project
			})
	}

	function saveProject(user, _id, project) {
		return loadProject(user, _id)
			.then(old => {
				old.computations = project.computations
				return db.put(old)
					.then(res => {
						old._rev = res.rev
						return old
					})
			})
	}

	function deleteProject(user, _id) {
		return db.get(_id)
			.catch(() => { throw new RequestError('Project not found', 404) })
			.then(project => {
				if (project.owner === user._id) {
					user.projects = user.projects.filter(project => project._id !== _id)
					return db.put(user).then(() => db.remove(project))
				} else if (project.contributors.includes(user._id)) {
					user.shared = user.shared.filter(project => project._id !== _id)
					return db.put(user)
				} else
					throw new RequestError('Project not found', 404)
			})
	}

	function shareProject(owner, contributor, _id, name) {
		return db.get(_id)
			.catch(() => { throw new RequestError('Project not found', 404) })
			.then(project => {
				if (project.owner !== owner._id)
					throw new RequestError('Only the owner can share the project', 401)
				if (owner._id === contributor || project.contributors.includes(contributor))
					throw new RequestError('User already has access to project', 403)
				return db.get(contributor)
					.then(user => {
						user.shared.push({ _id, name })
						return db.put(user)
					})
					.then(() => {
						project.contributors.push(contributor)
						return db.put(project)
					})
					.then(res => {
						project._rev = res.rev
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