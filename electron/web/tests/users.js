'use strict'

const fs = require('fs')
const PouchDB = require('pouchdb')
const users = require('../services/data-manager/users').init('./tests/mockdatabase')
const newDb = users.db

//Tests register method
function testRegister(test) {
    users.register('Bruno', '123')
        .then(user => {
            test.equal(user._id, 'Bruno')
            newDb.get('Bruno').then((res) => newDb.remove(res).then(() => test.done()))
        })
}

function testAuthenticate(test) {
    users.register('Luana', '123')
        .then(() => {
            users.authenticate('Luana', '123').then(user => {
                test.equal('Luana', user._id)
                newDb.get('Luana').then((res) => newDb.remove(res).then(() => test.done()))
            })
        })
}

function testCreateProject(test) {
    const dataset = fs.readFileSync('./tests/data/input/spneumoniaeClean.txt', 'utf8')
    users.register('Diogo', '123')
        .then(() =>
            newDb.get('Diogo')
                .then(user =>
                    users.createProject(user, 'Estirpe da Banana', dataset))
                .then(doc => newDb.get(doc.project._id))
                .then(respProject => {
                    newDb.get('Diogo').then(respUser => {
                        test.equal(respUser.projects[respProject._id], respProject.name) //Check project name
                        test.strictEqual(dataset, respProject.dataset) //check dataset data
                        newDb.remove(respUser).then(() => newDb.remove(respProject).then(() => test.done()))
                    })
                })
        )
}

function testLoadProject(test) {
    users.register('Tiago', '123')
        .then(() =>
            newDb.get('Tiago')
                .then(user =>
                    users.createProject(user, 'Estirpe da Banana', ' ')
                        .then(doc => users.loadProject(user, doc.project._id)))
                .then(project => {
                    test.equal(project.dataset, ' ')
                    newDb.remove(project)
                })
                .then(() => newDb.get('Tiago'))
                .then(leonardo => newDb.remove(leonardo))
                .then(() => test.done())
        )

}

function testSaveProject(test) {
    let dataset = fs.readFileSync('./tests/data/input/spneumoniaeClean.txt', 'utf8')
    users.register('Leonardo', '123')
        .then(() => newDb.get('Leonardo'))
        .then(user => {
            users.createProject(user, 'Estirpe da Banana', dataset)
                .then(doc => newDb.get(doc.project._id))
                .then(respProject =>
                    newDb.get('Leonardo')
                        .then(respUser => {
                            respProject.dataset = ' '
                            users.saveProject(respUser, respProject)
                                .then(() => newDb.get(respProject._id))
                                .then((savedProj) => test.equal(savedProj.dataset, ' '))
                                .then(() => newDb.get(respProject._id))
                                .then((prj) => newDb.remove(prj))
                                .then(() => newDb.remove(respUser))
                                .then(() => test.done())
                        })
                )
        })
}

function testShareProject(test) {
    users.register('Diogo', '123')
        .then(() => users.register('Leonardo', '123'))
        .then(() => newDb.get('Leonardo'))
        .then(user => users.createProject(user, 'Estirpe da Banana', ' '))
        .then(doc =>
            newDb.get('Leonardo')
                .then(leo => users.shareProject(leo, 'Diogo', doc.project._id, 'Estirpe da Banana'))
                .then(() => newDb.get('Diogo'))
                .then(diogo => {
                    test.equal(diogo.shared[doc.project._id], doc.project.name)
                    newDb.remove(diogo)
                })
                .then(() => newDb.get(doc.project._id))
                .then(project => newDb.remove(project))
                .then(() => newDb.get('Leonardo'))
                .then(leonardo => newDb.remove(leonardo))
                .then(() => test.done())
        )
}

module.exports = { testRegister, testAuthenticate, testCreateProject, testSaveProject, testShareProject, testLoadProject }