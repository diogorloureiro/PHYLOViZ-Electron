<template>
    <nav class='navbar navbar-expand navbar-dark bg-dark'>
        <ul class='navbar-nav mr-auto'>
            <li class='nav-item'>
                <router-link tag='li' to="/">
                    <a class='navbar-brand'>PHYLOViZ</a>
                </router-link>
            </li>
        </ul>
        <div style='float:right' v-if='!this.$store.state.auth'>
            <ul class='navbar-nav mr-auto'>
                <li class='nav-item'>
                    <a class='nav-link' href='/register'>Register</a>
                </li>
                <li class='nav-item'>
                    <a class='nav-link' href='/login'>Login</a>
                </li>
            </ul>
        </div>
    </nav>
</template>
