<template>
    <b-card>
        <b-card-body>
            <p><strong>Dataset Name: </strong>{{project.dataset.name}}</p>
            <p><strong>Count: </strong>{{project.dataset.count}}</p>
            <p><strong>Loci: </strong>{{project.dataset.loci.reduce((acc, curr) => acc + curr + ', ', '').slice(0, -2)}}</p>
            <p v-show='project.dataset.url'><strong>URL: </strong>{{project.dataset.url}}</p>
            <hr>
            <p><strong>(Optional)</strong> Select the ancillary data:</p>
            <form @submit.prevent='upload' class='form-inline'>
                <div class='form-row align-items-center'>
                    <div class='col-auto'>
                        <b-form-file v-model='inputFile' :state='!!inputFile' placeholder='Choose a file' accept='.csv, .txt, .db' required></b-form-file>
                    </div>
                    <div class='col-auto'>
                        <button type='submit' class='btn btn-outline-secondary'>Upload</button>
                    </div>
                    <div class='col-auto'>
                        <Request v-if='requests.upload' href='/ancillary/file' method='POST' :data='file' :onSuccess='onUpload' />
                    </div>
                </div>
            </form>
            <br>
            <form @submit.prevent='load' class='form-inline'>
                <div class='form-row align-items-center'>
                    <div class='col-auto'>
                        <b-form-input v-model='url' type='text' placeholder='Enter a URL' required></b-form-input>
                    </div>
                    <div class='col-auto'>
                        <button type='submit' class='btn btn-outline-secondary'>Load</button>
                    </div>
                    <div class='col-auto'>
                        <Request v-if='requests.load' :href='`/ancillary/${url}`' :onSuccess='onLoad' />
                    </div>
                </div>
            </form>
            <hr>
            <p>Select the processing algorithm:</p>
            <b-form-select v-model='selected' :options='options' class='mb-3'></b-form-select>
            <p>LVs: </p>
            <div class='form-row align-items-center'>
                <div class='col-auto'>
                    <b-form-input v-model='lvs' type='number' min='1' value='3' :max='project.dataset.loci.length'></b-form-input>
                </div>
            </div>
            <hr>
            <p>Select the rendering algorithm:</p>
            <b-form-select v-model='selectedRender' :options='renderOptions' class='mb-3'></b-form-select>
            <div class='form-row align-items-center'>
                <div class='col-auto'>
                    <button class='btn btn-outline-success' @click='process'>Render</button>
                </div>
                <div class='col-auto'>
                    <Request v-if='requests.process' href='/process' method='POST' :json='json' :onSuccess='onProcess' />
                </div>
            </div>
        </b-card-body>
    </b-card>
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
                this.url = undefined
                this.requests.load = false
                return 'Ancillary uploaded'
            },
            load() {
                this.requests.load = true
            },
            onLoad(ancillary) {
                this.ancillary = ancillary
                this.file = undefined
                this.requests.upload = false
                return 'Ancillary loaded'
            }
        }
    }
</script>