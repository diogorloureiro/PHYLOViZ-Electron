<template>
<div id='app'>
	<Navbar/>
    <div class='row-offcanvas'>
        <Sidebar/>
        <div id='main'>
            <div class='col-md-12'>
                <router-view></router-view>
            </div>
        </div>
    </div>
</div>
</template>

<script>
    // row-offcanvas-left
    export default {
        data() {
            return {
                graph: undefined
            }
        }
    }
</script>
