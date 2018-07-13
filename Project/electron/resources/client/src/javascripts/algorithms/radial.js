'use strict'

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
