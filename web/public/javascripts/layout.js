'use strict'

const height = 800
const width = 1800

const svg = d3.select('svg').attr('width', width).attr('height', height)
    .call(d3.zoom().on("zoom", () => svg.attr("transform", d3.event.transform))).append('g')

const color = d3.scaleOrdinal(d3.schemeCategory20)

let link = svg.append('g')
    .attr('class', 'links')
    .selectAll('line')

let node = svg.append('g')
    .attr('class', 'nodes')
    .selectAll('circle')

const simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(d => d.id).distance(100))
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(width / 2, height / 2))

function createMST(graph, cut, speed) {

    const edges = graph.edges.filter(e => e.distance <= cut)

    link = link.data(edges)
    link.exit().remove()
    link = link.enter()
        .append('line')
        .attr('stroke-width', d => Math.sqrt(d.distance))
        .merge(link)

    node = node.data(graph.vertices)
    node.exit().remove()
    node = node.enter()
        .append('circle')
        .attr('r', width * 0.01)
        .attr('fill', color(1))
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended))
        .merge(node)

    node.append('title').text(d => d.id)
    simulation.nodes(graph.vertices).on('tick', ticked)
    simulation.force('link').links(edges)

    simulation.alphaTarget(speed).restart()

    function ticked() {
        link.attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y)

        node.attr('cx', d => d.x)
            .attr('cy', d => d.y)
    }
}

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
}

function dragged(d) {
    d.fx = d3.event.x
    d.fy = d3.event.y
}

function dragended(d) {
    //if (!d3.event.active) simulation.alphaTarget(0)
    d.fx = null
    d.fy = null
}

// Animation speed slider
function updateSpeed(value) {
    value === 0 ? simulation.alphaTarget(value) : simulation.alphaTarget(value).restart()
}