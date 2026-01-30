import resize from './resize'
import longPress from './longPress'

// 注册所有自定义指令（无额外新增指令）
export default {
  install(Vue) {
    Vue.directive('resize', resize)
    Vue.directive('long-press', longPress)
  }
}