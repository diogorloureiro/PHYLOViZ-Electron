'use strict'

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        token: undefined,
        username: undefined,
        project: undefined
    },
    mutations: {
        setToken(state, token) {
            state.token = token
        },
        setUsername(state, username) {
            state.username = username
        },
        setProject(state, project) {
            state.project = project
        }
    }
})

export default store