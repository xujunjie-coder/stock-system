import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import quote from './modules/quote'
import trade from './modules/trade'
import ai from './modules/ai'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user,
    quote,
    trade,
    ai
  }
})