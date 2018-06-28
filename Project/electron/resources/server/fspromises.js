'use strict'

const fs = require('fs')

function readFile(path) {
    return new Promise((resolve, reject) => fs.readFile(path, (err, data) => err ? reject(err) : resolve(data)))
}

function writeFile(path, data) {
    return new Promise((resolve, reject) => fs.writeFile(path, data, err => err ? reject(err) : resolve()))
}

function unlink(path) {
    return new Promise((resolve, reject) => fs.unlink(path, err => err ? reject(err) : resolve()))
}

module.exports = {
    readFile,
    writeFile,
    unlink
}