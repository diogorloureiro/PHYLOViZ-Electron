<template>
        <div>
            <div class='loading' v-if='loading'>Loading...</div>
            <div class='error' v-if='error'>An error has occurred while rendering the graph</div>
            <!--svg id='canvas' width='500' height='400' style='border:1px solid black'></svg-->
            <div>
                <br>
                <label for='cut-value'>Tree cut-off</label>
                <input id='cut-value' type='number' v-model='cut' min='0' v-bind:max='maxCut'>
                <button class='btn btn-outline-success' id='cut-button' v-on:click='cutFunc'>Apply</button>
                <label for='search-input'>Search: </label>
                <input id='search-input' type='text' name='Search' v-model='nodeId'>
                <button class='btn btn-outline-success' id='search-button' v-on:click='search'>Search</button>
                <p>Animation speed</p>
                <input id='slider' type='range' min='0' max='100' v-model='speed' v-on:change='sliderChange'>
            </div>
        </div>
</template>

<script>
    import { init, createForceDirected, updateSpeed, search } from '../../public/javascripts/forcedirected.js'
    import { generateDirectedGraph, grapetree, createGrapeTree, radialTree, createRadialTree } from '../../public/javascripts/grapetree.js'
    export default {
        data() {
            return {
                speed: 50,
                cut: 0,
                maxCut: 0,
                nodeId: '',
                graph: undefined,
                loading: false,
                error: null
            }
        },
        created() {
            this.renderGraph()
        },
        watch: {
            // call again the method if the route changes
            '$route': 'renderGraph'
        },
        methods: {
            renderGraph() {
                this.loading = true
                const graph = JSON.parse(window.sessionStorage.getItem('graph'))
                this.graph = graph
                const render = JSON.parse(window.sessionStorage.getItem('render-algorithm'))
                if(render === 'layout')
                    this.renderLayout(graph)
                else if(render === 'grapetree')
                    this.renderGrapeTree(graph)
                else if(render === 'radial')
                    this.renderRadial(graph)
                this.loading = false
            },
            sliderChange() {
                updateSpeed(this.speed / 100)
            },
            cutFunc() {
                createForceDirected(this.graph, this.cut, this.speed / 100)
            },
            search() {
                search(this.nodeId)
            },
            renderLayout(graph) {
                this.loading = true
                let maxCut = -1
                graph.edges.forEach(e => {
                    if (e.distance > maxCut) maxCut = e.distance
                })
                this.cut = maxCut
                this.maxCut = maxCut
                createForceDirected(graph, maxCut)
                this.loading = false
            },
            renderGrapeTree(graph) {
                this.loading = true
                const new_graph = generateDirectedGraph(graph)
                const coordinates = grapetree(new_graph.vertices, 1)
                new_graph.edges.forEach(edge => {
                    const [sx, sy] = coordinates[edge.source]
                    const [tx, ty] = coordinates[edge.target]
                    edge.source = { id: edge.source, x: sx, y: sy }
                    edge.target = { id: edge.target, x: tx, y: ty }
                })
                const data = []
                for (const id in coordinates) {
                    data.push({ id, x: coordinates[id][0], y: coordinates[id][1] })
                }
                new_graph.coordinates = data
                createGrapeTree(new_graph)
                this.loading = false
            },
            renderRadial(graph) {
                this.loading = true
                const new_graph = generateDirectedGraph(graph)
                radialTree(new_graph.vertices[0], new_graph.vertices)
                createRadialTree(new_graph.vertices)
                this.loading = false
            }
        }
    }
</script>
