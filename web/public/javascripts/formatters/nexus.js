'use strict'
const parseNewick = require('./newick')

function parseNexus(tree) {
    let a1 = tre.split(/begin trees;\s+/)[1]
    const taxa_map = {}
    let a2, a3
    if (a1.search('translate') >= 0) {
        const aa = a1.split(';')
        [a3, a2] = [aa[0], aa[1]]
        const a4 = a3.split(/[\s,]+/)
        for (let t = 1; t + 1 < a4.length; t += 2) {
            taxa_map[a4[t]] = a4[t + 1]
        }
    } else {
        [a3, a2] = [null, a1.split(';')[0]]
    }
    a2 = ['(', a2.split(/^[^(]+\(/)[1], ';'].join('').split(/(\[|\])/)
    const a = []
    for (t = 0, inNote = 0; t < a2.length; t++) {
        const n = a2[t]
        switch (n) {
            case "[": inNote = 1; break;
            case "]": inNote = 0; break;
            default: if (!inNote) a.push(n)
        }
    }
    return parseNewick(a.join(''), taxa_map)
}

module.exports = { parseNexus }