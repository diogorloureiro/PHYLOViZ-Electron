<template>
    <div class='form-signin' style='width: 100%; max-width: 330px; padding: 15px; margin: 0 auto;'>
        <Request v-if='requests.login' href='/login' method='POST' :json='credentials' :onSuccess='onLogin' />
        <h1 class='h3 mb-3 font-weight-normal'>Please login</h1>
        <label for='username' class='sr-only'>Username</label>
        <input v-model='username' type='text' id='username' class='form-control' placeholder='Username' required autofocus>
        <br>
        <label for='password' class='sr-only'>Password</label>
        <input v-model='password' type='password' id='password' class='form-control' placeholder='Password' required>
        <br>
        <button class='btn btn-lg btn-outline-success btn-block' @click='login'>Login</button>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                username: undefined,
                password: undefined,
                credentials: undefined,
                requests: {
                    login: false
                }
            }
        },
        methods: {
            login() {
                this.credentials = {
                    username: this.username,
                    password: this.password
                }
                this.requests.login = true
            },
            onLogin(res) {
                this.$store.commit('setToken', res.token)
                this.$store.commit('setUsername', this.credentials.username)
                this.$router.push('/')
            }
        }
    }
</script>