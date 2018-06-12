<template>
    <div id='datasets-table'>
        <i class='fa fa-spinner fa-spin' v-if='loading' style='font-size:36px'></i>
        <b-alert :show='error' variant='danger' dismissible>An error has occurred while fetching the datasets</b-alert>
        <br>
        <b-container fluid>
            <!-- User Interface controls -->
            <b-row>
                <b-col md='4' class='my-1'>
                    <b-form-group horizontal label='Filter:' class='mb-0'>
                        <b-input-group>
                            <b-form-input v-model='filter' placeholder='Type to Search' />
                            <b-input-group-append>
                            <b-btn :disabled='!filter' @click="filter = ''">Clear</b-btn>
                            </b-input-group-append>
                        </b-input-group>
                    </b-form-group>
                </b-col>

                <b-col md='3' class='my-1'>
                    <b-form-group horizontal label='Per page:' class='mb-0'>
                    <b-form-select :options='pageOptions' v-model='perPage' />
                    </b-form-group>
                </b-col>
            </b-row>
            <br>

            <b-table striped small hover
                :items='datasets'
                :fields='fields'
                :current-page='currentPage'
                :per-page='perPage'
                :filter='filter'
                @filtered='onFiltered'>

                <template slot='name' slot-scope='data'>
                    <button class='btn btn-link' @click='fetchDataset(data.item.url, data.item)'>{{data.item.name}}</button>
                </template>
                <template slot='loci' slot-scope='loci'>
                    {{ loci.unformatted }}
                </template>
            </b-table>

            <b-row>
                <b-col md='6' class='my-1'>
                <b-pagination :total-rows='totalRows' :per-page='perPage' v-model='currentPage' class='my-0' />
                </b-col>
            </b-row>
        </b-container>
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
                currentPage: 1,
                perPage: 10,
                totalRows: null,
                pageOptions: [ 10, 25, 50 ],
                filter: null,
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
                fetch('http://localhost:3000/datasets/pubmlst').then(res => res.json()).then(datasets => {

                    this.totalRows = datasets.length

                    datasets.forEach(elem => {
                        elem.loci = elem.loci.reduce((acc, curr) => acc + curr.name + ', ', '').slice(0, -2)
                    })
                    this.loading = false
                    this.datasets = datasets
                }).catch(error => {
                    this.loading = false
                    this.error = true
                })
            },
            fetchDataset(url, dataset) {
                this.loading = true
                fetch(`http://localhost:3000/datasets/${encodeURIComponent(url)}`).then(res => res.json()).then(profiles => {

                    dataset['profiles'] = profiles

                    this.$store.commit('setProject', { dataset, computations: [] })
                    this.loading = false
                    if(this.$store.state.username)
                        this.$router.push('/projects/create')
                    else
                        this.$router.push('/algorithms')
                })
            },
            onFiltered (filteredItems) {
                this.totalRows = filteredItems.length
                this.currentPage = 1
            }
        }
    }
</script>
