import Vue from 'vue'
import Router from 'vue-router'
import Vuex from 'vuex'
import BootstrapVue from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App.vue'
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'
import Canvas from './components/Canvas.vue'
import DatasetsTable from './components/DatasetsTable.vue'
import LoadDataset from './components/LoadDataset.vue'
import Algorithms from './components/Algorithms.vue'
import Register from './components/Register.vue'
import Login from './components/Login.vue'
import Projects from './components/Projects.vue'
import CreateProject from './components/CreateProject.vue'
import Project from './components/Project.vue'
Vue.component('Navbar', Navbar)
Vue.component('Sidebar', Sidebar)
Vue.component('Canvas', Canvas)
Vue.component('DatasetsTable', DatasetsTable)
Vue.component('Algorithms', Algorithms)
Vue.component('Register', Register)
Vue.component('Login', Login)
Vue.component('Projects', Projects)
Vue.component('CreateProject', CreateProject)
Vue.component('Project', Project)

Vue.use(Router)
Vue.use(Vuex)
Vue.use(BootstrapVue)

const store = new Vuex.Store({
    state: {
        project: undefined,
        username: undefined
    },
    mutations: {
        setProject(state, project) {
            state.project = project
        },
        setUsername(state, username) {
            state.username = username
        }
    }
})

const routes = [
    {
        path: '/public-datasets',
        component: DatasetsTable
    },
    {
        path: '/canvas',
        component: Canvas
    },
    {
        path: '/upload-dataset',
        component: LoadDataset
    },
    {
        path: '/algorithms',
        component: Algorithms
    },
    {
        path: '/register',
        component: Register
    },
    {
        path: '/login',
        component: Login
    },
    {
        path: '/projects',
        component: Projects,
        meta: { requiresAuth: true }
    },
    {
        path: '/projects/create',
        component: CreateProject,
        meta: { requiresAuth: true }
    },
    {
        path: '/project',
        component: Project,
        meta: { requiresAuth: true }
    }
]

const router = new Router({ mode: 'history', routes })

router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth) && !store.state.username)
        next({ path: '/login' })
    else
        next()
})

new Vue({
    store,
    router,
    el: '#app',
    render: h => h(App)
})