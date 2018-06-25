'use strict'

import parseNewick from "./newick"

function parseNexus(tree) {
    const a1 = tree.split(/begin trees;\s+/)[1]
    const taxa_map = {}
    let a2, a3
    if (a1.search('translate') >= 0) {
        [a3, a2] = a1.split(';')
        const a4 = a3.split(/[\s,]+/)
        for (let i = 1; i + 1 < a4.length; i += 2)
            taxa_map[a4[i]] = a4[i + 1]
    } else
        [a3, a2] = [null, a1.split(';')[0]]
    a2 = ['(', a2.split(/^[^(]+\(/)[1], ';'].join('').split(/(\[|\])/)
    const a = []
    let inNote = false
    a2.forEach(n => {
        const n = a2[i]
        switch (n) {
            case "[": inNote = true; break
            case "]": inNote = false; break
            default: if (!inNote) a.push(n)
        }
    })
    return parseNewick(a.join(''), taxa_map)
}

export default parseNexus