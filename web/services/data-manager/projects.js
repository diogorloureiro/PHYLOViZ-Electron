'use strict'

const pouchdb = require('pouchdb')
const uuid = require('uuid/v4')

module.exports = { loadProject, saveProject, getUser }

const localDB = new PouchDB('projects')
const remoteDB = new PouchDB('Still no link')

function loadprojects(options, cb){
    const db = options.local ? localDB : remoteDB

}

function loadProject(options, cb) {
    const db = options.local ? localDB : remoteDB

}

function createProject(options, name, dataset, cb) {
    const project = {
        _id: uuid(),
        name,
        dataset,
        computations: []
    }
    saveProject(options, project, error => cb(error, project._id))
}

function saveProject(options, project, cb) {
    const db = options.local ? localDB : remoteDB
    db.put(data).then(data => cb(), error => cb(error))
}

function saveComputation(options, project, algorithm, mst, cb){
    const size = project.computations.push({
        algorithm,
        mst,
        views: {}
    })
    saveProject(options, project, error => cb(error, size - 1))
}

function saveView(options, project, index, algorithm, view, cb){
    project.computations[index].views[algorithm] = view
    saveProject(options, project)
}

function loadLocalProjects(cb){

}

function loadRemoteProjects(username, cb) {

}
