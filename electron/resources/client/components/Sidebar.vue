<template>
    <div :class="$style.sidenav">
        <br>
        <!--button type='button' class='btn btn-link'>Profile</button-->
        <!--br-->
        <!--a href='/upload-dataset'>Upload dataset</a-->
        <button class='btn btn-link' @click='uploadDataset'>Upload dataset</button>
        <br>
        <!--a href='/public-datasets'>Public datasets</a-->
        <button class='btn btn-link' @click='publicDatasets'>Public datasets</button>
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
            }
        }
    }
</script>

<style module>
    .sidenav {
        height: 100%;
        width: 180px;
        position: fixed;
        left: 0;
        background-color: #f5f5f5;
        overflow-x: hidden;
    }
</style>
