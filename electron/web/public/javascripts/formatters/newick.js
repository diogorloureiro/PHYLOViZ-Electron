'use strict'

function parseNewick(a, taxa_map) {
    const e = [], r = {}
    const s = a.split(/\s*(;|\(|\)|,|:)\s*/)
    for (let i = 0; i < s.length; i++) {
        const n = s[i]
        switch (n) {
            case "(":
                const c = {}
                r.children = [c]
                e.push(r)
                r = c
                break;
            case ",":
                const c = {}
                e[e.length - 1].children.push(c)
                r = c
                break
            case ")":
                r = e.pop()
                break
            case ":": break
            default:
                const h = s[i - 1]
                if (")" === h || "(" === h || "," === h)
                    r.name = taxa_map && taxa_map[n] ? taxa_map[n] : n
                    //r.name = (taxa_map && taxa_map[n]) ? taxa_map[n] : n
                else if (":" === h)
                    r.length = parseFloat(n)
        }
    }
    return r
}

export default parseNewick