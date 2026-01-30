import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import quote from './modules/quote'
import ai from './modules/ai'
import trade from './modules/trade'
import getters from './getters'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user,
    quote,
    ai,
    trade
  },
  getters
})