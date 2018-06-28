<template>
    <div style='overflow: auto;'>
        <br>
        <b-card>
            <b-card-body>
                <b-form-input v-model='url' type='text' placeholder='Enter the dataset URL'></b-form-input>
                <button class='btn btn-outline-success' @click='load'>Load</button>
            </b-card-body>
        </b-card>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                url: null,
                loading: false,
                error: undefined
            }
        },
        methods: {
            load() {
                this.loading = true
                fetch(`http://localhost:3000/datasets/${encodeURIComponent(this.url)}`).then(res => res.json()).then(obj => {
                    const dataset = {
                        name: this.url,
                        count: obj.profiles.length,
                        loci: obj.loci.reduce((acc, curr) => acc + curr + ', ', '').slice(0, -2),
                        profiles: obj.profiles
                    }
                    this.$store.commit('setProject', { dataset, computations: [] })
                    this.loading = false
                    if(this.$store.state.username)
                        this.$router.push('/projects/create')
                    else
                        this.$router.push('/algorithms')
                }).catch(error => this.error = error)
            }
        }
    }
</script>
