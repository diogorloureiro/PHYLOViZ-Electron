<template>
    <div class='form-signin' style='width: 100%; max-width: 330px; padding: 15px; margin: 0 auto;'>
        <Request v-if='requests.register' href='/register' method='POST' :json='credentials' :onSuccess='onRegister' />
        <h1 class='h3 mb-3 font-weight-normal'>Please register</h1>
        <label for='username' class='sr-only'>Username</label>
        <input v-model='username' type='text' id='username' class='form-control' placeholder='Username' required autofocus>
        <br>
        <label for='password' class='sr-only'>Password</label>
        <input v-model='password' type='password' id='password' class='form-control' placeholder='Password' required>
        <br>
        <button class='btn btn-lg btn-outline-success btn-block' @click='register'>Register</button>
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
                    register: false
                }
            }
        },
        methods: {
            register() {
                this.credentials = { username: this.username, password: this.password }
                this.requests.register = true
            },
            onRegister() {
                return 'Succesfully registered. Please log in.'
            }
        }
    }
</script>