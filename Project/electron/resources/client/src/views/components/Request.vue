<template>
    <i v-if='loading' class='fa fa-spinner fa-spin' style='font-size:36px'></i>
    <div v-else-if='!!message' class='alert alert-success' role='alert'>{{message}}</div>
    <div v-else-if='!!error' class='alert alert-danger' role='alert'>{{error}}</div>
</template>

<script>
    export default {
        props: ['href', 'method', 'json', 'data', 'action', 'onSuccess'],
        data() {
            return {
                loading: true,
                message: undefined,
                error: undefined,
                controller: undefined
            }
        },
        created() {
            this.load()
        },
        beforeDestroy() {
            if (this.controller)
                this.controller.abort()
        },
        watch: {
            href() { this.load() },
            json() { this.load() },
            data() { this.load() }
        },
        methods: {
            load() {
                console.log(`Load (${this.href}, ${this.method}, ${JSON.stringify(this.json)}, ${this.data})`)
                if (this.controller) {
                    this.controller.abort()
                    this.loading = true
                    this.message = undefined
                    this.error = undefined
                }
                this.controller = new AbortController()
                const options = {
                    method: this.method || 'GET',
                    headers: {},
                    credentials: 'include',
                    signal: this.controller.signal
                }
                if (this.json) {
                    options['body'] = JSON.stringify(this.json)
                    options.headers['content-type'] = 'application/json'
                } else if (this.data)
                    options['body'] = this.data
                fetch(`http://localhost:3000${this.href}`, options)
                    .then(res => res.text().then(body => {
                        if (!res.ok)
                            this.error = body
                        else
                            this.message = this.onSuccess(JSON.parse(body))
                    }))
                    .catch(err => this.error = 'An error has occured...')
                    .finally(() => this.loading = false)
            }
        }
    }
</script>