import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

const state = {
  sidebarShow: 'responsive',
  sidebarMinimize: false,
  user: {},
  contentTypes: [],
  components: [],
  permissionsMap: {}
}

const mutations = {
  toggleSidebarDesktop(state) {
    const sidebarOpened = [true, 'responsive'].includes(state.sidebarShow)
    state.sidebarShow = sidebarOpened ? false : 'responsive'
  },
  toggleSidebarMobile(state) {
    const sidebarClosed = [false, 'responsive'].includes(state.sidebarShow)
    state.sidebarShow = sidebarClosed ? true : 'responsive'
  },
  setUserInfo(state, user) {
    state.user = user
  },
  setContentTypes(state, contentTypes) {
    state.contentTypes = contentTypes

  },
  setComponents(state, components) {
    state.components = components
  },
  setPermissionsMap(state, permissionsMap) {
    state.permissionsMap = permissionsMap
  },
  set(state, [variable, value]) {
    state[variable] = value
  },
}

const getters = {
  getModelContentTypeByUid: (state) => (uid) => {
    let findindex = state.contentTypes.findIndex(x => x.uid === uid)
    if (findindex !== -1) {
      return state.contentTypes[findindex]
    }
    return undefined
  },
  getComponentContentTypeByUid: (state) => (uid) => {
    let findindex = state.components.findIndex(x => x.uid === uid)
    if (findindex !== -1) {
      return state.components[findindex]
    }
    return undefined
  },
  getPermissionByUid: (state) => (uid) => {
    return state.permissionsMap[uid]
  },
}

export default new Vuex.Store({
  state,
  mutations,
  getters
})