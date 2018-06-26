<template>
        <div>
            <i class='fa fa-spinner fa-spin' v-if='loading' style='font-size:36px'></i>
            <b-alert :show='error' variant='danger' dismissible>An error has occurred while rendering the graph</b-alert>
            <br>
            <strong>{{this.project.name}}</strong>
            <svg id='canvas' width='500' height='400' style='border:1px solid black'></svg>
            <div>
                <br>
                <label for='cut-value'>Tree cut-off</label>
                <input id='cut-value' type='number' v-model='cut' min='0' :max='maxCut'>
                <button class='btn btn-outline-success' id='cut-button' @click='cutOff'>Apply</button>
                <label for='search-input'>Search: </label>
                <input id='search-input' type='text' name='Search' v-model='nodeId'>
                <button class='btn btn-outline-success' id='search-button' @click='search'>Search</button>
                <p>Animation speed</p>
                <input id='slider' type='range' min='0' max='100' v-model='speed' @change='sliderChange'>
            </div>
        </div>
</template>

<script>
    import init from '../javascripts'
    import * as d3 from 'd3'

    export default {
        data() {
            return {
                canvas: undefined,
                functions: undefined,
                project: undefined,
                graph: undefined,
                flattenGraph: undefined,
                ancillary: undefined,
                algorithm: undefined,
                speed: 50,
                cut: 0,
                maxCut: 0,
                nodeId: '',
                loading: false,
                error: null
            }
        },
        mounted() {
            this.canvas = d3.select('svg')
            this.algorithm = this.project.render
            this.functions = init(this.canvas, this.algorithm)
            this.cut = this.maxCut = Math.max(...this.project.graph.edges.map(e => e.distance))
            this.graph = this.functions.direct(this.project.graph)
            this.flattenGraph = {
                    vertices: this.functions.flatten(this.graph.root),
                    edges: this.graph.edges
            }
            this.ancillary = this.project.ancillary.head || []
            this.functions.ancillary(this.flattenGraph, this.project.ancillary.body)
            this.render()
        },
        created() {
            this.project = JSON.parse(window.sessionStorage.getItem('project'))
            console.log('project : '+this.project)
        },
        watch: {
            // call again the method if the route changes
            '$route': 'render'
        },
        methods: {
            render() {
                this.loading = true
                const graph = this.flattenGraph
                graph.edges = this.flattenGraph.edges.filter(e => e.distance <= this.cut)
                this.functions.render(graph)
                this.loading = false
            },
            sliderChange() {
                this.functions.updateSpeed(this.speed / 100)
            },
            cutOff() {
                this.render()
            },
            search() {
                this.functions.search(this.nodeId)
            }
        }
    }
</script>