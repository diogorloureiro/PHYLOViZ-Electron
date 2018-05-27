'use strict'

function parseNewick(a, taxa_map) {
    const e = [], r = {}
    const s = a.split(/\s*(;|\(|\)|,|:)\s*/)
    for (let t = 0; t < s.length; t++) {
        const n = s[t]
        switch (n) {
            case "(": const c = {}; r.children = [c], e.push(r), r = c; break;
            case ",": const c = {}; e[e.length - 1].children.push(c), r = c; break;
            case ")": r = e.pop(); break;
            case ":": break;
            default: {
                const h = s[t - 1];
                ")" === h || "(" === h || "," === h ? (r.name = taxa_map && taxa_map[n] ? taxa_map[n] : n) : ":" === h && (r.length = parseFloat(n));
            }
        }
    }
    return r
}

module.exports = { parseNewick }