'use strict'

const kue = require('kue')
const uuid = require('uuid/v4')
const fs = require('../../fspromises')
const goeburst = require('./goeburst')
const algorithms = require('./algorithms')

function init(local = true) {

    const processors = {
        goeburst: goeburst.process
    }
    const comparators = {
        goeburst: goeburst.compare
    }

    let process

    if (local) {
        process = function (processor, comparator, algorithm, profiles, lvs = 3) {
            processor = processors[processor]
            comparator = comparators[comparator]
            algorithm = algorithms[algorithm]
            return new Promise(resolve => resolve(processor(profiles, comparator, algorithm, lvs)))
        }
    } else {
        const queue = kue.createQueue()
        queue.process('algorithm', (job, done) => {
            const path = job.data.path
            fs.readFile(path)
                .then(data => {
                    let { processor, comparator, algorithm, profiles, lvs } = JSON.parse(data)
                    processor = processors[processor]
                    comparator = comparators[comparator]
                    algorithm = algorithms[algorithm]
                    const result = processor(profiles, comparator, algorithm, lvs)
                    return fs.writeFile(path, JSON.stringify(result))
                })
                .then(() => done())
        })
        process = function (processor, comparator, algorithm, profiles, lvs = 3) {
            return new Promise((resolve, reject) => {
                const path = uuid()
                const job = queue.create('algorithm', { path })
                const data = { processor, comparator, algorithm, profiles, lvs }
                fs.writeFile(path, JSON.stringify(data))
                    .then(() => job
                        .on('failed', err => {
                            reject(err)
                            fs.unlink(path)
                        })
                        .on('complete', () =>
                            fs.readFile(path).then(data => {
                                resolve(JSON.parse(data))
                                fs.unlink(path)
                            }))
                        .removeOnComplete(true)
                        .save())
            })
        }
    }

    return {
        process,
        goeburst: {
            processor: 'goeburst',
            comparator: 'goeburst'
        },
        algorithms: {
            boruvka: 'boruvka',
            kruskal: 'kruskal',
            prim: 'prim'
        }
    }
}

module.exports = init