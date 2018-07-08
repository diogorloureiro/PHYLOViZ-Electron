<template>
    <div style='overflow: auto;'>
        <i class='fa fa-spinner fa-spin' v-if='loading' style='font-size:36px'></i>
        <b-alert :show='error !== undefined' variant='danger' dismissible>An error has occurred</b-alert>
        <br>
        <b-card title=''>
            <b-card-body>
                <p><strong>Dataset Name: </strong>{{this.project.dataset.name}}</p>
                <p><strong>Count: </strong>{{this.project.dataset.count}}</p>
                <p><strong>Loci: </strong>{{this.project.dataset.loci.reduce((acc, curr) => acc + curr + ', ', '').slice(0, -2)}}</p>
                <p v-show='this.project.dataset.url'><strong>URL: </strong>{{this.project.dataset.url}}</p>
                <hr>
                <p>Select the algorithm to process the dataset's profiles:</p>
                <b-form-select v-model='selected' :options='options' class='mb-3'></b-form-select>
                <p>LVs: </p>
                <div class='row'>
                    <div class='col-lg-2'>
                        <b-form-input v-model='lvs' type='number' min='1' value='3' :max='this.project.dataset.loci.length'></b-form-input>
                    </div>
                </div>
                <hr>
                <p>Select the rendering algorithm:</p>
                <b-form-select v-model='selectedRender' :options='renderOptions' class='mb-3'></b-form-select>
                <button class='btn btn-outline-secondary' @click='show = !show'>Ancillary Data</button>
                <b-card-body v-if='show'>
                    <div class='row'>
                        <div class='col-lg-6'>
                            <b-form-file v-model='file' :state='Boolean(file)' placeholder='Choose an ancillary data file' accept='.db'></b-form-file>
                        </div>
                        <div class='col-lg'>
                            <button class='btn btn-outline-secondary' @click='uploadAncillary'>Upload</button>
                        </div>
                        <div class='col-lg-6'>
                            <b-form-input v-model='url' type='text' placeholder='Enter the ancillary data URL'></b-form-input>
                        </div>
                        <div class='col-lg'>
                            <button class='btn btn-outline-secondary' @click='loadAncillary(url)'>Load</button>
                        </div>
                    </div>
                </b-card-body>
                <div v-if='ancillary.head' class='mt-3'>Selected ancillary file: {{file && file.name}}</div>
                <hr>
                <button class='btn btn-outline-success' @click='process'>Render</button>
            </b-card-body>
        </b-card>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                project: this.$store.state.project,
                selected: 'goeburst',
                selectedRender: 'forcedirected',
                options: [
                    { value: 'goeburst', text: 'GoeBURST' }
                ],
                renderOptions: [
                    { value: 'forcedirected', text: 'Force-Directed Layout' },
                    { value: 'grapetree', text: 'GrapeTree Layout' },
                    { value: 'radial', text: 'Radial Static Layout' }
                ],
                lvs: 3,
                show: false,
                file: undefined,
                url: undefined,
                ancillary: {},
                loading: false,
                error: undefined,
            }
        },
        methods: {
            process() {
                this.loading = true
                const options = {
                    method: 'POST',
                    body: JSON.stringify({
                        processor: this.selected,
                        profiles: this.project.dataset.profiles,
                        lvs: this.lvs
                    }),
                    headers: { 'content-type': 'application/json' }
                }
                fetch(`http://localhost:3000/process`, options).then(res => res.json()).then(({ graph, matrix }) => {
                    
                    this.project.computations.push({ algorithm: this.selected, graph, matrix })
                    const info = {
                        name: this.project.dataset.name,
                        graph: this.project.computations[0].graph,
                        ancillary: this.ancillary,
                        render: this.selectedRender
                    }
                    this.$store.commit('setProject', info)
                    this.loading = false
                    this.$router.push('/canvas')
                }).catch(error => {
                    this.error = error
                    this.loading = false
                })
            },
            uploadAncillary() {
                this.loading = true
                const file = new FormData()
                file.append('file', this.file)
                const options = {
                    method: 'POST',
                    body: file
                }
                fetch('http://localhost:3000/ancillary/file', options).then(res => res.json()).then(ancillary => {
                    this.ancillary = ancillary
                    this.show = false
                    this.loading = false
                }).catch(error => {
                    this.error = error
                    this.loading = false
                })
            },
            loadAncillary(url) {
                this.loading = true
                fetch(`http://localhost:3000/ancillary/${url}`).then(res => res.json()).then(ancillary => {
                    this.ancillary = ancillary
                    this.show = false
                    this.loading = false
                }).catch(error => {
                    this.error = error
                    this.loading = false
                })
            }
        }
    }
</script>