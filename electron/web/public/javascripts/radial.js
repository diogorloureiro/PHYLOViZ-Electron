'use strict'

import * as d3 from 'd3'

const defaultDistanceMultiplier = 100
const defaultZeroDistanceValue = 10

function radial(root) {
    const leafcount = leafcount(root)
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
            child.wedge = (2 * Math.PI) * leafcount(child) / leafcount
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

function init(canvas) {
    const height = 700
    const width = 1400
    
    const svg = canvas
        .attr('width', width)
        .attr('height', height)
        .call(d3.zoom().on('zoom', () => svg.attr('transform', d3.event.transform))).append('g')

    let link = svg.append('g')
        .attr('class', 'links')
        .selectAll('line')

    const node = svg.append('g')
        .attr('class', 'nodes')
        .selectAll('circle')

    function render(graph) {
        const vertices = graph.vertices
        radial(vertices[0])

        link = link
            .data(vertices)

        let edgeEnter = link
            .enter()
            .append('g')
            .attr('transform', d => 'rotate(0)')

        let line = edgeEnter
            .append('line')
            .attr('x1', d => d.x + width / 2)
            .attr('y1', d => d.y + height / 2)
            .attr('x2', d => d.xp + width / 2)
            .attr('y2', d => d.yp + height / 2)
            .style('stroke', '#000000')
            .attr('stroke-width', 1)

        let nodes = node
            .data(vertices)

        let nodeEnter = nodes
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', d => 'rotate(0)')

        let circle = nodeEnter
            .append('circle')
            .attr('id', d => d.id)
            .attr('cx', d => d.x + width / 2)
            .attr('cy', d => d.y + height / 2)
            .attr('r', 5)
            .style('fill', '#00549f')

        nodeEnter
            .append('text')
            .style('visibility', 'visible')
            .attr('dx', -1)
            .attr('dy', 0)
            .attr('x', d => d.x + width / 2)
            .attr('y', d => d.y + height / 2)
            .text(d => d.id)
            .style('font-size', d => d.size / 3 + 'px')
    }

    return {
        render
    }
}

export default init