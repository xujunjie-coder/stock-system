/**
 * 权限混入（登录状态检测/权限控制）
 * 严格对应目录结构：src/mixins/auth.js
 */
export default {
  data() {
    return {
      isLogin: false,
      userRole: 'guest' // guest/normal/admin
    }
  },
  computed: {
    isNormalUser() { return this.userRole === 'normal' },
    isAdminUser() { return this.userRole === 'admin' },
    hasTradePermission() { return this.isLogin && (this.isNormalUser || this.isAdminUser) },
    hasAIPermission() { return this.isLogin && (this.isNormalUser || this.isAdminUser) }
  },
  mounted() {
    this.initAuthState()
    this.$router.beforeEach((to, from, next) => {
      this.checkPermission(to, from, next)
    })
  },
  methods: {
    initAuthState() {
      const userInfo = localStorage.getItem('userInfo')
      if (userInfo) {
        const user = JSON.parse(userInfo)
        this.isLogin = true
        this.userRole = user.role || 'normal'
      }
    },
    login(userData) {
      this.isLogin = true
      this.userRole = userData.role || 'normal'
      localStorage.setItem('userInfo', JSON.stringify({ username: userData.username, role: this.userRole }))
      this.$message.success('登录成功')
    },
    logout() {
      this.isLogin = false
      this.userRole = 'guest'
      localStorage.removeItem('userInfo')
      this.$router.push('/login')
      this.$message.success('退出登录成功')
    },
    checkPermission(to, from, next) {
      const noAuthPages = ['/login', '/', '/detail/:code', '/common/*']
      const isNoAuthPage = noAuthPages.some(page => {
        if (page.includes('*')) return to.path.startsWith(page.replace('*', ''))
        return to.path === page
      })
      if (isNoAuthPage) { next(); return }
      if (!this.isLogin) { this.$message.error('请先登录'); next('/login'); return }
      const adminPages = ['/admin/*']
      const isAdminPage = adminPages.some(page => to.path.startsWith(page.replace('*', '')))
      if (isAdminPage && !this.isAdminUser) { this.$message.error('无权限访问'); next(from.path); return }
      next()
    }
  }
}