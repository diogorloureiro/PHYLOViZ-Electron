<template>
    <div>
        <i class='fa fa-spinner fa-spin' v-if='loading' style='font-size:36px'></i>
        <b-alert :show='infoMsg !== undefined' variant='info' dismissible>{{this.infoMsg}}</b-alert>
        <br>
        <b-card>
            <b-card-body>
                <h1>{{this.project.name}}</h1>
                <p><strong>Owner: </strong>{{this.project.owner}}</p>
                <br>
                <p><strong>Dataset name: </strong>{{this.project.dataset.name}}</p>
                <p><strong>Count: </strong>{{this.project.dataset.count}}</p>
                <p><strong>Loci: </strong>{{this.project.dataset.loci.reduce((acc, curr) => acc + curr + ', ', '').slice(0, -2)}}</p>
                <p><strong>URL: </strong>{{this.project.dataset.url}}</p>
                <hr>
                <p>Select the algorithm to process the dataset's profiles:</p>
                <b-form-select v-model='selected' :options='options' class='mb-3'></b-form-select>
                <p>LVs: </p>
                <div class='row'>
                    <div class='col-lg-2'>
                        <b-form-input v-model='lvs' type='number' min='1' value='3' :max='this.project.dataset.loci.length'></b-form-input>
                    </div>
                </div>
                <br>
                <button class='btn btn-outline-success' @click='compute'>Add Computation</button>
                <br>
                <b-form-select v-model='selectedComputation' :options='computations' class='mb-3' :select-size='3' />

                <p>Select the rendering algorithm:</p>
                <b-form-select v-model='selectedRender' :options='renderOptions' class='mb-3'></b-form-select>
                <button class='btn btn-outline-success' @click='sendToCanvas' :disabled='this.selectedComputation === undefined'>Render</button>
                <hr>
                <button class='btn btn-outline-success' @click='saveProject'>Save Project</button>
                <button class='btn btn-outline-danger' @click='deleteProject'>Delete Project</button>
                <hr>
                <b-form-input v-model='contributor' type='text' placeholder='Enter the persons username'></b-form-input>
                <button class='btn btn-outline-success' @click='shareProject'>Share Project</button>
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
                lvs: 3,
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
                contributor: undefined,
                loading: false,
                infoMsg: undefined,
            }
        },
        created() {
            this.project = this.$store.state.project
            this.computations = Object.keys(this.project.computations)
        },
        methods: {
            compute() {
                if(this.computations.includes(this.selected))
                    return
                this.loading = true
                const options = {
                    method: 'POST',
                    body: JSON.stringify({
                        processor: this.selected,
                        profiles: this.project.dataset.profiles,
                        lvs: this.lvs
                    }),
                    headers: { 'content-type': 'application/json' }
                }
                fetch(`http://localhost:3000/process`, options).then(res => res.json()).then(({ graph, matrix }) => {

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
                    ancillary: {},
                    render: this.selectedRender
                }
                this.$store.commit('setProject', info)
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
                    
                    this.infoMsg = 'Project successfully saved.'
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
            },
            shareProject(contributor) {
                this.loading = true
                const options = {
                    method: 'POST',
                    body: JSON.stringify({ name: `${this.project.name} (Shared by ${this.project.owner})` }),
                    headers: { 'content-type': 'application/json' },
                    credentials: 'include'
                }
                fetch(`http://localhost:3000/projects/${this.project._id}/share/${this.contributor}`, options).then(res => {
                    
                    this.infoMsg = `Project successfully shared with ${this.contributor}.`
                    this.project.contributors.push(this.contributor)
                    this.loading = false
                })

            }
        }
    }
</script>
