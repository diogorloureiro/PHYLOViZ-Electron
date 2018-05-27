<template>
    <div>
        <div class='loading' v-if='loading'>Loading...</div>
        <div class='error' v-if='error'>An error has occurred</div>
        <b-card title=''>
            <b-card-body>
                <p>Select the algorithm to process the dataset's profiles</p>
                <b-form-select v-model='selected' :options='options' class='mb-3'></b-form-select>
                <p>Select the rendering algorithm</p>
                <b-form-select v-model='selectedRender' :options='renderOptions' class='mb-3'></b-form-select>
                <button class='btn btn-outline-success' v-on:click='process'>Render</button>
            </b-card-body>
        </b-card>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                selected: null,
                selectedRender: 'layout',
                options: [
                    { value: null, text: 'Select the algorithm', disabled: true },
                    { value: 'goeburst', text: 'GoeBURST' }
                ],
                renderOptions: [
                    { value: 'layout', text: 'Force-Directed Layout' },
                    { value: 'grapetree', text: 'GrapeTree Layout' },
                    { value: 'radial', text: 'Radial Layout' }
                ],
                info: undefined,
                loading: false,
                error: undefined,
                reqOptions: {
                    method: 'POST',
                    body: JSON.stringify(this.$store.state.profiles),
                    headers: {
                        'content-type': 'application/json'
                    }
                }
            }
        },
        methods: {
            process() {
                this.loading = true

                fetch(`http://localhost:3000/goeburst`, this.reqOptions).then(res => res.json()).then(({ graph, matrix }) => {

                    window.sessionStorage.setItem('graph', JSON.stringify(graph))
                    window.sessionStorage.setItem('render-algorithm', JSON.stringify(this.selectedRender))
                    this.loading = false
                    this.info = true
                    this.$router.push('/canvas')
                })
            }
        }
    }
</script>
