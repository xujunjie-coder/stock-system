/**
 * 多端适配混入（横屏检测/布局切换/终端判断）
 * 严格对应目录结构：src/mixins/multiTerminal.js
 */
export default {
  data() {
    return {
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      isLandscape: window.innerWidth > window.innerHeight, // 是否横屏
      resizeTimer: null // 防抖定时器
    }
  },
  computed: {
    // 终端类型判断（按设计文档断点）
    deviceType() {
      if (this.screenWidth >= 1200) return 'pc' // PC端
      if (this.screenWidth >= 1024) return 'tabletLandscape' // 平板横屏
      if (this.screenWidth >= 768) return 'tabletPortrait' // 平板竖屏
      if (this.screenWidth >= 768 && this.isLandscape) return 'mobileLandscape' // 移动端横屏
      return 'mobilePortrait' // 移动端竖屏
    },
    isPc() { return this.deviceType === 'pc' },
    isTablet() { return this.deviceType === 'tabletLandscape' || this.deviceType === 'tabletPortrait' },
    isMobile() { return this.deviceType === 'mobileLandscape' || this.deviceType === 'mobilePortrait' },
    isDeviceLandscape() { return this.deviceType === 'tabletLandscape' || this.deviceType === 'mobileLandscape' }
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
    window.addEventListener('orientationchange', this.handleOrientationChange)
    this.initLayout()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    window.removeEventListener('orientationchange', this.handleOrientationChange)
    clearTimeout(this.resizeTimer)
  },
  methods: {
    handleResize: function() {
      clearTimeout(this.resizeTimer)
      this.resizeTimer = setTimeout(() => {
        this.screenWidth = window.innerWidth
        this.screenHeight = window.innerHeight
        this.isLandscape = window.innerWidth > window.innerHeight
        this.updateLayout()
      }, 100)
    },
    handleOrientationChange() {
      setTimeout(() => this.handleResize(), 100)
    },
    initLayout() { this.updateLayout() },
    updateLayout() {
      this.$emit('layoutChange', this.deviceType, this.isLandscape)
    }
  }
}