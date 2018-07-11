<template>
    <nav class='navbar navbar-expand navbar-dark bg-dark' style='position: fixed; width: 100%; left:0; top: 0; height: 50px; z-index:3'>
        <ul class='navbar-nav mr-auto'>
            <li class='nav-item'>
                <router-link tag='li' to="/">
                    <a class='navbar-brand'>PHYLOViZ</a>
                </router-link>
            </li>
        </ul>
        <div style='float:right' v-if='!this.$store.state.username'>
            <ul class='navbar-nav mr-auto'>
                <li class='nav-item'>
                    <router-link tag='li' to="/register">
                        <a class='nav-link'>Register</a>
                    </router-link>
                </li>
                <li class='nav-item'>
                    <router-link tag='li' to="/login">
                        <a class='nav-link'>Login</a>
                    </router-link>
                </li>
            </ul>
        </div>
        <div style='float:right' v-else>
            <ul class='navbar-nav mr-auto'>
                <li class='nav-item'>
                    <Request v-if='requests.logout' href='/logout' method='POST' :onSuccess='onLogout' />
                    <a class='nav-link' @click='logout'>Logout</a>
                </li>
            </ul>
        </div>
    </nav>
</template>

<script>
export default {
    data() {
        return {
            requests: {
                logout: false
            }
        }
    },
    methods: {
        logout() {
            this.requests.logout = true
        },
        onLogout() {
            this.$store.commit("setUsername", undefined)
            this.$store.commit("setProject", undefined)
            this.$router.push("/")
        }
    }
}
</script>