<template>
    <div id='sidebar' class='sidebar-offcanvas'>
        <div class='flex-column' id='tab'>
            <br>
            <button type='button' class='btn btn-link'>Profile</button>
            <br>
            <!--a href='/upload-dataset'>Upload dataset</a-->
            <button class='btn btn-link' v-on:click='uploadDataset'>Upload dataset</button>
            <br>
            <!--a href='/public-datasets'>Public datasets</a-->
            <button class='btn btn-link' v-on:click='publicDatasets'>Public datasets</button>
        </div>
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
