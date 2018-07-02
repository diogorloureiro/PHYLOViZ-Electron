'use strict'

const fs = require('../fspromises')
const { datasets } = require('../services/data-manager')
const processor = require('../services/data-processor')

//const [ , , location, mode, processor, comparator, algorithm, executions, dataset] = process.argv

const location = 'C:\\Users\\luana\\Desktop\\backups\\código\\benchmark\\github'
const mode = 'promises'
const processor = processor.goeburst.processor
const comparator = processor.goeburst.comparator
const algorithm = processor.algorithms.prim
const executions = 1
const dataset = 'spneumoniae'

datasets.loadDatasetFromUrl(`https://pubmlst.org/data/profiles/${dataset}.txt`)
    .then(({ profiles }) => {
        const path = `${location}\\${mode}-${algorithm}-${dataset}-${executions}.txt`
        const promises = []
        const { heapTotal, heapUsed } = process.memoryUsage()
        let file = `Heap total: ${heapTotal} bytes\tHeap used: ${heapUsed} bytes\r\n`
        const start = new Date()
        for (let i = 0; i < executions; i++) {
            const index = i
            const start = new Date()
            promises[index] = processor.process(processor.goeburst.processor, comparator, algorithm, profiles)
                .then(result => {
                    const end = new Date()
                    file += `${index + 1}: Time: ${end - start}ms\tMemory: ${process.memoryUsage().heapUsed - heapUsed} bytes\r\n`
                    return end - start
                })
        }
        return Promise.all(promises)
            .then(times => {
                const end = new Date()
                file += `Used ${process.memoryUsage().heapUsed - heapUsed} bytes of memory\r\n`
                file += `Took ${end - start}ms to process ${profiles.length} nodes ${executions} times.\r\n`
                file += `Minimum: ${Math.min(...times)}ms\t`
                file += `Average: ${times.reduce((sum, cur) => sum + cur, 0) / executions}ms\t`
                file += `Maximum: ${Math.max(...times)}ms\t`
                return fs.writeFile(path, file)
            })
            .then(() => console.log(`Successfully wrote to ${path}`))
            .catch(err => console.log(err))
    })