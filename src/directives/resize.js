/**
 * 窗口/元素尺寸变化指令
 * 严格对应目录结构：src/directives/resize.js
 * 使用方式：v-resize="handleResize" 或 v-resize:element="handleResize"
 */
export default {
  bind(el, binding) {
    const target = binding.arg === 'element' ? el : window
    let resizeTimer = null

    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        const sizeInfo = target === window 
          ? { width: window.innerWidth, height: window.innerHeight }
          : {
              width: el.getBoundingClientRect().width,
              height: el.getBoundingClientRect().height,
              left: el.getBoundingClientRect().left,
              top: el.getBoundingClientRect().top
            }
        binding.value(sizeInfo)
      }, 100)
    }

    target.addEventListener('resize', handleResize)
    handleResize()

    el._resizeData = { target, handleResize, resizeTimer }
  },
  unbind(el) {
    const resizeData = el._resizeData
    if (resizeData) {
      resizeData.target.removeEventListener('resize', resizeData.handleResize)
      clearTimeout(resizeData.resizeTimer)
      delete el._resizeData
    }
  }
}