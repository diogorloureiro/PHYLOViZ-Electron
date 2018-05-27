'use strict'

module.exports = Computation

function Computation(algorithm, mst, views = {}) {
	this.algorithm = algorithm
	this.mst = mst
	this.views = views
	this.addView = function (algorithm, view) {
		views[algorithm] = view
	}
}