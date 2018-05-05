'use strict'

module.exports = Project

function Project(_id, _rev, name, users, dataset, computations = []) {
	this._id = _id
	if (_rev) this._rev = _rev
	this.name = name
	this.users = users
	this.dataset = dataset
	this.computations = computations
	this.addComputation = function (computation) {
		computations.push(computation)
	}
}