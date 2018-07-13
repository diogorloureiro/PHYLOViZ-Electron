<template>
    <b-card>
        <b-card-body>
            <p><strong>Dataset Name: </strong>{{dataset.name}}</p>
            <p><strong>Count: </strong>{{dataset.count}}</p>
            <p><strong>Loci: </strong>{{dataset.loci.reduce((acc, curr) => acc + curr + ', ', '').slice(0, -2)}}</p>
            <p v-show='!!dataset.url'><strong>URL: </strong>{{dataset.url}}</p>
            <hr>
            <p><strong>(Optional)</strong> Select the ancillary data:</p>
            <form @submit.prevent='upload'>
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
            <form @submit.prevent='load'>
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
            <form @submit.prevent='create'>
                <p>Project Name:</p>
                <b-form-input v-model='name' type='text' placeholder='Name' required></b-form-input>
                <br>
                <div class='form-row align-items-center'>
                    <div class='col-auto'>
                        <button type='submit' class='btn btn-outline-success'>Create</button>
                    </div>
                    <div class='col-auto'>
                        <Request v-if='requests.create' href='/projects' method='POST' :json='project' :onSuccess='onCreate' />
                    </div>
                </div>
            </form>
        </b-card-body>
    </b-card>
</template>

<script>
    export default {
        data () {
            return {
                dataset: this.$store.state.project.dataset,
                name: undefined,
                project: undefined,
                ancillary: undefined,
                inputFile: undefined,
                file: undefined,
                url: undefined,
                ancillary: {},
                requests: {
                    create: false,
                    upload: false,
                    load: false
                }
            }
        },
        methods: {
            create() {
                this.project = {
                    name: this.name,
                    dataset: this.dataset,
                    ancillary: this.ancillary
                }
                this.requests.create = true
            },
            onCreate() {
                this.$router.push('/projects')
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