'use strict'

const fs = require('../fspromises')
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
    test.expect(2)
    services.register('User', 'Password')
        .catch(err => {
            test.strictEqual(err.message, 'User already exists')
            test.strictEqual(err.status, 403)
            test.done()
        })
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

function testAuthenticateWrongPassword(test) {
    test.expect(2)
    services.authenticate('User', 'Error')
        .catch(err => {
            test.strictEqual(err.message, 'Wrong credentials')
            test.strictEqual(err.status, 401)
            test.done()
        })
}

function testAuthenticateInexistentUser(test) {
    test.expect(2)
    services.authenticate('Error', 'Password')
        .catch(err => {
            test.strictEqual(err.message, 'Wrong credentials')
            test.strictEqual(err.status, 401)
            test.done()
        })
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

function testLoadUserInexistent(test) {
    test.expect(2)
    services.loadUser('Error')
        .catch(err => {
            test.strictEqual(err.message, 'User not found')
            test.strictEqual(err.status, 404)
            test.done()
        })
}

function testCreateProject(test) {
    test.expect(9)
    services.loadUser('User')
        .then(user => services.createProject(user, 'Project', {}))
        .then(project => {
            test.strictEqual(project.name, 'Project')
            test.strictEqual(project.owner, 'User')
            test.deepEqual(project.contributors, [])
            test.deepEqual(project.dataset, {})
            test.deepEqual(project.ancillary, {})
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

function testImportProject(test) {
    test.expect(9)
    fs.readFile('./tests/inputs/project.json')
        .then(data => services.loadUser('User')
            .then(user => services.importProject(user, { originalname: 'Project.json', buffer: data })))
        .then(project => {
            test.strictEqual(project.name, 'Project')
            test.strictEqual(project.owner, 'User')
            test.deepEqual(project.contributors, [])
            test.strictEqual(project.dataset, 'dataset')
            test.strictEqual(project.ancillary, 'ancillary')
            test.strictEqual(project.computations, 'computations')
            return services.loadUser('User')
                .then(user => {
                    test.strictEqual(user.projects.length, 2)
                    test.strictEqual(user.projects[1]._id, project._id)
                    test.strictEqual(user.projects[1].name, project.name)
                    test.done()
                })
        })
}

function testLoadProject(test) {
    test.expect(6)
    services.loadUser('User')
        .then(user => services.loadProject(user, user.projects[0]._id))
        .then(project => {
            test.strictEqual(project.name, 'Project')
            test.strictEqual(project.owner, 'User')
            test.deepEqual(project.contributors, [])
            test.deepEqual(project.dataset, {})
            test.deepEqual(project.ancillary, {})
            test.deepEqual(project.computations, {})
            test.done()
        })
}

function testLoadProjectInexistent(test) {
    test.expect(2)
    services.loadUser('User')
        .then(user => services.loadProject(user, 'Error'))
        .catch(err => {
            test.strictEqual(err.message, 'Project not found')
            test.strictEqual(err.status, 404)
            test.done()
        })
}

function testLoadProjectUnauthorized(test) {
    test.expect(2)
    services.register('Contributor', 'Password')
        .then(contributor => services.loadUser('User')
            .then(user => services.loadProject(contributor, user.projects[0]._id)))
        .catch(err => {
            test.strictEqual(err.message, 'Project not found')
            test.strictEqual(err.status, 404)
            test.done()
        })
}

function testExportProject(test) {
    test.expect(3)
    services.loadUser('User')
        .then(user => services.exportProject(user, user.projects[0]._id))
        .then(project => {
            test.deepEqual(project.dataset, {})
            test.deepEqual(project.ancillary, {})
            test.deepEqual(project.computations, {})
            test.done()
        })
}

function testAddComputation(test) {
    test.expect(6)
    services.loadUser('User')
        .then(user => services.addComputation(user, user.projects[0]._id, 'goeburst', 3, 'computation')
            .then(project => {
                test.strictEqual(project.name, 'Project')
                test.strictEqual(project.owner, 'User')
                test.deepEqual(project.contributors, [])
                test.deepEqual(project.dataset, {})
                test.deepEqual(project.ancillary, {})
                test.deepEqual(project.computations, { goeburst: { '3': 'computation' } })
                test.done()
            }))
}

function testShareProject(test) {
    test.expect(5)
    services.loadUser('User')
        .then(user => services.shareProject(user, 'Contributor', user.projects[0]._id, user.projects[0].name))
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

function testShareProjectOwn(test) {
    test.expect(2)
    services.loadUser('User')
        .then(user => services.shareProject(user, 'User', user.projects[0]._id, user.projects[0].name))
        .catch(err => {
            test.strictEqual(err.message, 'User already has access to the project')
            test.strictEqual(err.status, 403)
            test.done()
        })
}

function testShareProjectDuplicated(test) {
    test.expect(2)
    services.loadUser('User')
        .then(user => services.shareProject(user, 'Contributor', user.projects[0]._id, user.projects[0].name))
        .catch(err => {
            test.strictEqual(err.message, 'User already has access to the project')
            test.strictEqual(err.status, 403)
            test.done()
        })
}

function testShareProjectInexistent(test) {
    test.expect(2)
    services.loadUser('User')
        .then(user => services.shareProject(user, 'Contributor', 'Error', user.projects[0].name))
        .catch(err => {
            test.strictEqual(err.message, 'Project not found')
            test.strictEqual(err.status, 404)
            test.done()
        })
}

function testShareProjectUnauthoried(test) {
    test.expect(2)
    services.loadUser('User')
        .then(user => services.loadUser('Contributor')
            .then(contributor => services.shareProject(contributor, 'User', user.projects[0]._id, user.projects[0].name)))
        .catch(err => {
            test.strictEqual(err.message, 'Project not found')
            test.strictEqual(err.status, 404)
            test.done()
        })
}

function testDeleteProjectContributor(test) {
    test.expect(2)
    services.loadUser('User')
        .then(user => services.shareProject(user, 'Contributor', user.projects[1]._id, user.projects[1].name)
            .then(() => services.loadUser('Contributor'))
            .then(contributor => services.deleteProject(contributor, user.projects[1]._id)
                .then(() => services.loadProject(contributor, user.projects[1]._id))))
        .catch(err => {
            test.strictEqual(err.message, 'Project not found')
            test.strictEqual(err.status, 404)
            test.done()
        })
}

function testDeleteProjectNotContributor(test) {
    test.expect(2)
    services.loadUser('User')
        .then(user => services.loadUser('Contributor')
            .then(contributor => services.deleteProject(contributor, user.projects[1]._id)))
        .catch(err => {
            test.strictEqual(err.message, 'Project not found')
            test.strictEqual(err.status, 404)
            test.done()
        })
}

function testDeleteProjectOwner(test) {
    test.expect(2)
    services.loadUser('User')
        .then(user => {
            const _id = user.projects[0]._id
            return services.deleteProject(user, _id)
                .then(() => services.loadProject(user, _id))
        })
        .catch(err => {
            test.strictEqual(err.message, 'Project not found')
            test.strictEqual(err.status, 404)
            test.done()
        })
}

function testDeleteProjectInexistentOwner(test) {
    test.expect(2)
    services.loadUser('User')
        .then(user => services.loadUser('Contributor')
            .then(contributor => services.deleteProject(user, contributor.shared[0]._id)))
        .catch(err => {
            test.strictEqual(err.message, 'Project not found')
            test.strictEqual(err.status, 404)
            test.done()
        })
}

function testDeleteProjectInexistentContributor(test) {
    test.expect(2)
    services.loadUser('User')
        .then(user => services.deleteProject(user, 'Error'))
        .catch(err => {
            test.strictEqual(err.message, 'Project not found')
            test.strictEqual(err.status, 404)
            test.done()
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
    testAuthenticateWrongPassword,
    testAuthenticateInexistentUser,
    testLoadUser,
    testLoadUserInexistent,
    testCreateProject,
    testImportProject,
    testLoadProject,
    testLoadProjectInexistent,
    testLoadProjectUnauthorized,
    testExportProject,
    testAddComputation,
    testShareProject,
    testShareProjectOwn,
    testShareProjectDuplicated,
    testShareProjectInexistent,
    testShareProjectUnauthoried,
    testDeleteProjectContributor,
    testDeleteProjectNotContributor,
    testDeleteProjectOwner,
    testDeleteProjectInexistentOwner,
    testDeleteProjectInexistentContributor,
    after
}