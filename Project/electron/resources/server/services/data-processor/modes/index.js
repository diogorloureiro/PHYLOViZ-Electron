'use strict'

const sequential = require('./sequential')
const promises = require('./promises')
const kue = require('./kue')

module.exports = {
    sequential,
    promises,
    kue
}