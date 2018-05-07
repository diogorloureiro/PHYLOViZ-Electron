'use strict'

function generateDirectedGraph(graph) {
    const new_graph = { vertices: [], edges: [] }
    buildDirectedGraph(undefined, graph.vertices[0], graph, new_graph)
    // Order was reversed after build, last vertice was the root
    new_graph.vertices.reverse()
    return new_graph
}

// Recursively builds a directed graph out of an MST
function buildDirectedGraph(parent, node, graph, new_graph) {
    // Insert the edges where the node is either the source or the target into the new_graph
    // Delete these from the old graph due to reversing these when you are in the nodes children
    graph.edges.forEach((edge, index) => {
        if (edge.source === node.id) {
            new_graph.edges.push(edge)
            delete graph.edges[index]
        } else if (edge.target === node.id) {
            new_graph.edges.push({
                source: edge.target,
                target: edge.source,
                distance: edge.distance
            })
            delete graph.edges[index]
        }
    })
    // Retrieve from the new_graph the edges to the children
    const edges = new_graph.edges.filter(edge => edge.source === node.id)
    // Retrieve the edge that connects the child to the parent
    const edge = new_graph.edges.find(edge => parent && edge.source === parent.id && edge.target === node.id)
    node = {
        id: node.id,
        children: edges.map(edge => ({ id: edge.target })),
        circle_radius: 1, // to be changed into an actual radius
        parent,
        distance: edge ? edge.distance : 0 // root node doesn't have parent
    }
    // Recursive call and replace the dummy children with real ones
    node.children = node.children.map(child => buildDirectedGraph(node, child, graph, new_graph))
    // Can't push before or else dummy children are still there (can possibly improve)
    new_graph.vertices.push(node)
    return node
}

// Algorithm following the Appendix of grapetree article
function grapetree(vertices, trials) {
    const gaps = []
    gaps[0] = 2 * Math.PI / vertices.length
    let best
    for (let i = 0; i < trials; ++i) {
        vertices.forEach(node => node.DCS = { radius: descendentsRadius(node), angle: descendentsAngle(node, gaps[i]) })
        const angle = vertices.map(node => node.DCS.angle).reduce(max, -Infinity)
        if (angle <= 2 * Math.PI && (!best || best.angle < angle))
            best = { gap: gaps[i], angle, vertices: Object.assign({}, vertices) }
        gaps[i + 1] = gaps[i] * 2 * Math.PI / angle
    }
    vertices = best.vertices
    return best.gap
}

function max(u, v) {
    return Math.max(u, v)
}

// Calculates radius of the direct descendents
function childrenRadius(node) {
    const radius1 = node.distance + 2 * node.circle_radius
    if (!node.children.length)
        return radius1
    const radius2 = node.distance + node.circle_radius + descendentsRadius(node)
    return Math.max(radius1, radius2)
}

// Calculates radius of all the descendents of node
function descendentsRadius(node) {
    return node.children.length ? node.children.map(childrenRadius).reduce(max, -Infinity) : node.distance + 2 * node.circle_radius
}

// Calculates angle of direct descendents of node
function childrenAngle(node, s) {
    const angle1 = 2 * Math.asin(node.circle_radius * s / (node.distance + node.circle_radius))
    if (!node.children.length)
        return angle1
    const radius = descendentsRadius(node)
    const angle = descendentsAngle(node, s)
    const arcsin = Math.asin(radius / (node.distance + node.circle_radius))    // Sometimes it's NaN, for example : 3/(1+1) 
    const angle_poleMove = poleMove([radius, 0.5 * angle], [node.distance + node.circle_radius, Math.PI]).angle
    const angle2 = 2 * (arcsin ? Math.max(arcsin, angle_poleMove) : angle_poleMove)
    return Math.max(angle1, angle2)
}

// Calculates angle of all the descendents of node
function descendentsAngle(node, s) {
    if (!node.children.length)
        return 2 * Math.asin(node.circle_radius * s / (node.distance + node.circle_radius))
    const radius = s / descendentsRadius(node)
    return node.children.reduce((sum, child) => sum + childrenAngle(child, s) + radius, 0)
}

function poleMove([rp, ap], [ro, ao]) {
    const [xp, yp] = [rp * Math.cos(ap), rp * Math.sin(ap)]
    const [xo, yo] = [ro * Math.cos(ao), ro * Math.sin(ao)]
    const [x, y] = [xp - xo, yp - yo]
    return { radius: Math.sqrt(x * x + y * y), angle: Math.atan(y / x) }
}

//////////////////////////////////////////////////////////////////////D3//////////////////////////////////////////////////////////////////////

function createGrapeTree(graph) {
    var svgContainer = d3.select("body")
        .append("svg")
        .attr("width", 500)
        .attr("height", 500)
    var circles = svgContainer
        .selectAll("circle")
        .data(graph.vertices)
        .enter()
        .append("circle")
        .attr("cx", d => d.DCS.radius * Math.cos(d.DCS.angle))
        .attr("cy", d => d.DCS.radius * Math.sin(d.DCS.angle))
        .attr("r", function (d) { return d.radius })
        .style("fill", "green");
}