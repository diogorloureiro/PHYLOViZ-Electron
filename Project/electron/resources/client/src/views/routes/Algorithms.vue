<template>
    <div>
        <Request v-if='requests.upload' href='/ancillary/file' method='POST' :data='file' :onSuccess='onUpload' />
        <Request v-if='requests.load' :href='`/ancillary/${url}`' :onSuccess='onLoad' />
        <b-card title=''>
            <b-card-body>
                <p><strong>Dataset Name: </strong>{{project.dataset.name}}</p>
                <p><strong>Count: </strong>{{project.dataset.count}}</p>
                <p><strong>Loci: </strong>{{project.dataset.loci.reduce((acc, curr) => acc + curr + ', ', '').slice(0, -2)}}</p>
                <p v-show='project.dataset.url'><strong>URL: </strong>{{project.dataset.url}}</p>
                <hr>
                <p>Select the algorithm to process the dataset's profiles:</p>
                <b-form-select v-model='selected' :options='options' class='mb-3'></b-form-select>
                <p>LVs: </p>
                <div class='row'>
                    <div class='col-lg-2'>
                        <b-form-input v-model='lvs' type='number' min='1' value='3' :max='project.dataset.loci.length'></b-form-input>
                    </div>
                </div>
                <hr>
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
                <button class='btn btn-outline-success' @click='process'>Render</button>
                <Request v-if='requests.process' href='/process' method='POST' :json='json' :onSuccess='onProcess' />
            </b-card-body>
        </b-card>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                project: this.$store.state.project,
                selected: 'goeburst',
                selectedRender: 'forcedirected',
                options: [
                    { value: 'goeburst', text: 'GoeBURST' }
                ],
                renderOptions: [
                    { value: 'forcedirected', text: 'Force-Directed Layout' },
                    { value: 'grapetree', text: 'GrapeTree Layout' },
                    { value: 'radial', text: 'Radial Static Layout' }
                ],
                lvs: 3,
                json: undefined,
                inputFile: undefined,
                file: undefined,
                url: undefined,
                ancillary: {},
                show: false,
                requests: {
                    upload: false,
                    load: false,
                    process: false
                }
            }
        },
        methods: {
            process() {
                this.requests.process = true
                this.json = {
                    processor: this.selected,
                    profiles: this.project.dataset.profiles,
                    lvs: this.lvs
                }
            },
            onProcess(result) {
                const project = {
                    name: this.project.dataset.name,
                    graph: result.graph,
                    ancillary: this.ancillary,
                    render: this.selectedRender
                }
                this.$store.commit('setProject', project)
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