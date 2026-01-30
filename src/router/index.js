import VueRouter from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'
import QuoteHome from '@/views/quote/QuoteHome.vue'
import StockDetail from '@/views/quote/StockDetail.vue'
import AISelectStock from '@/views/ai/AISelectStock.vue'
import TradePanel from '@/views/trade/TradePanel.vue'
import Mine from '@/views/mine/Mine.vue'
import NotFound from '@/views/common/NotFound.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', component: QuoteHome }, // 行情首页
      { path: 'detail/:code', component: StockDetail }, // 个股详情页
      { path: 'ai/select', component: AISelectStock }, // AI选股页
      { path: 'trade', component: TradePanel }, // 交易模拟页
      { path: 'mine', component: Mine } // 个人中心页
    ]
  },
  { path: '*', component: NotFound } // 404页面
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

export default router