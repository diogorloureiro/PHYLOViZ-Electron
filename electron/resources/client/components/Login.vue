<template>
    <div class='form-signin' style='width: 100%; max-width: 330px; padding: 15px; margin: 0 auto;'>
        <br>
        <h1 class='h3 mb-3 font-weight-normal'>Please login</h1>
        <label for='inputUsername' class='sr-only'>Username</label>
        <input v-model='username' type='username' id='inputUsername' class='form-control' placeholder='Username' required autofocus>
        <br>
        <label for='inputPassword' class='sr-only'>Password</label>
        <input v-model='password' type='password' id='inputPassword' class='form-control' placeholder='Password' required>
        <br>
        <button class='btn btn-lg btn-outline-success btn-block' v-on:click='login'>Login</button>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                username: undefined,
                password: undefined
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
                    headers: { 'content-type': 'application/json' }
                }
                fetch('http://localhost:3000/login', options).then(res => res.json()).then(user => {
                    
                    this.$store.commit('setAuth', true)
                    this.$router.push('/')
                })
            }
        }
    }
</script>
