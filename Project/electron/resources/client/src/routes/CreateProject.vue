<template>
    <div>
        <i class='fa fa-spinner fa-spin' v-if='loading' style='font-size:36px'></i>
        <b-alert :show='error !== undefined' variant='danger' dismissible>An error has occurred</b-alert>
        <br>
        <b-card title=''>
            <b-card-body>
                <p><strong>Dataset Name: </strong>{{this.dataset.name}}</p>
                <p><strong>Count: </strong>{{this.dataset.count}}</p>
                <p><strong>Loci: </strong>{{this.dataset.loci.reduce((acc, curr) => acc + curr + ', ', '').slice(0, -2)}}</p>
                <p v-show='this.dataset.url'><strong>URL: </strong>{{this.dataset.url}}</p>
                <hr>
                <p>Project Name:</p>
                <b-form-input v-model='projectName' type='text' placeholder='Project Name'></b-form-input>
                <br>
                <button class='btn btn-outline-success' @click='process'>Create Project</button>
            </b-card-body>
        </b-card>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                dataset: this.$store.state.project.dataset,
                projectName: undefined,
                ancillary: undefined,
                loading: false,
                error: undefined,
            }
        },
        methods: {
            processAncillary() {
                this.loading = true
                const ancillary = new FormData()
                ancillary.append('file', this.ancillary)
                const options = {
                    method: 'POST',
                    body: ancillary
                }
                fetch('http://localhost:3000/ancillary/file', options).then(res => res.json()).then(ancillary => {
                    this.ancillary = ancillary
                    this.loading = false
                }).catch(error => this.error = error)
            },
            process() {
                this.loading = true
                const options = {
                    method: 'POST',
                    body: JSON.stringify({
                        name: this.projectName,
                        dataset: this.dataset,
                        ancillary: this.ancillary || {}
                    }),
                    headers: { 'content-type': 'application/json' },
                    credentials: 'include'
                }
                fetch(`http://localhost:3000/projects`, options).then(res => {
                    this.loading = false
                    this.$router.push('/projects')
                }).catch(error => this.error = error)
            }
        }
    }
</script>