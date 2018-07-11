<template>
<div id='app' style= 'overflow: hidden'>
    <div class='container' style='margin-left: 180px; margin-top: 50px;'>
        <Navbar/>
        <Sidebar/>
        <div id='main'>
            <br>
            <router-view></router-view>
            <br>
        </div>
    </div>
</div>
</template>
