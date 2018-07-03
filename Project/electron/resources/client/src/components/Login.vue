<template>
    <div class='form-signin' style='width: 100%; max-width: 330px; padding: 15px; margin: 0 auto;'>
        <b-alert :show='errorMsg !== undefined' variant='danger' dismissible>{{this.errorMsg}}</b-alert>
        <br>
        <h1 class='h3 mb-3 font-weight-normal'>Please login</h1>
        <label for='inputUsername' class='sr-only'>Username</label>
        <input v-model='username' type='username' id='inputUsername' class='form-control' placeholder='Username' required autofocus>
        <br>
        <label for='inputPassword' class='sr-only'>Password</label>
        <input v-model='password' type='password' id='inputPassword' class='form-control' placeholder='Password' required>
        <br>
        <button class='btn btn-lg btn-outline-success btn-block' @click='login'>Login</button>
    </div>
</template>

<script>
    import App from '../App.vue'
    export default {
        data() {
            return {
                username: undefined,
                password: undefined,
                errorMsg: undefined
            }
        },
        methods: {
            login() {
                const options = {
                    method: 'POST',
                    body: JSON.stringify({
                        username: this.username,
                        password: this.password
                    }),
                    headers: { 'content-type': 'application/json' },
                    credentials: 'include'
                }
                fetch('http://localhost:3000/login', options).then(res => {
                        if (res.ok) {
                            console.log(App)
                            this.$store.commit('setUsername', this.username)
                            this.$router.push('/')
                        } else
                            res.text().then(msg => this.errorMsg = msg)
                })
            }
        }
    }
</script>
