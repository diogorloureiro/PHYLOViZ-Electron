<template>
    <div>
        <Request v-if='requests.create' href='/projects' method='POST' :json='project' :onSuccess='onCreate' />
        <b-card title=''>
            <b-card-body>
                <p><strong>Dataset Name: </strong>{{dataset.name}}</p>
                <p><strong>Count: </strong>{{dataset.count}}</p>
                <p><strong>Loci: </strong>{{dataset.loci.reduce((acc, curr) => acc + curr + ', ', '').slice(0, -2)}}</p>
                <p v-show='!!dataset.url'><strong>URL: </strong>{{dataset.url}}</p>
                <hr>
                <p>Project Name:</p>
                <b-form-input v-model='name' type='text' placeholder='Name'></b-form-input>
                <br>
                <button class='btn btn-outline-success' @click='create'>Create</button>
            </b-card-body>
        </b-card>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                dataset: this.$store.state.project.dataset,
                name: undefined,
                ancillary: undefined,
                project: undefined,
                requests: {
                    create: false
                }
            }
        },
        methods: {
            create() {
                this.project = {
                    name: this.name,
                    dataset: this.dataset,
                    ancillary: this.ancillary || {}
                }
                this.requests.create = true
            },
            onCreate() {
                this.$router.push('/projects')
            }
        }
    }
</script>