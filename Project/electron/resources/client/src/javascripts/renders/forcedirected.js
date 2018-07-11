'use strict'

import * as d3 from 'd3'

function render(graph, conf, onNodeClick) {

    const edges = graph.edges.filter(edge => graph.vertices.find(vertex => vertex.id === edge.target || vertex.id === edge.target.id))

    conf.link = conf.link.data(edges)
    conf.link.exit().remove()
    conf.link = conf.link.enter()
        .append('line')
        .style('stroke', '#000000')
        .attr('stroke-width', 1.5)
        .merge(conf.link)

    conf.node = conf.node.data(graph.vertices)
    conf.node.exit().remove()
    conf.node = conf.node.enter()
        .append('g')
        .append('circle')
        .attr('r', d => d.size)
        .attr('id', d => 'node' + d.id)
        .on('click', onNodeClick)
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended))
        .merge(conf.node)
        .attr('fill', d => d._children && d._children.length > 0 ? 'orange' : '#00549f')

    conf.node.append('title').text(d => d.id)
    conf.simulation.nodes(graph.vertices).on('tick', ticked)
    conf.simulation.force('link').links(graph.edges)

    conf.simulation.alphaTarget(0.5).restart()

    function ticked() {
        conf.link.attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y)

        conf.node.attr('cx', d => d.x)
            .attr('cy', d => d.y)
    }

    function dragstarted(d) {
        if (!d3.event.active) conf.simulation.alphaTarget(0.3).restart()
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
}

export default render