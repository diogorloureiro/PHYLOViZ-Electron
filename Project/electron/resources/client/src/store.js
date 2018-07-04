'use strict'

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

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

export default store