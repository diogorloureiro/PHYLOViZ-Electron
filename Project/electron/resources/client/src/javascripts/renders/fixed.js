'use strict'

import * as d3 from 'd3'

function render(graph, conf, onNodeClick) {

    let nodes = d3.selectAll('.node')
    if (nodes)
        nodes.remove()

    let links = d3.selectAll('.link')
    if (links)
        links.remove()

    graph.vertices.forEach(vertex => {
        graph.edges.forEach(edge => {
            const id = vertex.id
            if (id === edge.source || id === edge.source.id)
                edge.source = { x: vertex.x, y: vertex.y, id }
            else if (id === edge.target || id === edge.target.id)
                edge.target = { x: vertex.x, y: vertex.y, id }
        })
    })

    conf.link = conf.link
        .data(graph.edges.filter(edge => graph.vertices.find(vertex => vertex.id === edge.target.id)))

    let edgeEnter = conf.link
        .enter()
        .append('g')
        .attr('class', 'link')
        .attr('transform', 'rotate(0)')

    edgeEnter
        .append('line')
        .attr('x1', d => d.source.x + conf.width / 2)
        .attr('y1', d => d.source.y + conf.height / 2)
        .attr('x2', d => d.target.x + conf.width / 2)
        .attr('y2', d => d.target.y + conf.height / 2)
        .style('stroke', '#000000')
        .attr('stroke-width', 1)

    nodes = conf.node
        .data(graph.vertices)

    let nodeEnter = nodes
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', 'rotate(0)')

    nodeEnter
        .on('click', onNodeClick)
        .append('circle')
        .attr('id', d => 'node' + d.id)
        .attr('cx', d => d.x + conf.width / 2)
        .attr('cy', d => d.y + conf.height / 2)
        .attr('r', d => d.size)
        .attr('fill', d => d._children && d._children.length > 0 ? 'orange' : '#00549f')

    nodeEnter
        .append('text')
        .attr('id', d => 'text' + d.id)
        .style('visibility', 'visible')
        .attr('dx', -1)
        .attr('dy', 0)
        .attr('x', d => d.x + conf.width / 2)
        .attr('y', d => d.y + conf.height / 2)
        .text(d => d.id)
        .style('font-size', d => (d.size / (d.id + '').length) + 'px')
        .attr('fill', 'white')
}

export default render