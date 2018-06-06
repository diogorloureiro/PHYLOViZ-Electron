'use strict'

import * as d3 from 'd3'

function init(canvas) {
    const height = 700
    const width = 1400
    const zoom = d3.zoom()

    const svg = canvas
        .attr('width', width)
        .attr('height', height)
        .call(zoom.on('zoom', () => svg.attr('transform', d3.event.transform))).append('g')

    let link = svg.append('g')
        .attr('class', 'links')
        .selectAll('line')

    let node = svg.append('g')
        .attr('class', 'nodes')
        .selectAll('circle')

    let simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(d => d.id).distance(120))
        .force('charge', d3.forceManyBody())
        .force('center', d3.forceCenter(width / 2, height / 2))

    function render(graph, cut) {
        link = link.data(graph.edges)
        link.exit().remove()
        link = link.enter()
            .append('line')
            .style('stroke', '#000000')
            .attr('stroke-width', 1.5)
            .merge(link)

        node = node.data(graph.vertices)
        node.exit().remove()
        node = node.enter()
            .append('g')
            .append('circle')
            .attr('r', width * 0.01)
            .attr('fill', '#00549f')
            .attr('id', d => 'node' + d.id)
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended))
            .merge(node)

        node.append('title').text(d => d.id)
        simulation.nodes(graph.vertices).on('tick', ticked)
        simulation.force('link').links(graph.edges)
    }

    function ticked() {
        link.attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y)

        node.attr('cx', d => d.x)
            .attr('cy', d => d.y)
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

    return {
        render,
        updateSpeed,
        search
    }
}

export default init