<template>
    <nav class='navbar navbar-expand navbar-dark bg-dark' style='position: fixed; width: 100%; left:0; top: 0; height: 50px; z-index:3'>
        <ul class='navbar-nav mr-auto'>
            <li class='nav-item'>
                <router-link tag='li' to='/'>
                    <a class='navbar-brand'>PHYLOViZ</a>
                </router-link>
            </li>
        </ul>
        <div style='float:right'>
            <ul v-if='!!this.$store.state.username' class='navbar-nav mr-auto'>
                <li class='nav-item'>
                    <a class='nav-link'>{{this.$store.state.username}}</a>
                </li>
                <li class='nav-item'>
                    <a class='nav-link' @click='logout'>Logout</a>
                </li>
            </ul>
            <ul v-else class='navbar-nav mr-auto'>
                <li class='nav-item'>
                    <router-link tag='li' to='/register'>
                        <a class='nav-link'>Register</a>
                    </router-link>
                </li>
                <li class='nav-item'>
                    <router-link tag='li' to='/login'>
                        <a class='nav-link'>Login</a>
                    </router-link>
                </li>
            </ul>
        </div>
    </nav>
</template>

<script>
export default {
    methods: {
        logout() {
            this.$store.commit('setToken')
            this.$store.commit('setUsername')
            this.$store.commit('setProject')
            this.$router.push('/')
        }
    }
}
</script>