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
                <input id='cut-value' type='number' v-model='cut' min='0' :max='maxCut'>
                <button class='btn btn-outline-success' id='cut-button' @click='cut'>Apply</button>
                <label for='search-input'>Search: </label>
                <input id='search-input' type='text' name='Search' v-model='nodeId'>
                <button class='btn btn-outline-success' id='search-button' @click='search'>Search</button>
                <p>Animation speed</p>
                <input id='slider' type='range' min='0' max='1' v-model='speed' @change='sliderChange'>
            </div>
        </div>
</template>

<script>
    import init from '../../public/javascripts'
    import * as d3 from 'd3'

    export default {
        data() {
            return {
                canvas: undefined,
                functions: undefined,
                dataset: undefined,
                graph: undefined,
                speed: 0.5,
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
            this.functions = init(this.canvas)
            this.render()
        },
        created() {
            this.dataset = JSON.parse(window.sessionStorage.getItem('dataset'))
        },
        watch: {
            // call again the method if the route changes
            '$route': 'render'
        },
        methods: {
            render() {
                this.loading = true
                this.cut = this.maxCut = Math.max(...this.graph.edges.map(e => e.distance))
                const render = JSON.parse(window.sessionStorage.getItem('render-algorithm'))
                this.graph = this.functions.direct(this.dataset.graph)
                this.graph.root = this.function.flatten(this.graph.root)
                if(render === 'forcedirected')
                    this.forceOptions = true
                this.functions[render].render(this.graph, this.cut)
                this.loading = false
            },
            sliderChange() {
                this.functions['forcedirected'].updateSpeed(this.speed)
            },
            cut() {
                this.functions['forcedirected'].render(this.graph, this.cut, this.speed)
            },
            search() {
                search(this.nodeId)
            }
        }
    }
</script>