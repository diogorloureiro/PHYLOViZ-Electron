<template>
        <div>
            <i class='fa fa-spinner fa-spin' v-if='loading' style='font-size:36px'></i>
            <b-alert :show='error' variant='danger' dismissible>An error has occurred while rendering the graph</b-alert>
            <br>
            <strong>{{this.dataset.name}}</strong>
            <svg id='canvas' width='500' height='400' style='border:1px solid black'></svg>
            <div v-if='forceOptions'>
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
    import { initForceDirected, createForceDirected, updateSpeed, search } from '../../public/javascripts/forcedirected.js'
    import { initGrapeTree, generateDirectedGraph, grapetree, createGrapeTree } from '../../public/javascripts/grapetree.js'
    import { initRadial, radialTree, createRadialTree } from '../../public/javascripts/radialtree.js'
    import * as d3 from 'd3'
    export default {
        data() {
            return {
                dataset: undefined,
                speed: 50,
                cut: 0,
                maxCut: 0,
                nodeId: '',
                forceOptions: false,
                loading: false,
                error: null
            }
        },
        mounted() {
            this.canvas = d3.select('svg')
            this.renderGraph()
        },
        created() {
            this.dataset = JSON.parse(window.sessionStorage.getItem('dataset'))
        },
        watch: {
            // call again the method if the route changes
            '$route': 'renderGraph'
        },
        methods: {
            renderGraph() {
                this.loading = true
                const graph = this.dataset.graph
                const render = JSON.parse(window.sessionStorage.getItem('render-algorithm'))
                if(render === 'layout') {
                    this.forceOptions = true
                    this.renderLayout(graph, this.canvas)
                }
                else if(render === 'grapetree')
                    this.renderGrapeTree(graph, this.canvas)
                else if(render === 'radial')
                    this.renderRadial(graph, this.canvas)
                this.loading = false
            },
            sliderChange() {
                updateSpeed(this.speed / 100)
            },
            cutFunc() {
                createForceDirected(this.dataset.graph, this.cut, this.speed / 100)
            },
            search() {
                search(this.nodeId)
            },
            renderLayout(graph, canvas) {
                this.loading = true
                initForceDirected(canvas)
                let maxCut = -1
                graph.edges.forEach(e => {
                    if (e.distance > maxCut) maxCut = e.distance
                })
                this.cut = maxCut
                this.maxCut = maxCut
                createForceDirected(graph, maxCut)
                this.loading = false
            },
            renderGrapeTree(graph, canvas) {
                this.loading = true
                initGrapeTree(canvas)
                const new_graph = generateDirectedGraph(graph)
                grapetree(new_graph.vertices, 1)
                new_graph.vertices.forEach(vertice =>{
                    new_graph.edges.forEach(edge => {
                        if(edge.source === vertice.id) edge.source = {coordinates:vertice.coordinates, id : vertice.id}
                        else if(edge.target === vertice.id) edge.target = {coordinates:vertice.coordinates, id : vertice.id}
                    })
                })
                createGrapeTree(new_graph)
                this.loading = false
            },
            renderRadial(graph, canvas) {
                this.loading = true
                initRadial(canvas)
                const new_graph = generateDirectedGraph(graph)
                radialTree(new_graph.vertices[0], new_graph.vertices)
                createRadialTree(new_graph.vertices)
                this.loading = false
            }
        }
    }
</script>
