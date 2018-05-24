'use strict'

const fs = require('fs')
const PouchDB = require('pouchdb')
const users = require('../services/data-manager/users')
const newDb = new PouchDB('./tests/mockdatabase')
const originalDb = users.redefineDb(newDb)
const Project = require('../model/Project')

//Tests register method
function testRegister(test) {
    users.register('leonardo', '123', (err, resp, info) => {
        if (err || info)
            console.log('REGISTER {error : ' + err + ' || info : ' + info + '}')
        else
            test.equal(resp._id, 'leonardo')
        newDb.get('leonardo', (err, doc) => {
            if (err) {
                console.log('GET {error : ' + err + '}')
                test.done()
            } else {
                newDb.remove(doc, (err, resp) => {
                    if (err)
                        console.log('REMOVE {error :' + err + '}')
                    test.done()
                })
            }
        })
    })
}

function testAuthenticate(test) {
    users.register('leonardo', '123', (err, resp, info) => {
        if (err || info) {
            console.log('REGISTER {error : ' + err + ' || info : ' + info + '}')
            test.done()
        }
        else
            users.authenticate('leonardo', '123', (err, user) => {
                if (err) {
                    console.log('AUTHENTICATE {error : ' + err + '}')
                    test.done()
                }
                else {
                    test.equal('leonardo', user._id)
                    newDb.get('leonardo', (err, doc) => {
                        if (err) {
                            console.log('GET {error : ' + err + '}')
                            test.done()
                        } else {
                            newDb.remove(doc, (err, resp) => {
                                if (err)
                                    console.log('REMOVE {error :' + err + '}')
                                test.done()
                            })
                        }
                    })
                }
            })
    })
}

function testCreateProject(test) {
    const dataset = fs.readFileSync('./tests/data/input/spneumoniaeClean.txt', 'utf8')
    users.register('leonardo', '123', (err, resp, info) => {
        if (err || info) {
            console.log('REGISTER {error : ' + err + ' || info : ' + info + '}')
            test.done()
        }
        else
            newDb.get('leonardo', (err, doc) => {
                if (err) {
                    console.log('GET {error : ' + err + '}')
                    test.done()
                }
                else {

                    users.createProject(doc, 'Estirpe da Banana', dataset, (err, user, project) => {
                        if (err) {
                            console.log('CREATE {error : ' + err)
                            test.done()
                        } else {
                            newDb.get(project._id, (err, respProject) => {
                                if (err) {
                                    console.log('PROJECT {erro : ' + err)
                                    test.done()
                                } else
                                    newDb.get(user._id, (err, respUser) => {
                                        if (err) {
                                            console.log('USER {erro : ' + err)
                                            test.done()
                                        } else {
                                            test.equal(respUser.projects[respProject._id], respProject.name) //Check project name
                                            test.strictEqual(dataset, respProject.dataset) //check dataset data
                                            newDb.remove(respUser, (err, resp) => {
                                                if (err)
                                                    console.log('REMOVE USER {error :' + err + '}')
                                                newDb.remove(respProject, (err, resp) => {
                                                    if (err)
                                                        console.log('REMOVE PROJECT {error :' + err + '}')
                                                    test.done()
                                                })
                                            })
                                        }
                                    })
                            })
                        }
                    })
                }
            })

    })
}

function testLoadProject(test){
    
}

function testSaveProject(test) {
    let dataset = fs.readFileSync('./tests/data/input/spneumoniaeClean.txt', 'utf8')
    users.register('leonardo', '123', (err, resp, info) => {
        if (err || info) {
            console.log('REGISTER {error : ' + err + ' || info : ' + info + '}')
            test.done()
        }
        else
            newDb.get('leonardo', (err, doc) => {
                if (err) {
                    console.log('GET {error : ' + err + '}')
                    test.done()
                }
                else
                    users.createProject(doc, 'Estirpe da Banana', dataset, (err, user, project) => {
                        if (err) {
                            console.log('CREATE {error : ' + err)
                            test.done()
                        } else {
                            newDb.get(project._id, (err, respProject) => {
                                if (err) {
                                    console.log('PROJECT {erro : ' + err)
                                    test.done()
                                } else
                                    newDb.get(user._id, (err, respUser) => {
                                        if (err) {
                                            console.log('USER {erro : ' + err)
                                            test.done()
                                        }
                                        else {
                                            respProject.dataset = ' '
                                            users.saveProject(respUser, respProject, (err) => {
                                                if (err)
                                                    console.log('SAVE PROJECT {error : ' + err)
                                                newDb.get(respProject._id, (err, saveProject) => {
                                                    if (err)
                                                        console.log('GET PROJECT {error : ' + err)
                                                    else
                                                        test.equal(saveProject.dataset, ' ')
                                                    newDb.remove(saveProject, (err, resp) => {
                                                        if (err)
                                                            console.log('REMOVE PROJECT {error :' + err + '}')
                                                        newDb.remove(respUser, (err, resp) => {
                                                            if (err)
                                                                console.log('REMOVE USER {error :' + err + '}')
                                                            test.done()
                                                        })
                                                    })
                                                })
                                            })
                                        }
                                    })
                            })
                        }
                    })
            })
    })
}

function testShareProject(test) {
    users.register('leonardo', '123', (err, resp, info) => {
        if (err || info) {
            console.log('REGISTER {error : ' + err + ' || info : ' + info + '}')
            test.done()
        }
        else
            users.register('diogo', '123', (err, resp, info) => {
                if (err || info) {
                    console.log('REGISTER {error : ' + err + ' || info : ' + info + '}')
                    test.done()
                }
                else
                    newDb.get('leonardo', (err, doc) => {
                        if (err) {
                            console.log('GET {error : ' + err + '}')
                            test.done()
                        }
                        else
                            users.createProject(doc, 'Estirpe da Banana', ' ', (err, user, project) => {
                                if (err) {
                                    console.log('CREATE {error : ' + err)
                                    test.done()
                                } else {
                                    users.shareProject('leonardo', 'diogo', project._id, (err) => {
                                        if (err) {
                                            console.log('SHARE PROJECT : {error : ' + err + '}')
                                            test.done()
                                        }
                                        else {
                                            newDb.get('diogo', (err, respUserD) => {
                                                if (err) {
                                                    console.log('USER {error : ' + err + '}')
                                                    test.done()
                                                }
                                                else {
                                                    test.equal(respUserD.shared[project._id], project._id)
                                                }
                                                newDb.get(project._id, (err, p) => {
                                                    if (err)
                                                        console.log('GET PROJECT {error : ' + err + '}')
                                                    newDb.get('leonardo', (err, leonardo) => {
                                                        if (err)
                                                            console.log('GET leonardo {error : ' + err + '}')
                                                        newDb.remove(p, (err, resp) => {
                                                            if (err)
                                                                console.log('REMOVE PROJECT {error : ' + err + '}')
                                                            newDb.remove(leonardo, (err, resp) => {
                                                                if (err)
                                                                    console.log('REMOVE leonardo {error : ' + err + '}')
                                                                newDb.remove(respUserD, (err, resp) => {
                                                                    test.done()
                                                                })
                                                            })
                                                        })
                                                    })
                                                })
                                            })
                                        }
                                    })
                                }
                            })
                    })
            })
    })
}

module.exports = { testRegister, testAuthenticate, testCreateProject, testSaveProject, testShareProject }