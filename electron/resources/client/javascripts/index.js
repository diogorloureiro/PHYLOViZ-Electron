'use strict'

import { flatten, direct } from './graph-handler'
import forcedirected from './forcedirected'
import grapetree from './grapetree'
import radial from './radial'

import * as d3 from 'd3'

function init(canvas, algorithm) {
    const height = 700
    const width = 1400

    const svg = canvas
        .attr('width', width)
        .attr('height', height)
        .call(d3.zoom().on('zoom', () => svg.attr('transform', d3.event.transform))).append('g')

    const link = svg.append('g')
        .attr('class', 'links')
        .selectAll('line')

    const node = svg.append('g')
        .attr('class', 'nodes')
        .selectAll('circle')
    
    const simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(d => d.id).distance(120))
        .force('charge', d3.forceManyBody())
        .force('center', d3.forceCenter(width / 2, height / 2))

    const conf = { height, width, svg, link, node, simulation }
    
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

        const scale = 3 //Math.max(1, Math.min(8, 0.9 / Math.max(cx / width, cy / height)))
        const [x, y] = [width / 2 - scale * cx, height / 2 - scale * cy]

        svg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale))
    }

    const renders = { forcedirected, grapetree, radial }
    return {
        flatten,
        direct,
        render: graph => renders[algorithm](graph, conf),
        updateSpeed,
        search
    }
}

export default init