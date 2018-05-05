'use strict'

// graph { vertices [], edges []}

// Generate directed graph
function generateDirectedGraph(graph) {
    let root = graph.vertices[0]
    let new_graph = { vertices: [], edges: [] }
    buildDirectedGraph(undefined, root, graph, new_graph)
    //Order was reversed after build, last vertice was the root
    new_graph.vertices.reverse()
    return new_graph
}

/*
node{
    id,
    children,
    radius,
    parent,
    length_to_parent
    'DCS' : 'radius' : ... , 'angle' : ....
}
*/

// Recursivly builds a directed graph out of an MST
function buildDirectedGraph(parent, child, graph, new_graph) {
    //Insert the edges the child is either the source or the target into the new_graph
    //Delete these from the old graph
    graph.edges.forEach((edge, index) => {
        if (edge.source === child.id) {
            new_graph.edges.push(edge)
            delete graph.edges[index]
        }
        if (edge.target === child.id) {
            const new_source = edge.target
            const new_target = edge.source
            const dist = edge.distance
            const new_edge = {
                source: new_source,
                target: new_target,
                distance: dist
            }
            new_graph.edges.push(new_edge)
            delete graph.edges[index]
        }
    })
    //Retrieve from the new_graph the edges to the children
    let edges_to_children = new_graph.edges.filter(edge => edge.source === child.id)
    //Retrieve the edge that connects the child to the parent
    let edge = new_graph.edges.filter(edge => (parent && edge.source === parent.id && edge.target === child.id))[0]
    child = {
        id: child.id,
        children: [],
        radius: 1,      //to be changed into an actual radius
        parent: parent,
        length_to_parent: edge === undefined ? 0 : edge.distance  //root node doesn't have parent
    }
    //Set up dummy children of child for recursive call
    edges_to_children.forEach(edge => {
        child.children.push({ id: edge.target })
    })
    //Recursive call and replace the dummy children with real ones
    child.children.forEach((child_of_child, index) => {
        child.children[index] = buildDirectedGraph(child, child_of_child, graph, new_graph)
    })
    //Can't push before or else dummy children are still there (can possibly improve)
    new_graph.vertices.push(child)
    return child
}

// Algorithm following the Appendix of grapetree article
function grapeTree(tree, trials) {
    let s = []
    s[0] = 2 * Math.PI / tree.vertices.length
    let S = []
    for (let i = 0; i < trials; ++i) {
        // Mentions preordered nodes, still have doubts about that
        tree.vertices.forEach(node => {
            compute_descendents(node, s[i])
        })
        let all_a_DCS = []
        tree.vertices.forEach((node, index) => {
            all_a_DCS[index] = node.angle
        })
        let At = all_a_DCS.reduce((max, cur) => Math.max(max, cur), -Infinity)
        if (At <= 2 * Math.PI) {
            S.push({ St: s[i], At })
        }
        s[i + 1] = s[i] * 2 * Math.PI / At
    }
    return S.reduce((max, cur) => Math.max(max, cur), -Infinity)
}

// Calculate radius and angle of descendents of node and inserts them into the node
function compute_descendents(node, s) {
    const r_DCS = compute_radius_of_descendents(node)
    const a_DCS = compute_angle_of_descendents(node, s)
    node.DCS = {
        radius: r_DCS,
        angle: a_DCS
    }
}

// Calculates radius of the direct descendents
function compute_radius_of_children(child) {
    const r_CS1 = child.length_to_parent + 2 * child.radius
    if (child.children.length === 0) return r_CS1            // no need to compute CS2 as there are no children of child
    const r_CS2 = child.length_to_parent + child.radius + compute_radius_of_descendents(child)
    return Math.max(r_CS1, r_CS2)
}

// Calculates radius of all the descendents of node
function compute_radius_of_descendents(n) {
    let children_r_CCS = []
    n.children.forEach((child, index) => {
        children_r_CCS[index] = compute_radius_of_children(child)
    })
    //Due to the stacking limit of arguments in javascript
    //spread operator can't be used for large amounts of data
    return children_r_CCS.reduce((max, cur) => Math.max(max, cur), -Infinity)
}

// Calculates angle of direct descendents of node
function compute_angle_of_children(child, s) {
    const a_CS1 = 2 * Math.asin((child.radius * s) / (child.length_to_parent + child.radius))
    if (child.children.length === 0) return a_CS1            // no need to compute CS2 as there are no children of child
    const r_DCS_child = compute_radius_of_descendents(child)
    const a_DCS_child = compute_angle_of_descendents(child, s)
    const arcsin = Math.asin(r_DCS_child / (child.length_to_parent + child.radius))
    const angle_poleMove = poleMove(
        {
            radius: r_DCS_child,
            angle: 0.5 * a_DCS_child
        },
        {
            radius: (child.length_to_parent + child.radius),
            angle: Math.PI
        }
    ).angle
    const a_CS2 = 2 * Math.max(arcsin, angle_poleMove)
    return Math.max(a_CS1, a_CS2)
}

// Calculates angle of all the descendents of node
function compute_angle_of_descendents(n, s) {
    let sum = 0
    n.children.forEach((child) => {
        sum += compute_angle_of_children(child, s) + (s / compute_radius_of_descendents(n))
    })
    return sum
}

function poleMove(p, pole) {
    //converter para coordenadas cartesianas
    const p_cart = [p.radius * Math.cos(p.angle), p.radius * Math.sin(p.angle)]
    const pole_cart = [pole.radius * Math.cos(pole.angle), pole.radius * Math.sin(pole.angle)]
    //compute new position
    const new_position = [p_cart[0] - pole_cart[0], p_cart[1] - pole_cart[1]]
    //convert back to polar
    return {
        radius: Math.sqrt((new_position[0] * new_position[0]) + (new_position[1] * new_position[1])),
        angle: Math.atan(new_position[1] / new_position[0])
    }
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

