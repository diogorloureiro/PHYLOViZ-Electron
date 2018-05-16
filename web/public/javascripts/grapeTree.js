'use strict'

function generateDirectedGraph(graph) {
    const new_graph = { vertices: [], edges: [] }
    buildDirectedGraph(undefined, graph.vertices[0], graph, new_graph)
    // Order was reversed after build, last vertice was the root
    new_graph.vertices.reverse()
    return new_graph
}

// Recursively builds a directed graph out of an MST
function buildDirectedGraph(parent, node, graph, new_graph) {
    // Insert the edges where the node is either the source or the target into the new_graph
    // Delete these from the old graph due to reversing these when you are in the nodes children
    graph.edges.forEach((edge, index) => {
        if (edge.source === node.id) {
            new_graph.edges.push(edge)
            delete graph.edges[index]
        } else if (edge.target === node.id) {
            new_graph.edges.push({
                source: edge.target,
                target: edge.source,
                distance: edge.distance
            })
            delete graph.edges[index]
        }
    })
    // Retrieve from the new_graph the edges to the children
    const edges = new_graph.edges.filter(edge => edge.source === node.id)
    // Retrieve the edge that connects the child to the parent
    const edge = new_graph.edges.find(edge => parent && edge.source === parent.id && edge.target === node.id)
    node = {
        id: node.id,
        children: edges.map(edge => ({ id: edge.target })),
        size: 5, // to be changed into an actual radius
        distance: edge ? edge.distance : 0 // root node doesn't have parent
    }
    // Recursive call and replace the dummy children with real ones
    node.children = node.children.map(child => buildDirectedGraph(node, child, graph, new_graph))
    // Can't push before or else dummy children are still there (can possibly improve)
    new_graph.vertices.push(node)
    return node
}

function grapetree(nodes, linkScale) {
	let maxRadius = 0.0, minGap = 0.0
	nodes.forEach(node => {
		if (!node.size) node.size = (node.children && node.children.length > 0 ? 0.01 : 1)
		if (node.distance > maxRadius) maxRadius = node.distance
		minGap += node.size
	})
	const minRadius = (maxRadius / linkScale) * 2 * Math.pow(nodes[nodes.length - 1].size, 0.5)
	minGap = minRadius * Math.PI / minGap
	for (let trials = 0; trials < 20; trials++) {
		const gaps = []
		let maxSpan
		for (let i = 0; i < 11; i++) {
			maxSpan = [[], 0]
			for (let index = nodes.length - 1; index >= 0; index--)
				maxSpan = descendentsRadius(nodes[index], minRadius, minGap, maxSpan, index)
			if (Math.PI >= maxSpan[1]) {
				gaps.push(minGap)
				if (Math.PI < 1.05 * maxSpan[1]) break
			}
			if (i == 9) {
				gaps.sort((r1, r2) => r2 - r1)
				minGap = gaps[0]
			} else if (i < 9)
				minGap = (Math.PI / maxSpan[1]) * minGap
		}
		if (trials == 19) maxSpan[0] = [0]
		maxSpan[0].forEach(index => setSpacing(nodes[index], minGap))
		if (!maxSpan[0].length) break
	}
	return convertToCartesian(nodes, minRadius)
}

function descendentsRadius(node, minRadius, minGap, maxSpan, index) {
	if (node.spacing) return maxSpan
	const nr = Math.pow(node.size, 0.5)
	const span1 = [minRadius * nr, Math.asin(minGap * nr / minRadius)]
	let radius = 0, angle = 0 // descending span
	node.children.forEach(child => {
		if (child.descendentsSpan) {
			let selfRadius = minRadius * Math.sqrt(node.size) + child.distance
			let span
			if (Math.cos(Math.PI - child.descendentsSpan[1]) > child.descendentsSpan[0] / selfRadius) {
				if (child.descendentsSpan[0] < selfRadius)
					span = [selfRadius, Math.asin(child.descendentsSpan[0] / selfRadius)]
			} else {
				span = toPolar(toCartesian(child.descendentsSpan), [-selfRadius, 0])
				span[0] = Math.max(span[0], selfRadius, child.descendentsSpan[0])
			}
			child.selfSpan = span
			angle += span[1] + minGap / span[0]
			if (span[0] > radius) radius = span[0]
		}
	})
	const span2 = [radius, angle]
	node.descendentsSpan = [Math.max(span1[0], span2[0]), span2[1]] //Math.max(span1[1], span2[1])]
	if (span1[0] * span1[1] > node.descendentsSpan[0] * node.descendentsSpan[1])
		node.descendentsSpan[1] = (span1[0] * span1[1]) / node.descendentsSpan[0]
	node.descendentsAngle = span2[1]
	if (node.descendentsSpan[1] > maxSpan[1])
		maxSpan = [[index], node.descendentsSpan[1]]
	else if (node.descendentsSpan[1] == maxSpan[1])
		maxSpan[0].push(index)
	if (node.descendentsSpan[1] > Math.PI) node.descendentsSpan[1] = Math.PI
	return maxSpan
}

function convertToCartesian(nodes, minRadius) {
	const coordinates = {}
	nodes.forEach((node, index) => {
		let initialAngle, gap
		if (index > 0) {
			initialAngle = -node.descendentsAngle
			gap = 0
		} else {
			initialAngle = 0
			gap = Math.max(0, (Math.PI - node.descendentsAngle) / node.children.length)
			node.polar = [0, 0]
			node.coordinates = [0, 0]
		}
		const selfRadial = minRadius * Math.sqrt(node.size)
		coordinates[node.id] = node.coordinates
		if (node.children) {
			if (node.children.length > 2)
				node.children.sort((c1, c2) => hashCode(c1.id) - hashCode(c2.id))
			node.children.forEach(child => {
				const minAngle = node.spacing / child.selfSpan[0]
				child.polar = [child.distance + selfRadial, initialAngle + child.selfSpan[1] + minAngle + node.polar[1]]
				initialAngle += (child.selfSpan[1] + minAngle + gap) * 2
				child.coordinates = toCartesian(child.polar)
				child.coordinates[0] += node.coordinates[0]
				child.coordinates[1] += node.coordinates[1]
			})
		}
		delete node.spacing, delete node.descendentsAngle, delete node.descendentsSpan, delete node.polar, delete node.coordinates
	})
	return coordinates
}

function setSpacing(node, minGap) {
	node.spacing = minGap
	if (node.children)
		node.children.forEach(child => child.spacing || setSpacing(child, minGap))
}

function hashCode(s) {
	return s.split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
}

function toCartesian(coord, center) {
	center = center || [0, 0]
	const radius = coord[0], angle = coord[1]
	return [radius * Math.cos(angle) + center[0], radius * Math.sin(angle) + center[1]]
}
function toPolar(coord, center) {
	center = center || [0, 0]
	const x = coord[0] - center[0], y = coord[1] - center[1]
	return [Math.sqrt(x * x + y * y), Math.atan2(y, x)]
}

//////////////////////////////////////////////////////////////////////D3//////////////////////////////////////////////////////////////////////


function createGrapeTree(graph) {

    const width = 1000
    const height = 1000

    const svg = d3.select('body')
        .append('svg')
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom().on("zoom", () => svg.attr("transform", d3.event.transform))).append('g')

    let link = svg.append('g')
        .attr('class', 'links')
        .selectAll('line')

    let node = svg.append('g')
        .attr('class', 'nodes')
        .selectAll('circle')
    const n = 1
    link = link.data(graph.edges)
        .enter()
        .append('line')
        .attr("x1", d => n * d.source.DCS.radius * Math.cos(d.source.DCS.angle) + width / 2)
        .attr("y1", d => n * d.source.DCS.radius * Math.sin(d.source.DCS.angle) + height / 2)
        .attr("x2", d => n * d.target.DCS.radius * Math.cos(d.target.DCS.angle) + width / 2)
        .attr("y2", d => n * d.target.DCS.radius * Math.sin(d.target.DCS.angle) + height / 2)
        .attr('stroke-width', 1)

    let nodes = node
        .data(graph.vertices)
        .enter()
        .append("circle")
        .attr("cx", d => (d.DCS.radius * n) * Math.cos(d.DCS.angle) + width / 2)
        .attr("cy", d => (d.DCS.radius * n) * Math.sin(d.DCS.angle) + height / 2)
        .attr("r", function (d) { return d.circle_radius })
        .style("fill", "green");

}