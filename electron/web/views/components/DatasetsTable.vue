<template>
    <div id='datasets-table'>
        <div class='loading' v-if='loading'>Loading...</div>
        <div class='error' v-if='error'>An error has occurred while fetching the datasets</div>
        <br>
        <b-table striped small hover :items='datasets' :fields='fields'>
            <template slot='name' slot-scope='data'>
                <button class='btn btn-link' v-on:click='fetchDataset(data.item.url)'>{{data.item.name}}</button>
            </template>
            <template slot='loci' slot-scope='loci'>
                {{ loci.unformatted }}
            </template>
        </b-table>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                fields: {
                    name: {
                        label: 'Dataset Name',
                        sortable: true
                    },
                    count: {
                        label: 'Count',
                        sortable: true
                    },
                    url: {
                        label: 'URL'
                    },
                    loci: {
                        label: 'Loci'
                    }
                },
                datasets: [],
                loading: false,
                error: undefined
            }
        },
        created() {
            this.fetchData()
        },
        watch: {
            // call again the method if the route changes
            '$route': 'fetchData'
        },
        methods: {
            fetchData() {

                this.loading = true
                fetch('http://localhost:3000/datasets').then(res => res.json()).then(datasets => {

                    datasets.forEach(elem => {
                        elem.loci = elem.loci.reduce((acc, curr) => acc + curr.name + ', ', '').slice(0, -2)
                    })
                    this.loading = false
                    this.datasets = datasets
                }).catch(error => this.error = error)
            },
            fetchDataset(url) {

                this.loading = true
                fetch(`http://localhost:3000/pubmlst-datasets?url=${url}`).then(res => res.json()).then(profiles => {

                    this.$store.commit('setProfiles', profiles)
                    this.loading = false
                    this.$router.push('/algorithms')
                })
            }
        }
    }
</script>
