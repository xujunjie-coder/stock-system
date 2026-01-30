// src/router/index.js
import Vue from 'vue'
import VueRouter from 'vue-router'
import { getToken } from '@/utils/storage'

Vue.use(VueRouter)

// 懒加载引入视图（优化首屏加载）
const QuoteHome = () => import('@/views/quote/QuoteHome.vue')
// 预留登录页、个股详情页（按需扩展）
const Login = () => import('@/views/login/index.vue')
const StockDetail = () => import('@/views/quote/StockDetail.vue')

// 路由规则
const routes = [
  {
    // 行情首页（根路由）
    path: '/',
    name: 'QuoteHome',
    component: QuoteHome,
    meta: {
      title: '同花顺 - 行情首页', // 页面标题
      keepAlive: true, // 缓存页面提升体验
      requiresAuth: false // 无需登录即可访问
    }
  },
  {
    // 个股详情页（预留）
    path: '/detail/:code',
    name: 'StockDetail',
    component: StockDetail,
    meta: {
      title: '个股详情',
      keepAlive: false,
      requiresAuth: false
    }
  },
  {
    // 登录页（预留）
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  // 404兜底路由
  {
    path: '*',
    redirect: '/'
  }
]

const router = new VueRouter({
  mode: 'hash', // 多端适配推荐hash模式
  base: process.env.BASE_URL,
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 路由跳转后滚动到顶部（或恢复保存的位置）
    return savedPosition || { x: 0, y: 0 }
  }
})

// 路由守卫：权限控制 + 页面标题设置
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }
  // 需登录页面的权限校验
  if (to.meta.requiresAuth) {
    if (getToken()) {
      next()
    } else {
      next({ name: 'Login' }) // 未登录跳转到登录页
    }
  } else {
    next() // 无需登录直接放行
  }
})

export default router