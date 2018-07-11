<template>
    <div>
        <b-card title='Load a dataset from a file'>
            <b-card-body>
                <div class='form-row align-items-center'>
                    <div class='col-auto'>
                        <b-form-file v-model='file' :state='!!file' placeholder='Choose a file...' accept='.csv, .txt, .db'></b-form-file>
                    </div>
                    <div class='col-auto'>
                        <button class='btn btn-outline-success' @click='upload'>Upload</button>
                    </div>
                    <div class='col-auto'>
                        <Request v-if='requests.upload' href='/datasets/file' method='POST' :data='data' :onSuccess='onUpload' />
                    </div>
                </div>
            </b-card-body>
        </b-card>
        <br>
        <b-card title='Load a dataset from a URL'>
            <b-card-body>
                <div class='form-row align-items-center'>
                    <div class='col-auto'>
                        <b-form-input v-model='url' type='text' placeholder='Enter a URL'></b-form-input>
                    </div>
                    <div class='col-auto'>
                        <button class='btn btn-outline-success' @click='load'>Load</button>
                    </div>
                    <div class='col-auto'>
                        <Request v-if='requests.load' :href='`/datasets/${encodeURIComponent(url)}`' :onSuccess='onLoad' />
                    </div>
                </div>
            </b-card-body>
        </b-card>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                file: undefined,
                data: undefined,
                url: undefined,
                requests: {
                    upload: false,
                    load: false
                }
            }
        },
        methods: {
            upload() {
                const file = new FormData()
                file.append('file', this.file)
                this.data = file
                this.requests.upload = true
            },
            onUpload(dataset) {
                this.update(dataset, this.file.name)
            },
            load() {
                this.requests.load = true
            },
            onLoad(dataset) {
                this.update(dataset, this.url)
            },
            update(dataset, name) {
                dataset.name = name
                dataset.count = dataset.profiles.length
                this.$store.commit('setProject', { dataset, computations: [] })
                this.$router.push(this.$store.state.username ? '/projects/create' : '/algorithms')
            }
        }
    }
</script>