'use strict'

import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue)

import router from './router'
import store from './store'
import App from './views/App.vue'
import { Navbar, Sidebar } from './views/components'

Vue.component('Navbar', Navbar)
Vue.component('Sidebar', Sidebar)

new Vue({
    store,
    router,
    el: '#app',
    render: h => h(App)
})