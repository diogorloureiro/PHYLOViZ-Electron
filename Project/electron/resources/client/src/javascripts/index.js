'use strict'

import { flatten, direct, ancillary } from './graph-handler'
import forcedirected from './forcedirected'
import grapetree from './grapetree'
import radial from './radial'

import * as d3 from 'd3'

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

    const renders = { forcedirected, grapetree, radial }
    return {
        flatten,
        direct,
        ancillary,
        render: graph => renders[algorithm](graph, conf, click),
        updateSpeed,
        search
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

export { init, destroy }