'use strict'

import * as d3 from 'd3'

function grapetree(nodes, linkScale = 0.3, trials = 10) {
    let maxRadius = 0.0, minWedge = 0.0
    nodes.forEach(node => {
        if (!node.size)
            node.size = (node.children && node.children.length > 0 ? 0.01 : 1)
        if (node.distance > maxRadius)
            maxRadius = node.distance
        minWedge += node.size
    })
    const minRadius = (maxRadius / linkScale) * 2 * Math.pow(nodes[nodes.length - 1].size, 0.5)
    minWedge = minRadius * Math.PI / minWedge
    for (let trial = 0; trial < trials; trial++) {
        const wedges = []
        let maxSpan
        for (let i = 0; i < 11; i++) {
            maxSpan = [[], 0]
            for (let index = nodes.length - 1; index >= 0; index--)
                maxSpan = descendentsRadius(nodes[index], minRadius, minWedge, maxSpan, index)
            if (Math.PI >= maxSpan[1]) {
                wedges.push(minWedge)
                if (Math.PI < 1.05 * maxSpan[1])
                    break
            }
            if (i == 9) {
                wedges.sort((r1, r2) => r2 - r1)
                minWedge = wedges[0]
            } else if (i < 9)
                minWedge = (Math.PI / maxSpan[1]) * minWedge
        }
        if (trial == trials - 1)
            maxSpan[0] = [0]
        maxSpan[0].forEach(index => setSpacing(nodes[index], minWedge))
        if (!maxSpan[0].length)
            break
    }
    convertToCartesian(nodes, minRadius)
}

function descendentsRadius(node, minRadius, minWedge, maxSpan, index) {
    if (node.spacing) return maxSpan
    const nr = Math.pow(node.size, 0.5)
    const span1 = [minRadius * nr, Math.asin(minWedge * nr / minRadius)]
    let radius = 0, angle = 0
    node.children.forEach(child => {
        if (child.descendentsSpan) {
            let selfRadius = minRadius * Math.sqrt(node.size) + child.distance
            let span
            if (Math.cos(Math.PI - child.descendentsSpan[1]) > child.descendentsSpan[0] / selfRadius && child.descendentsSpan[0] < selfRadius)
                span = [selfRadius, Math.asin(child.descendentsSpan[0] / selfRadius)]
            else {
                span = toPolar(toCartesian(child.descendentsSpan), [-selfRadius, 0])
                span[0] = Math.max(span[0], selfRadius, child.descendentsSpan[0])
            }
            child.selfSpan = span
            angle += span[1] + minWedge / span[0]
            if (span[0] > radius)
                radius = span[0]
        }
    })
    const span2 = [radius, angle]
    node.descendentsSpan = [Math.max(span1[0], span2[0]), span2[1]]
    if (span1[0] * span1[1] > node.descendentsSpan[0] * node.descendentsSpan[1])
        node.descendentsSpan[1] = (span1[0] * span1[1]) / node.descendentsSpan[0]
    node.descendentsAngle = span2[1]
    if (node.descendentsSpan[1] > maxSpan[1])
        maxSpan = [[index], node.descendentsSpan[1]]
    else if (node.descendentsSpan[1] == maxSpan[1])
        maxSpan[0].push(index)
    if (node.descendentsSpan[1] > Math.PI)
        node.descendentsSpan[1] = Math.PI
    return maxSpan
}

function convertToCartesian(nodes, minRadius) {
    nodes.forEach((node, index) => {
        let initialAngle, wedge
        if (index > 0) {
            initialAngle = -node.descendentsAngle
            wedge = 0
        } else {
            initialAngle = 0
            wedge = Math.max(0, (Math.PI - node.descendentsAngle) / node.children.length)
            node.polar = [0, 0]
            node.coordinates = [0, 0]
        }
        const selfRadial = minRadius * Math.sqrt(node.size)
        if (node.children !== []) {
            if (node.children.length > 2)
                node.children.sort((c1, c2) => c1.id - c2.id)
            node.children.forEach(child => {
                const minAngle = node.spacing / child.selfSpan[0]
                child.polar = [child.distance + selfRadial, initialAngle + child.selfSpan[1] + minAngle + node.polar[1]]
                initialAngle += (child.selfSpan[1] + minAngle + wedge) * 2
                child.coordinates = toCartesian(child.polar)
                child.coordinates[0] += node.coordinates[0]
                child.coordinates[1] += node.coordinates[1]
            })
        }
        delete node.spacing, delete node.descendentsAngle, delete node.descendentsSpan, delete node.polar
    })
}

function setSpacing(node, minWedge) {
    node.spacing = minWedge
    if (node.children)
        node.children.forEach(child => child.spacing || setSpacing(child, minWedge))
}

function toCartesian(coord, center = [0, 0]) {
    const [radius, angle] = coord
    return [radius * Math.cos(angle) + center[0], radius * Math.sin(angle) + center[1]]
}
function toPolar(coord, center = [0, 0]) {
    const x = coord[0] - center[0], y = coord[1] - center[1]
    return [Math.sqrt(x * x + y * y), Math.atan2(y, x)]
}

function render(graph, conf, click) {

    d3.selectAll('.node').remove()
    d3.selectAll('.link').remove()

    grapetree(graph.vertices)

    graph.vertices.forEach(vertex => {
        graph.edges.forEach(edge => {
            const id = vertex.id
            const [x, y] = vertex.coordinates
            if (id === edge.source || id === edge.source.id)
                edge.source = { x, y, id }
            else if (id === edge.target || id === edge.target.id)
                edge.target = { x, y, id }
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

    let elemEnter = nodes
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => 'rotate(0)')

    elemEnter
        .append('circle')
        .attr('id', d => 'node' + d.id)
        .on('click', d => click(d, render, graph, conf))
        .attr('cx', d => d.coordinates[0] + conf.width / 2)
        .attr('cy', d => d.coordinates[1] + conf.height / 2)
        .attr('r', d => d.size)
        .attr('fill', d => d._children && d._children.length > 0 ? 'orange' : '#00549f')

    elemEnter
        .append('text')
        .attr('id', d => 'text' + d.id)
        .style('visibility', 'visible')
        .attr('dx', -1)
        .attr('dy', 1)
        .attr('x', d => d.coordinates[0] + conf.width / 2)
        .attr('y', d => d.coordinates[1] + conf.height / 2)
        .text(d => d.id)
        .style('font-size', d => (d.size / (d.id + '').length + 1) + 'px')
        .attr('fill', 'white')
}

export default render