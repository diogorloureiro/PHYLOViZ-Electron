<template>
    <div>
        <br>
        <b-card title=''>
            <b-card-body>
                <b-form-file v-model='file' :state='Boolean(file)' placeholder='Choose a file...'></b-form-file>
                <div class='mt-3'>Selected file: {{file && file.name}}</div>
                <button class='btn btn-outline-success' v-on:click='uploadFile'>Upload</button>
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
                const formData = new FormData()
                formData.append('file', this.file)
                const options = {
                    method: 'POST',
                    body: formData
                }

                fetch('http://localhost:3000/file-datasets', options).then(res => res.json()).then(profiles => {
                    
                    this.$store.commit('setProfiles', profiles)
                    this.loading = false
                    this.$router.push('/algorithms')
                }).catch(error => this.error = error)
            }
        }
    }
</script>
