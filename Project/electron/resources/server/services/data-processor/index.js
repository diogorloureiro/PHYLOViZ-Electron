'use strict'

const kue = require('kue')
const uuid = require('uuid/v4')
const fs = require('../../fspromises')
const goeburst = require('./goeburst')

const local = true

const algorithms = {
    goeburst: goeburst.process
}

const comparators = {
    goeburst: goeburst.comparator
}

let process

if (!local) {
    const queue = kue.createQueue()

    queue.process('algorithm', (job, done) => {
        const path = job.data.path
        fs.readFile(path)
            .then(data => {
                let { algorithm, comparator, profiles, lvs } = JSON.parse(data)
                algorithm = algorithms[algorithm]
                comparator = comparators[comparator]
                const result = algorithm(profiles, comparator, lvs)
                return fs.writeFile(path, JSON.stringify(result))
            })
            .then(() => done())
    })

    process = function(algorithm, comparator, profiles, lvs = 3) {
        return new Promise((resolve, reject) => {
            const path = uuid()
            const job = queue.create('algorithm', { path })
            const data = { algorithm, comparator, profiles, lvs }
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
} else {
    process = function(algorithm, comparator, profiles, lvs = 3) {
        return new Promise(resolve => resolve(algorithms[algorithm](profiles, comparators[comparator], lvs)))
    }
}

module.exports = {
    process,
    goeburst: { algorithm: 'goeburst', comparator: 'goeburst' }
}