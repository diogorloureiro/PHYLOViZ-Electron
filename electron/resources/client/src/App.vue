<template>
<div id='app'>
	<Navbar/>
    <div class='container'>
        <Sidebar/>
        <div id='main'>
            <router-view></router-view>
        </div>
    </div>
</div>
</template>
