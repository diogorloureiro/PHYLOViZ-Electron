<template>
<div id='app' style= 'overflow: hidden'>
    <div class='container' style='margin-left: 180px; margin-top: 50px;'>
        <Navbar/>
        <Sidebar/>
        <div id='main'>
            <router-view></router-view>
        </div>
    </div>
</div>
</template>
