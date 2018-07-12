<template>
    <b-card>
        <b-card-body>
            <h1>{{project.name}}</h1>
            <p><strong>Owner: </strong>{{project.owner}}</p>
            <div class='form-inline'>
                <button class='btn btn-outline-info mr-sm-2' ><a :href='encodedURI' :download='`${project.name}.json`'>Export</a></button>
                <Request :href='`/projects/${project._id}/export`' :onSuccess='onExport' />
                <button class='btn btn-outline-danger mr-sm-2' @click='remove'>Delete</button>
                <Request v-if='requests.remove' :href='`/projects/${project._id}`' method='DELETE' :onSuccess='onRemove' />
                <b-form-input v-model='contributor' class='mr-sm-2' type='text' placeholder='Username'></b-form-input>
                <button class='btn btn-outline-success mr-sm-2' @click='share'>Share</button>
                <Request v-if='requests.share' :href='`/projects/${project._id}/share/${contributor}`' method='POST' :json='shared' :onSuccess='onShare' />
            </div>
            <hr>
            <p><strong>Dataset name: </strong>{{project.dataset.name}}</p>
            <p><strong>Count: </strong>{{project.dataset.count}}</p>
            <p><strong>Loci: </strong>{{project.dataset.loci.reduce((acc, curr) => acc + curr + ', ', '').slice(0, -2)}}</p>
            <p><strong>URL: </strong>{{project.dataset.url}}</p>
            <hr>
            <p>Select the processing algorithm:</p>
            <b-form-select v-model='selected' :options='options' class='mb-3'></b-form-select>
            <p>Select the number of LVs to consider during comparation: </p>
            <div class='form-row align-items-center'>
                <div class='col-auto'>
                    <b-form-input v-model='lvs' type='number' min='1' value='3' :max='project.dataset.loci.length'></b-form-input>
                </div>
            </div>
            <br>
            <div class='form-row align-items-center'>
                <div class='col-auto'>
                    <button class='btn btn-outline-success' @click='process'>Process</button>
                </div>
                <div class='col-auto'>
                    <Request v-if='requests.process' href='/process' method='POST' :json='data' :onSuccess='onProcess' />
                </div>
                <div class='col-auto'>
                    <Request v-if='requests.save' :href='`/projects/${project._id}`' method='PUT' :json='computation' :onSuccess='onSave' />
                </div>
            </div>
            <hr>
            <p>Select the computation to render:</p>
            <b-form-select v-model='selectedComputation' :options='computations' class='mb-3' :select-size='3' />
            <p>Select the rendering algorithm:</p>
            <b-form-select v-model='selectedRender' :options='renderOptions' class='mb-3'></b-form-select>
            <button class='btn btn-outline-success' @click='draw' :disabled='!selectedComputation'>Render</button>
        </b-card-body>
    </b-card>
</template>

<script>
    export default {
        data () {
            return {
                project: this.$store.state.project,
                encodedURI: undefined,
                selected: 'goeburst',
                lvs: 3,
                options: [
                    { value: 'goeburst', text: 'GoeBURST' }
                ],
                selectedComputation: undefined,
                computations: [],
                computation: undefined,
                selectedRender: 'forcedirected',
                renderOptions: [
                    { value: 'forcedirected', text: 'Force-Directed Layout' },
                    { value: 'grapetree', text: 'GrapeTree Layout' },
                    { value: 'radial', text: 'Radial Static Layout' }
                ],
                contributor: undefined,
                data: undefined,
                shared: undefined,
                requests: {
                    remove: false,
                    share: false,
                    process: false,
                    save: false
                }
            }
        },
        created() {
            Object.keys(this.project.computations).forEach(computation => 
                Object.keys(this.project.computations[computation]).forEach(lvs => 
                    this.computations.push({ text: `${computation} (${lvs})`, value: this.project.computations[computation][lvs] })))
        },
        methods: {
            onExport(project) {
                this.encodedURI = encodeURI(`data:text/json;charset=utf-8,${JSON.stringify(project)}`)
            },
            remove() {
                this.requests.remove = true
            },
            onRemove() {
                this.$store.commit('setProject', undefined)
                this.$router.push('/projects')
            },
            share() {
                this.shared = {
                    name: `${this.project.name} (Shared by ${this.project.owner})`
                }
                this.requests.share = true
            },
            onShare() {
                this.project.contributors.push(this.contributor)
                return `Project successfully shared with ${this.contributor}.`
            },
            process() {
                if (this.computations.some(computation => computation.text === `${this.selected} (${this.lvs})`))
                    return
                this.data = {
                    processor: this.selected,
                    profiles: this.project.dataset.profiles,
                    lvs: this.lvs
                }
                this.requests.process = true
            },
            onProcess(result) {
                this.computation = {
                    algorithm: this.selected,
                    lvs: this.lvs,
                    computation: result
                }
                this.requests.process = false
                this.requests.save = true
            },
            onSave(project) {
                this.project = project
                this.computations.push({ text: `${this.selected} (${this.lvs})`, value: project.computations[this.selected][this.lvs] })
                this.$store.commit('setProject', this.project)
                return 'Computation saved to project.'
            },
            draw() {
                const info = {
                    name: this.project.dataset.name,
                    graph: this.project.computations[this.selected][this.lvs].graph,
                    ancillary: this.project.ancillary,
                    render: this.selectedRender
                }
                this.$store.commit('setProject', info)
                this.$router.push('/canvas')
            }
        }
    }
</script>