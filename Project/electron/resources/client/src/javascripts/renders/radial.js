'use strict'

import * as d3 from 'd3'

const defaultDistanceMultiplier = 100
const defaultZeroDistanceValue = 10

function radial(root) {
    const leaftotal = leafcount(root)
    const list = []
    list.push(root)
    root.rightborder = 0
    root.wedge = (2 * Math.PI)
    root.x = 0
    root.y = 0
    while (list.length > 0) {
        const node = list.pop()
        let border = node.rightborder
        node.children.forEach((child => {
            list.push(child)
            child.rightborder = border
            child.wedge = (2 * Math.PI) * leafcount(child) / leaftotal
            const alpha = child.rightborder + child.wedge / 2
            const distance = child.distance * defaultDistanceMultiplier + defaultZeroDistanceValue
            if (node == root) {
                root.xp = node.x + Math.cos(alpha) * distance
                root.yp = node.y + Math.sin(alpha) * distance
            }
            child.x = node.x + Math.cos(alpha) * distance
            child.y = node.y + Math.sin(alpha) * distance
            child.xp = node.x
            child.yp = node.y
            border += child.wedge
        }))
    }
}

function leafcount(node) {
    return node.children.length === 0 ? 1 : node.children.reduce((acc, curr) => acc + leafcount(curr), 0)
}

function render(graph, conf, collapseClick, setupAncillary) {

    let nodes = d3.selectAll('.node')
    if(nodes)
        nodes.remove()
    
    let links = d3.selectAll('.link')
    if(links)
        links.remove()

    radial(graph.vertices[0])

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
        .attr('transform', d => 'rotate(0)')

    edgeEnter
        .append('line')
        .attr('x1', d => d.source.x + conf.width / 2)
        .attr('y1', d => d.source.y + conf.height / 2)
        .attr('x2', d => d.target.x + conf.width / 2)
        .attr('y2', d => d.target.y + conf.height / 2)
        .style('stroke', '#000000')
        .attr('stroke-width', 1)

    let nodes = conf.node
        .data(graph.vertices)

    let nodeEnter = nodes
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => 'rotate(0)')

    nodeEnter
        .append('circle')
        .attr('id', d => 'node' + d.id)
        .on('click', d => {
            if (d3.event.ctrlKey)
                collapseClick(d, render, graph, conf, setupAncillary)
            else {
                setupAncillary(d.ancillary)
            }
        })
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