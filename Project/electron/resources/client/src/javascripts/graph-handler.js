'use strict'

function flatten(node, nodes = []) {
    nodes.push(node)
    if (node.children)
        node.children.forEach(child => flatten(child, nodes))
    return nodes
}

function direct(graph) {
    const { vertices, edges } = graph
    const root = vertices.shift()
    root.distance = 0
    const neighbours = [root], visited = []
    while (neighbours.length) {
        const neighbour = neighbours.shift()
        const id = neighbour.id
        neighbour.children = []
        edges.forEach((edge, index) => {
            let { source, target, distance } = edge
            if (id === target) {
                const tmp = source
                source = target
                target = tmp
            }
            if (id === source) {
                visited.push({ source, target, distance })
                delete edges[index]
                const child = vertices.find(vertex => vertex.id === target)
                child.distance = distance
                neighbour.children.push(child)
                neighbours.push(child)
            }
        })
    }
    return { root, edges: visited }
}

function ancillary(graph, ancillary = [], minimum = 5) {
    graph.vertices.forEach(vertex => {
        vertex.ancillary = ancillary.filter(row => vertex.id === row.st)
        vertex.size = vertex.ancillary.length + minimum
    })
}

export {
    flatten,
    direct,
    ancillary
}