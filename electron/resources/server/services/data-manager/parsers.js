'use strict'

function parseNewick(a, taxa_map) {
    const e = [], r = {}
    const s = a.split(/\s*(;|\(|\)|,|:)\s*/)
    for (let i = 0; i < s.length; i++) {
        const n = s[i]
        switch (n) {
            case '(':
                const c = {}
                r.children = [c]
                e.push(r)
                r = c
                break
            case ',':
                const c = {}
                e[e.length - 1].children.push(c)
                r = c
                break
            case ')':
                r = e.pop()
                break
            case ':': break
            default:
                const h = s[i - 1]
                if (')' === h || '(' === h || ',' === h)
                    r.name = taxa_map && taxa_map[n] ? taxa_map[n] : n
                    //r.name = (taxa_map && taxa_map[n]) ? taxa_map[n] : n
                else if (':' === h)
                    r.length = parseFloat(n)
        }
    }
    return r
}

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
            case '[': inNote = true; break
            case ']': inNote = false; break
            default: if (!inNote) a.push(n)
        }
    })
    return parseNewick(a.join(''), taxa_map)
}

module.exports = {
    parseNewick,
    parseNexus
}