'use strict'

import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue)

import App from './views/App.vue'
import { Navbar, Sidebar, Request } from './views/components'

Vue.component('Navbar', Navbar)
Vue.component('Sidebar', Sidebar)
Vue.component('Request', Request)

import router from './router'
import store from './store'

router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth) && !store.state.username)
        next({ path: '/login' })
    else if (to.matched.some(record => record.meta.requiresNotAuth) && store.state.username)
        next({ path: '/' })
    else
        next()
})

new Vue({
    store,
    router,
    el: '#app',
    render: h => h(App)
})