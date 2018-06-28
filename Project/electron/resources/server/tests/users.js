'use strict'

const PouchDB = require('pouchdb')
let services = require('../services/data-manager/users')
let db = new PouchDB('./tests/mockdatabase')

function before(test) {
    test.expect(0)
    db.destroy()
        .then(() => {
            db = new PouchDB('./tests/mockdatabase')
            services = services(db)
            test.done()
        })
}

function testRegister(test) {
    test.expect(3)
    services.register('User', 'Password')
        .then(() => services.loadUser('User'))
        .then(user => {
            test.strictEqual(user._id, 'User')
            test.deepEqual(user.projects, [])
            test.deepEqual(user.shared, [])
            test.done()
        })
}

function testRegisterDuplicated(test) {
    test.expect(0)
    services.register('User', 'Password')
        .catch(() => test.done())
}

function testAuthenticate(test) {
    test.expect(3)
    services.authenticate('User', 'Password')
        .then(user => {
            test.strictEqual(user._id, 'User')
            test.deepEqual(user.projects, [])
            test.deepEqual(user.shared, [])
            test.done()
        })
}

function testAuthenticateUnauthorized(test) {
    test.expect(0)
    services.authenticate('User', 'Error')
        .catch(() => test.done())
}

function testLoadUser(test) {
    test.expect(3)
    services.loadUser('User')
        .then(user => {
            test.strictEqual(user._id, 'User')
            test.deepEqual(user.projects, [])
            test.deepEqual(user.shared, [])
            test.done()
        })
}

function testCreateProject(test) {
    test.expect(8)
    services.loadUser('User')
        .then(user => services.createProject(user, 'Project', {}))
        .then(project => {
            test.strictEqual(project.name, 'Project')
            test.strictEqual(project.owner, 'User')
            test.deepEqual(project.contributors, [])
            test.deepEqual(project.dataset, {})
            test.deepEqual(project.computations, {})
            return services.loadUser('User')
                .then(user => {
                    test.strictEqual(user.projects.length, 1)
                    test.strictEqual(user.projects[0]._id, project._id)
                    test.strictEqual(user.projects[0].name, project.name)
                    test.done()
                })
        })
}

function testLoadProject(test) {
    test.expect(5)
    services.loadUser('User')
        .then(user => services.loadProject(user, user.projects[0]._id))
        .then(project => {
            test.strictEqual(project.name, 'Project')
            test.strictEqual(project.owner, 'User')
            test.deepEqual(project.contributors, [])
            test.deepEqual(project.dataset, {})
            test.deepEqual(project.computations, {})
            test.done()
        })
}

function testSaveProject(test) {
    test.expect(5)
    services.loadUser('User')
        .then(user => {
            const _id = user.projects[0]._id
            services.loadProject(user, _id)
                .then(project => {
                    project.name = 'Error'
                    project.owner = 'Error'
                    project.contributors = 'Error'
                    project.dataset = 'Error'
                    project.computations.goeburst = {}
                    return services.saveProject(user, _id, project)
                })
                .then(project => {
                    test.strictEqual(project.name, 'Project')
                    test.strictEqual(project.owner, 'User')
                    test.deepEqual(project.contributors, [])
                    test.deepEqual(project.dataset, {})
                    test.deepEqual(project.computations, { goeburst: {} })
                    test.done()
                })
        })
}

function testShareProject(test) {
    test.expect(5)
    services.register('Contributor', 'Password')
        .then(() => services.loadUser('User'))
        .then(user => {
            const { _id, name } = user.projects[0]
            return services.shareProject(user, 'Contributor', _id, name)
        })
        .then(project => {
            test.strictEqual(project.contributors.length, 1)
            test.strictEqual(project.contributors[0], 'Contributor')
            return services.loadUser('Contributor')
                .then(user => {
                    test.strictEqual(user.shared.length, 1)
                    test.strictEqual(user.shared[0]._id, project._id)
                    test.strictEqual(user.shared[0].name, project.name)
                    test.done()
                })
        })
}

function testDeleteProject(test) {
    test.expect(0)
    services.loadUser('User')
        .then(user => {
            const _id = user.projects[0]._id
            services.deleteProject(user, _id)
                .then(() => services.loadProject(user, _id))
                .catch(() => test.done())
        })
}

function after(test) {
    test.expect(0)
    db.destroy()
        .then(() => test.done())
}

module.exports = {
    before,
    testRegister,
    testRegisterDuplicated,
    testAuthenticate,
    testAuthenticateUnauthorized,
    testLoadUser,
    testCreateProject,
    testLoadProject,
    testSaveProject,
    testShareProject,
    testDeleteProject,
    after
}