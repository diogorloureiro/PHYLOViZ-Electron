<template>
    <div>
        <br>
        <Request href='/user' :onSuccess='onLoadUser' />
        <Request v-if='requests.import' href='/projects/import' method='POST' :data='data' :onSuccess='onImport' />
        <Request v-if='requests.load' :href='`/projects/${loaded}`' :onSuccess='onLoadProject' />
        <Request v-if='requests.remove' :href='`/projects/${removed}`' method='DELETE' :onSuccess='onRemove' />
        <b-card title='Import project from a file'>
            <b-card-body>
                <div class='row'>
                    <div class='col-lg-10'>
                        <b-form-file v-model='file' :state='!!file' placeholder='Choose a file...' accept='.json'></b-form-file>
                    </div>
                    <div class='col-lg'>
                        <button class='btn btn-outline-success' @click='this.import'>Import</button>
                    </div>
                </div>
            </b-card-body>
        </b-card>
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
                        <button class='btn btn-link' @click='loadProject(data.item._id)'>{{data.item.name}}</button>
                    </template>
                    <template slot='actions' slot-scope='data'>
                        <button class='btn btn-outline-danger btn-sm' @click='remove(data.item._id)'>Delete</button>
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
                    },
                    actions: {
                        label: ''
                    }
                },
                currentPage: 1,
                perPage: 10,
                totalRows: undefined,
                pageOptions: [ 10, 25, 50 ],
                filter: undefined,
                projects: [],
                file: undefined,
                data: undefined,
                loaded: undefined,
                removed: undefined,
                requests: {
                    import: false,
                    load: false,
                    remove: false
                }
            }
        },
        methods: {
            onLoadUser(user) {
                this.projects = user.projects.concat(user.shared)
                this.projects.forEach(proj => proj['actions'] = ['remove'])
                this.totalRows = this.projects.length
            },
            import() {
                this.data = new FormData()
                this.data.append('file', this.file)
                this.requests.import = true
            },
            onImport(project) {
                this.$store.commit('setProject', project)
                this.$router.push(`/project`)
            },
            loadProject(id) {
                this.loaded = id
                this.requests.load = true
            },
            onLoadProject(project) {
                this.$store.commit('setProject', project)
                this.$router.push(`/project`)
            },
            remove(id) {
                this.removed = id
                this.requests.remove = true
            },
            onRemove() {
                this.projects = this.projects.filter(project => project._id !== this.removed)
            },
            onFiltered (filteredItems) {
                this.totalRows = filteredItems.length
                this.currentPage = 1
            }
        }
    }
</script>