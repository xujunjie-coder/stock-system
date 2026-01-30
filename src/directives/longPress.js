/**
 * 长按指令：移动端长按触发回调
 * 严格对应目录结构：src/directives/longPress.js
 * 使用方式：v-long-press="handleLongPress" 或 v-long-press:500="handleLongPress"
 */
export default {
  bind(el, binding) {
    const pressTime = parseInt(binding.arg) || 300
    let pressTimer = null
    let isPressing = false

    const startPress = (e) => {
      if (e.type === 'click' && e.button === 0) return
      isPressing = true
      pressTimer = setTimeout(() => {
        if (isPressing) binding.value(e)
      }, pressTime)
    }

    const endPress = () => {
      isPressing = false
      clearTimeout(pressTimer)
    }

    el.addEventListener('mousedown', startPress)
    el.addEventListener('touchstart', startPress)
    el.addEventListener('mouseup', endPress)
    el.addEventListener('mouseleave', endPress)
    el.addEventListener('touchend', endPress)
    el.addEventListener('touchcancel', endPress)

    el._longPressHandlers = { startPress, endPress }
  },
  unbind(el) {
    const handlers = el._longPressHandlers
    if (handlers) {
      el.removeEventListener('mousedown', handlers.startPress)
      el.removeEventListener('touchstart', handlers.startPress)
      el.removeEventListener('mouseup', handlers.endPress)
      el.removeEventListener('mouseleave', handlers.endPress)
      el.removeEventListener('touchend', handlers.endPress)
      el.removeEventListener('touchcancel', handlers.endPress)
      delete el._longPressHandlers
    }
  }
}