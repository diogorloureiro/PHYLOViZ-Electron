<template>
    <div>
        <br>
        <b-card title=''>
            <b-card-body>
                <b-form-file v-model='file' :state='Boolean(file)' placeholder='Choose a file...' accept='.txt'></b-form-file>
                <div class='mt-3'>Selected file: {{file && file.name}}</div>
                <button class='btn btn-outline-success' @click='uploadFile'>Upload</button>
            </b-card-body>
        </b-card>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                file: null,
                loading: false,
                error: undefined
            }
        },
        created() {
            //this.uploadFile()
        },
        watch: {
            // call again the method if the route changes
            '$route': 'fetchData'
        },
        methods: {
            uploadFile() {
                this.loading = true
                window.sessionStorage.clear()
                const formData = new FormData()
                formData.append('file', this.file)
                const options = {
                    method: 'POST',
                    body: formData
                }
                fetch('http://localhost:3000/datasets/file', options).then(res => res.json()).then(profiles => {
                    const dataset = {
                        name: this.file.name,
                        count: 'Unknown',       // ????
                        loci: 'Unknown',
                        url: 'Unknown',
                        profiles
                    }
                    this.$store.commit('setDataset', dataset)
                    this.loading = false
                    this.$router.push('/algorithms')
                }).catch(error => this.error = error)
            }
        }
    }
</script>
