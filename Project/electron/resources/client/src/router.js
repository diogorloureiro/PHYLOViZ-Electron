'use strict'

import Vue from 'vue'
import Router from 'vue-router'
import { Algorithms, Canvas, CreateProject, DatasetsTable, LoadDataset, Login, Project, Projects, Register } from './routes'

Vue.use(Router)

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

export default router