'use strict'

module.exports = Project 

function Project(_id, name, dataset, computations = []) {
    this._id = _id
    this.name = name
    this.dataset = dataset
    this.computations = computations
}

project.prototype.addComputation = 