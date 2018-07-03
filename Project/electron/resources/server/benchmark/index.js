'use strict'

const [ , , mode, processor, comparator, algorithm, dataset, lvs, executions] = process.argv

const { datasets } = require('../services/data-manager')
const proc = require('../services/data-processor')(mode)

datasets.loadDatasetFromUrl(`https://pubmlst.org/data/profiles/${dataset}.txt`)
    .then(({ profiles }) => {
        const promises = []
        const { heapTotal, heapUsed } = process.memoryUsage()
        console.log(`Heap total: ${heapTotal} bytes`)
        console.log(`Heap used: ${heapUsed} bytes`)
        const start = new Date()
        for (let i = 0; i < executions; i++) {
            const start = new Date()
            promises[i] = proc(processor, comparator, algorithm, profiles, lvs)
                .then(() => new Date() - start)
        }
        return Promise.all(promises)
            .then(times => {
                const end = new Date()
                console.log(`Used ${process.memoryUsage().heapUsed - heapUsed} bytes of memory`)
                console.log(`Took ${end - start}ms to process ${profiles.length} nodes ${executions} times.`)
                console.log(`Minimum: ${Math.min(...times)}ms`)
                console.log(`Average: ${times.reduce((sum, cur) => sum + cur, 0) / executions}ms`)
                console.log(`Maximum: ${Math.max(...times)}ms`)
            })
            .catch(console.log)
    })