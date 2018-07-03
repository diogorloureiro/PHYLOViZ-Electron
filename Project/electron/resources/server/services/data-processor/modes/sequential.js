'use strict'

function init(processors, comparators, algorithms) {
    return function (processor, comparator, algorithm, profiles, lvs = 3) {
        processor = processors[processor]
        comparator = comparators[comparator]
        algorithm = algorithms[algorithm]
        return Promise.resolve(processor(comparator, algorithm, profiles, lvs))
    }
}

module.exports = init