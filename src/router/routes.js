export default [
  {
    path: '/',
    name: 'QuoteHome',
    component: () => import('@/views/quote/QuoteHome'),
    meta: { title: '行情首页', keepAlive: true, requiresAuth: false }
  },
  {
    path: '/detail/:code',
    name: 'StockDetail',
    component: () => import('@/views/quote/StockDetail'),
    meta: { title: '个股详情', keepAlive: false, requiresAuth: false },
    props: true
  },
  {
    path: '/ai/select',
    name: 'AISelectStock',
    component: () => import('@/views/ai/AISelectStock'),
    meta: { title: 'AI智能选股', keepAlive: true, requiresAuth: false }
  },
  {
    path: '/trade',
    name: 'TradePanel',
    component: () => import('@/views/trade/TradePanel'),
    meta: { title: '交易中心', keepAlive: false, requiresAuth: true }
  },
  {
    path: '/mine',
    name: 'Mine',
    component: () => import('@/views/mine/Mine'),
    meta: { title: '个人中心', keepAlive: true, requiresAuth: true }
  },
  // 扩展路由（文档补充）
  {
    path: '/ai/prediction/:code',
    name: 'AIPredictionReport',
    component: () => import('@/views/ai/AIPredictionReport'),
    meta: { title: 'AI预测报告', keepAlive: false, requiresAuth: false },
    props: true
  },
  {
    path: '/trade/record',
    name: 'TradeRecord',
    component: () => import('@/views/trade/TradeRecord'),
    meta: { title: '交易记录', keepAlive: false, requiresAuth: true }
  },
  {
    path: '*',
    name: 'NotFound',
    component: () => import('@/views/common/NotFound'),
    meta: { title: '页面不存在' }
  }
]