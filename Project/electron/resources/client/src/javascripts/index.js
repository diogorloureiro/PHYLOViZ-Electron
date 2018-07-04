'use strict'

import * as d3 from 'd3'

import renders from './renders'

let link, node, simulation, conf

function init(algorithm) {

    const zoom = d3.zoom()
    let svg = d3.select('svg')
    const height = parseInt(svg.style('height').replace('px', ''))
    const width = parseInt(svg.style('width').replace('px', ''))
    svg = svg.call(zoom.on('zoom', () => svg.attr('transform', d3.event.transform))).append('g')

    link = svg.append('g')
        .attr('class', 'links')
        .selectAll('line')

    node = svg.append('g')
        .attr('class', 'nodes')
        .selectAll('circle')

    simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(d => d.id).distance(120))
        .force('charge', d3.forceManyBody())
        .force('center', d3.forceCenter(width / 2, height / 2))

    conf = { height, width, svg, link, node, simulation }

    // Animation speed slider
    function updateSpeed(value) {
        value === 0 ? simulation.alphaTarget(value) : simulation.alphaTarget(value).restart()
    }

    // Search for node
    let oldSearch = undefined
    function search(id) {
        if (oldSearch) oldSearch.attr('fill', '#00549f')
        const searched = d3.select(`#node${id}`)
        if (searched.empty()) return
        oldSearch = searched
        searched.attr('fill', 'orange')

        const cx = searched.attr('cx')
        const cy = searched.attr('cy')

        const scale = 3
        const [x, y] = [width / 2 - scale * cx, height / 2 - scale * cy]

        svg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale))
    }

    function toggleLabels() {
        const labels = d3.selectAll('text')
        const visibility = labels.style('visibility') === 'visible' ?  'hidden' : 'visible'
        labels.style('visibility', visibility)
    }

    function click(d, render, graph, conf) {
        if (!d3.event.defaultPrevented) {
            if (d.children.length > 0) {
                d._children = d.children
                d.children = []
            } else if (d._children && d._children.length > 0) {
                d.children = d._children
                d._children = []
            }
            graph.vertices = flatten(graph.vertices[0])
            render(graph, conf, click)
        }
    }

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
    
    return {
        flatten,
        direct,
        ancillary,
        render: graph => renders[algorithm](graph, conf, click),
        updateSpeed,
        search,
        toggleLabels
    }
}

function destroy() {
    link.remove()
    node.remove()
    simulation.nodes([])
    simulation.force('link').links([])
    simulation.stop()
    conf.link.remove()
    conf.node.remove()
    conf.simulation.nodes([])
    conf.simulation.force('link').links([])
    conf.simulation.stop()
}

 export {
    init,
    destroy
}