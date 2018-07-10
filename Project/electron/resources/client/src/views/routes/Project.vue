<template>
    <div>
        <br>
        <Request :href='`/projects/${project._id}/export`' :onSuccess='onExport' />
        <Request v-if='requests.remove' :href='`/projects/${project._id}`' method='DELETE' :onSuccess='onRemove' />
        <Request v-if='requests.share' :href='`/projects/${project._id}/share/${contributor}`' method='POST' :json='shared' :onSuccess='onShare' />
        <Request v-if='requests.upload' href='/ancillary/file' method='POST' :data='file' :onSuccess='onUpload' />
        <Request v-if='requests.load' :href='`/ancillary/${url}`' :onSuccess='onLoad' />
        <Request v-if='requests.process' href='/process' method='POST' :json='data' :onSuccess='onProcess' />
        <Request v-if='requests.save' :href='`/projects/${project._id}`' method='PUT' :json='computation' :onSuccess='onSave' />
        <b-card :show='!!project'>
            <b-card-body>
                <h1>{{project.name}}</h1>
                <p><strong>Owner: </strong>{{project.owner}}</p>
                <div class='form-inline'>
                    <b-form-input v-model='contributor' class='mr-sm-2' type='text' placeholder='Username'></b-form-input>
                    <button class='btn btn-outline-success mr-sm-2' @click='share'>Share</button>
                    <button class='btn btn-outline-info mr-sm-2' ><a :href='encodedURI' :download='`${project.name}.json`'>Export</a></button>
                    <button class='btn btn-outline-danger mr-sm-2' @click='remove'>Delete</button>
                </div>
                <hr>
                <p><strong>Dataset name: </strong>{{project.dataset.name}}</p>
                <p><strong>Count: </strong>{{project.dataset.count}}</p>
                <p><strong>Loci: </strong>{{project.dataset.loci.reduce((acc, curr) => acc + curr + ', ', '').slice(0, -2)}}</p>
                <p><strong>URL: </strong>{{project.dataset.url}}</p>
                <hr>
                <p>Select the algorithm to process the dataset's profiles:</p>
                <b-form-select v-model='selected' :options='options' class='mb-3'></b-form-select>
                <p>LVs: </p>
                <div class='row'>
                    <div class='col-lg-2'>
                        <b-form-input v-model='lvs' type='number' min='1' value='3' :max='project.dataset.loci.length'></b-form-input>
                    </div>
                </div>
                <br>
                <button class='btn btn-outline-success' @click='process'>Process</button>
                <hr>
                <p>Select the computation to render:</p>
                <b-form-select v-model='selectedComputation' :options='computations' class='mb-3' :select-size='3' />
                <p>Select the rendering algorithm:</p>
                <b-form-select v-model='selectedRender' :options='renderOptions' class='mb-3'></b-form-select>
                <button class='btn btn-outline-primary' @click='show = !show'>Ancillary</button>
                <b-card-body v-if='show'>
                    <div class='row'>
                        <div class='col-lg-6'>
                            <b-form-file v-model='inputFile' :state='!!inputFile' placeholder='Choose an ancillary data file' accept='.csv, .txt, .db'></b-form-file>
                        </div>
                        <div class='col-lg'>
                            <button class='btn btn-outline-secondary' @click='upload'>Upload</button>
                        </div>
                        <div class='col-lg-6'>
                            <b-form-input v-model='url' type='text' placeholder='Enter the ancillary data URL'></b-form-input>
                        </div>
                        <div class='col-lg'>
                            <button class='btn btn-outline-secondary' @click='load'>Load</button>
                        </div>
                    </div>
                </b-card-body>
                <div v-if='ancillary.head' class='mt-3'>Selected ancillary file: {{inputFile && inputFile.name}}</div>
                <button class='btn btn-outline-success' @click='draw' :disabled='!selectedComputation'>Render</button>
            </b-card-body>
        </b-card>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                project: undefined,
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
                inputFile: undefined,
                file: undefined,
                data: undefined,
                url: undefined,
                ancillary: {},
                shared: undefined,
                show: false,
                requests: {
                    remove: false,
                    share: false,
                    upload: false,
                    load: false,
                    process: false,
                    save: false
                }
            }
        },
        created() {
            this.project = this.$store.state.project
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
                    ancillary: this.ancillary,
                    render: this.selectedRender
                }
                this.$store.commit('setProject', info)
                this.$router.push('/canvas')
            },
            upload() {
                this.requests.upload = true
                const file = new FormData()
                file.append('file', this.inputFile)
                this.file = file
            },
            onUpload(ancillary) {
                this.ancillary = ancillary
                this.requests.upload = false
                this.show = false
            },
            load() {
                this.requests.load = true
            },
            onLoad(ancillary) {
                this.ancillary = ancillary
                this.requests.load = false
            }
        }
    }
</script>