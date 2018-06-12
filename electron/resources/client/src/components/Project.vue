<template>
    <div>
        <i class='fa fa-spinner fa-spin' v-if='loading' style='font-size:36px'></i>
        <b-alert :show='error' variant='danger' dismissible>An error has occurred</b-alert>
        <br>
        <b-card>
            <b-card-body>
                <h1>{{this.project.name}}</h1>
                <p><strong>Owner: </strong>{{this.project.owner}}</p>
                <br>
                <p><strong>Dataset name: </strong>{{this.project.dataset.name}}</p>
                <p><strong>Count: </strong>{{this.project.dataset.count}}</p>
                <p><strong>Loci: </strong>{{this.project.dataset.loci}}</p>
                <p><strong>URL: </strong>{{this.project.dataset.url}}</p>
                <hr>
                <p>Select the algorithm to process the dataset's profiles:</p>
                <b-form-select v-model='selected' :options='options' class='mb-3'></b-form-select>
                <br>
                <button class='btn btn-outline-success' @click='compute'>Add Computation</button>
                <br>
                <b-form-select v-model='selectedComputation' :options='computations' class='mb-3' :select-size='4' />

                <p>Select the rendering algorithm:</p>
                <b-form-select v-model='selectedRender' :options='renderOptions' class='mb-3'></b-form-select>
                <button class='btn btn-outline-success' @click='sendToCanvas' :disabled='this.selectedComputation === undefined'>Render</button>
                <br>
                <button class='btn btn-outline-success' @click='saveProject'>Save Project</button>
                <button class='btn btn-outline-danger' @click='deleteProject'>Delete Project</button>
            </b-card-body>
        </b-card>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                project: undefined,
                selected: 'goeburst',
                options: [
                    { value: 'goeburst', text: 'GoeBURST' }
                ],
                selectedComputation: undefined,
                computations: undefined,
                selectedRender: 'forcedirected',
                renderOptions: [
                    { value: 'forcedirected', text: 'Force-Directed Layout' },
                    { value: 'grapetree', text: 'GrapeTree Layout' },
                    { value: 'radial', text: 'Radial Static Layout' }
                ],
                loading: false,
                error: undefined,
            }
        },
        created() {
            this.project = this.$store.state.project
            this.computations = Object.keys(this.project.computations)
        },
        methods: {
            compute() {
                this.loading = true
                const options = {
                    method: 'POST',
                    body: JSON.stringify(this.project.dataset.profiles),
                    headers: { 'content-type': 'application/json' }
                }
                fetch(`http://localhost:3000/algorithms/${this.selected}`, options).then(res => res.json()).then(({ graph, matrix }) => {

                    console.log(graph)
                    this.project.computations[this.selected] = { graph, matrix }
                    this.computations.push(this.selected)
                    this.$store.commit('setProject', this.project)
                    this.loading = false
                })
            },
            sendToCanvas() {
                const info = {
                    name: this.project.dataset.name,
                    graph: this.project.computations[this.selected].graph,
                    render: this.selectedRender
                }
                window.sessionStorage.setItem('project', JSON.stringify(info))
                this.loading = false
                this.$router.push('/canvas')
            },
            saveProject() {
                this.loading = true
                const options = {
                    method: 'PUT',
                    body: JSON.stringify(this.project),
                    headers: { 'content-type': 'application/json' },
                    credentials: 'include'
                }
                fetch(`http://localhost:3000/projects/${this.project._id}`, options).then(res => {
                    
                    this.loading = false
                })
            },
            deleteProject() {
                this.loading = true
                const options = {
                    method: 'DELETE',
                    credentials: 'include'
                }
                fetch(`http://localhost:3000/projects/${this.project._id}`, options).then(res => {
                    
                    this.$store.commit('setProject', undefined)
                    this.$router.push('/projects')
                    this.loading = false
                })
            }
        }
    }
</script>
