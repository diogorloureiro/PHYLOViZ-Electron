<template>
    <div style='overflow: auto;'>
        <i class='fa fa-spinner fa-spin' v-if='loading' style='font-size:36px'></i>
        <b-alert :show='error' variant='danger' dismissible>An error has occurred</b-alert>
        <br>
        <b-card title=''>
            <b-card-body>
                <p><strong>Dataset name: </strong>{{this.project.dataset.name}}</p>
                <p><strong>Count: </strong>{{this.project.dataset.count}}</p>
                <p><strong>Loci: </strong>{{this.project.dataset.loci}}</p>
                <p v-show='this.project.dataset.url'><strong>URL: </strong>{{this.project.dataset.url}}</p>
                <hr>
                <p>Select the algorithm to process the dataset's profiles:</p>
                <b-form-select v-model='selected' :options='options' class='mb-3'></b-form-select>
                <p>Select the rendering algorithm:</p>
                <b-form-select v-model='selectedRender' :options='renderOptions' class='mb-3'></b-form-select>
                <button class='btn btn-outline-secondary' @click='show = !show'>Ancillary Data</button>
                <b-card-body v-if='show'>
                    <b-form-file v-model='file' :state='Boolean(file)' placeholder='Choose an ancillary data file...' accept='.db'></b-form-file>
                    <button class='btn btn-outline-secondary' @click='uploadAncillary'>Upload</button>
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
                show: false,
                file: undefined,
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
                    body: JSON.stringify(this.project.dataset.profiles),
                    headers: { 'content-type': 'application/json' }
                }
                fetch(`http://localhost:3000/algorithms/${this.selected}`, options).then(res => res.json()).then(({ graph, matrix }) => {

                    this.project.computations.push({ algorithm: this.selected, graph, matrix })
                    const info = {
                        name: this.project.dataset.name,
                        graph: this.project.computations[0].graph,
                        ancillary: this.ancillary,
                        render: this.selectedRender
                    }
                    console.log(info)
                    window.sessionStorage.setItem('project', JSON.stringify(info))
                    this.loading = false
                    this.$router.push('/canvas')
                })
            },
            uploadAncillary() {
                this.loading = true
                const formData = new FormData()
                formData.append('file', this.file)
                const options = {
                    method: 'POST',
                    body: formData
                }
                fetch('http://localhost:3000/ancillary/file', options).then(res => res.json()).then(obj => {

                    console.log(obj)
                    this.ancillary = obj
                    this.show = false
                    this.loading = false
                }).catch(error => this.error = error)
            }
        }
    }
</script>
