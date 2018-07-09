'use strict'

import * as d3 from 'd3'

import renders from './renders'

let link, node, simulation, conf

function init(algorithm) {

    const zoom = d3.zoom()
    let svg = d3.select('#canvas')
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
        const visibility = labels.style('visibility') === 'visible' ? 'hidden' : 'visible'
        labels.style('visibility', visibility)
    }

    function collapseClick(d, render, graph, conf, ancillary) {
        if (!d3.event.defaultPrevented) {
            if (d.children.length > 0) {
                d._children = d.children
                d.children = []
            } else if (d._children && d._children.length > 0) {
                d.children = d._children
                d._children = []
            }
            graph.vertices = flatten(graph.vertices[0])
            render(graph, conf, collapseClick, ancillary)
        }
    }

    function parseAncillary(ancillary, header) {
        const data = []
        ancillary.forEach(ancillary => {
            const info = data.find(d => d[header] === ancillary[header])
            if (info)
                info.count += 1
            else
                data.push({ [header]: ancillary[header], count: 1 })
        })
        return data
    }
    // This function is taken from http://bl.ocks.org/jdarling/06019d16cb5fd6795edf
    function randomColor() {
        let golden_ratio_conjugate = 0.618033988749895
        let h = Math.random()

        const hslToRgb = function (h, s, l) {
            let r, g, b
            if (s == 0)
                r = g = b = l
            else {
                function hue2rgb(p, q, t) {
                    if (t < 0) t += 1
                    if (t > 1) t -= 1
                    if (t < 1 / 6) return p + (q - p) * 6 * t
                    if (t < 1 / 2) return q
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
                    return p
                }

                let q = l < 0.5 ? l * (1 + s) : l + s - l * s
                let p = 2 * l - q
                r = hue2rgb(p, q, h + 1 / 3)
                g = hue2rgb(p, q, h)
                b = hue2rgb(p, q, h - 1 / 3)
            }
            return '#' + Math.round(r * 255).toString(16) + Math.round(g * 255).toString(16) + Math.round(b * 255).toString(16)
        }

        return () => {
            h += golden_ratio_conjugate
            h %= 1
            return hslToRgb(h, 0.5, 0.60)
        }
    }

    function setupAncillary(ancillary) {
        if (ancillary.length > 0) {
            const headers = []
            for (const header in ancillary[0])
                if (ancillary[0].hasOwnProperty(header))
                    headers.push(header)
            
            const canvas = d3.select('#ancillaryCanvas')
            if (canvas)
                canvas.remove()

            const text = d3.select('#textAncillary')
            if (text)
                text.remove()

            const button = d3.select('#ancillaryButtons')
            if (button)
                button.remove()

            const id = ancillary[0].st

            d3.select('#ancillary')
                .append('text')
                .attr('id', 'textAncillary')
                .text('Selected node ' + id)
            
            d3.select('#ancillary')
                .append('div')
                .attr('id', 'ancillaryButtons')

            const buttonsDiv = d3.select('#ancillaryButtons')

            headers.forEach(header => {
                buttonsDiv
                    .append('button')
                    .attr('id', 'ancillaryButton')
                    .attr('class', 'btn btn-outline-primary mr-sm-2')
                    .text(header)
                    .on('click', () => drawPieChart(ancillary, header))
            })
        }
    }

    function drawPieChart(ancillary, header) {
        if (ancillary.length > 0) {

            let canvas = d3.select('#ancillaryCanvas')
            if (canvas)
                canvas.remove()
            
            const data = parseAncillary(ancillary, header)

            const color = randomColor()

            canvas = d3.select('#ancillary')
                .append('canvas')
                .attr('id', 'ancillaryCanvas')
                .attr('height', conf.height)
                .attr('width', conf.width)
                .style('border', '1px solid black')

            const context = canvas.node().getContext('2d')

            const radius = Math.min(conf.width, conf.height) / 2

            const arc = d3.arc()
                .outerRadius(radius - 10)
                .innerRadius(0)
                .context(context)

            const labelArc = d3.arc()
                .outerRadius(radius - 70)
                .innerRadius(radius - 70)
                .context(context)

            const pie = d3.pie()
                .sort(null)
                .value(d => d.count)

            context.translate(conf.width / 2, conf.height / 2)

            const arcs = pie(data)

            arcs.forEach(d => {
                context.beginPath()
                arc(d)
                context.fillStyle = color()
                context.fill()
            })

            context.beginPath()
            arcs.forEach(arc)
            context.strokeStyle = '#fff'
            context.stroke()

            context.textAlign = 'center'
            context.textBaseline = 'middle'
            context.fillStyle = '#000'
            context.font = '15px Arial'
            arcs.forEach(d => {
                const coordinates = labelArc.centroid(d)
                context.fillText(d.data[header] + ' (' + d.data.count + ')', coordinates[0], coordinates[1])
            })
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
        render: graph => renders[algorithm](graph, conf, collapseClick, setupAncillary),
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