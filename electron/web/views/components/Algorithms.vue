<template>
    <div>
        <i class='fa fa-spinner fa-spin' v-if='loading' style='font-size:36px'></i>
        <b-alert :show='error' variant='danger' dismissible>An error has occurred</b-alert>
        <br>
        <b-card title=''>
            <b-card-body>
                <p><strong>Dataset name: </strong>{{this.dataset.name}}</p>
                <p><strong>Count: </strong>{{this.dataset.count}}</p>
                <p><strong>Loci: </strong>{{this.dataset.loci}}</p>
                <p><strong>URL: </strong>{{this.dataset.url}}</p>
                <hr>
                <p>Select the algorithm to process the dataset's profiles:</p>
                <b-form-select v-model='selected' :options='options' class='mb-3'></b-form-select>
                <p>Select the rendering algorithm:</p>
                <b-form-select v-model='selectedRender' :options='renderOptions' class='mb-3'></b-form-select>
                <button class='btn btn-outline-success' @click='process'>Render</button>
            </b-card-body>
        </b-card>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                dataset: this.$store.state.dataset,
                selected: 'goeburst',
                selectedRender: 'layout',
                options: [
                    { value: 'goeburst', text: 'GoeBURST' }
                ],
                renderOptions: [
                    { value: 'layout', text: 'Force-Directed Layout' },
                    { value: 'grapetree', text: 'GrapeTree Layout' },
                    { value: 'radial', text: 'Radial Static Layout' }
                ],
                loading: false,
                error: undefined,
            }
        },
        methods: {
            process() {
                this.loading = true
                const options = {
                    method: 'POST',
                    body: JSON.stringify(this.dataset.profiles),
                    headers: { 'content-type': 'application/json' }
                }
                fetch(`http://localhost:3000/${this.selected}`, options).then(res => res.json()).then(({ graph, matrix }) => {

                    this.dataset['graph'] = graph
                    window.sessionStorage.setItem('dataset', JSON.stringify(this.dataset))
                    window.sessionStorage.setItem('render-algorithm', JSON.stringify(this.selectedRender))
                    this.loading = false
                    this.$router.push('/canvas')
                })
            }
        }
    }
</script>
