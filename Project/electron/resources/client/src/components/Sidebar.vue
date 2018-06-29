<template>
    <div :class='$style.sidebar'>
        <br>
        <button class='btn btn-link' @click='uploadDataset'>Load dataset</button>
        <br>
        <button class='btn btn-link' @click='publicDatasets'>Public datasets</button>
        <br>
        <button v-if='this.$store.state.username' class='btn btn-link' @click='projects'>Projects</button>
    </div>
</template>

<script>
    export default {
        methods: {
            uploadDataset() {
                this.$router.push('/upload-dataset')
            },
            publicDatasets() {
                this.$router.push('/public-datasets')
            },
            projects() {
                this.$router.push('/projects')
            }
        }
    }
</script>

<style module>
    .sidebar {
        height: 100%;
        width: 180px;
        position: fixed;
        left: 0;
        background-color: #f5f5f5;
        overflow-x: scroll;
    }
</style>
