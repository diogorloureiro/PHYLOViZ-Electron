'use strict'

function init(processors, comparators, algorithms) {
    return function (processor, comparator, algorithm, profiles, lvs = 3) {
        return new Promise(resolve => {
            processor = processors[processor]
            comparator = comparators[comparator]
            algorithm = algorithms[algorithm]
            resolve(processor(comparator, algorithm, profiles, lvs))
        })
    }
}

module.exports = init