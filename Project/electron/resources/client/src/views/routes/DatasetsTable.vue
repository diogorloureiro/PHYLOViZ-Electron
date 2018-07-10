<template>
    <div id='datasets-table'>
        <br>
        <Request href='/datasets/pubmlst' :onSuccess='onLoadDatasets' />
        <Request v-if='requests.load' :href='`/datasets/${encodeURIComponent(dataset.url)}`' :onSuccess='onLoadDataset' />
        <b-container fluid>
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
                    <button class='btn btn-link' @click='loadDataset(data.item.name, data.item.url)'>{{data.item.name}}</button>
                </template>
                <template slot='loci' slot-scope='loci'>
                    {{ loci.unformatted.reduce((acc, curr) => acc + curr.name + ', ', '').slice(0, -2) }}
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
                    name: { label: 'Dataset Name', sortable: true },
                    count: { label: 'Count', sortable: true },
                    url: { label: 'URL' },
                    loci: { label: 'Loci' }
                },
                currentPage: 1,
                perPage: 10,
                totalRows: undefined,
                pageOptions: [ 10, 25, 50 ],
                filter: undefined,
                datasets: undefined,
                dataset: undefined,
                requests: {
                    load: false
                }
            }
        },
        methods: {
            onLoadDatasets(datasets) {
                this.totalRows = datasets.length
                this.datasets = datasets
            },
            loadDataset(name, url) {
                this.dataset = { name, url }
                this.requests.load = true
            },
            onLoadDataset(dataset){
                dataset.name = this.dataset.name
                dataset.url = this.dataset.url
                dataset.count = dataset.profiles.length
                this.$store.commit('setProject', { dataset, ancillary: {}, computations: [] })
                this.$router.push(this.$store.state.username ? '/projects/create' : '/algorithms')
            },
            onFiltered(filteredItems) {
                this.totalRows = filteredItems.length
                this.currentPage = 1
            }
        }
    }
</script>