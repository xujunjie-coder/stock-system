import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import ECharts from 'echarts'
import VueECharts from 'vue-echarts'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { RecycleScroller } from 'vue-virtual-scroller'


// 移除单独引入Loading，改用ElementUI内置方式

// 开发环境启用Mock（生产环境自动不加载）
if (process.env.NODE_ENV === 'development') {
  // 引入Mock入口文件，注册所有Mock规则
  require('./mock/index.js') 
}
Vue.component('RecycleScroller', RecycleScroller)
// 全局注册组件
Vue.component('v-chart', VueECharts)
// 核心修复：先注册ElementUI，再全局挂载Loading（覆盖所有用法）
Vue.use(ElementUI, {
  size: 'medium' // 可选，仅为了确保ElementUI完整注册
})
// 全局挂载Loading实例（兼容指令和组件两种用法）
Vue.prototype.$loading = ElementUI.Loading.service
Vue.use(VueVirtualScroller)

// 全局挂载工具
Vue.prototype.$echarts = ECharts
Vue.prototype.$bus = new Vue() // 全局事件总线

// 环境配置
Vue.config.productionTip = process.env.NODE_ENV === 'production'

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')