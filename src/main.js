import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import router from './router'
import store from './store'
import './mock' // 引入Mock模拟数据

Vue.use(ElementUI)
Vue.use(Vuex)
Vue.use(VueRouter)
Vue.config.productionTip = false

// 关键：仅开发环境启用Mock（通过process.env.NODE_ENV判断）
if (process.env.NODE_ENV === 'development') {
  require('./mock'); // 导入Mock入口，注册Mock接口
}

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')