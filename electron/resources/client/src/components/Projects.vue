<template>
    <div>
        <br>
        <b-card>
            <b-card-body>
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
                    :items='projects'
                    :fields='fields'
                    :current-page='currentPage'
                    :per-page='perPage'
                    :filter='filter'
                    @filtered='onFiltered'>

                    <template slot='name' slot-scope='data'>
                        <button class='btn btn-link' @click='fetchProject(data.item._id)'>{{data.item.name}}</button>
                    </template>
                </b-table>

                <b-row>
                    <b-col md='6' class='my-1'>
                    <b-pagination :total-rows='totalRows' :per-page='perPage' v-model='currentPage' class='my-0' />
                    </b-col>
                </b-row>
            </b-card-body>
        </b-card>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                fields: {
                    name: {
                        label: 'Project Name',
                        sortable: true
                    }
                },
                currentPage: 1,
                perPage: 10,
                totalRows: null,
                pageOptions: [ 10, 25, 50 ],
                filter: null,
                projects: [],
                loading: false,
                error: undefined
            }
        },
        created() {
            this.fetchUser()
        },
        watch: {
            '$route': 'fetchData'
        },
        methods: {
            fetchUser() {
                this.loading = true
                const options = {
                    method: 'GET',
                    credentials: 'include'
                }
                fetch(`http://localhost:3000/user`, options).then(res => res.json()).then(user => {
                    this.projects = user.projects.concat(user.shared)
                    console.log(this.projects)
                    this.totalRows = this.projects.length
                    this.loading = false
                }).catch(error => {
                    this.loading = false
                    this.error = true
                })
            },
            fetchProject(id) {
                this.loading = true
                const options = {
                    method: 'GET',
                    credentials: 'include'
                }
                fetch(`http://localhost:3000/projects/${id}`, options).then(res => res.json()).then(project => {

                    console.log(project)
                    this.$store.commit('setProject', project)
                    this.$router.push(`/project`)
                    this.loading = false
                })
            },
            onFiltered (filteredItems) {
                this.totalRows = filteredItems.length
                this.currentPage = 1
            }
        }
    }
</script>
