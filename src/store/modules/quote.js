const state = {
  // 新增：多端适配状态（初始化按屏幕宽度判断）
  isPc: window.innerWidth >= 768,
  
  // 原有状态：大盘指数数据
  marketIndex: {
    sh: 0, // 上证指数
    sz: 0, // 深证成指
    cy: 0, // 创业板指
    bj: 0  // 北证50
  },
  
  // 原有状态：行情列表数据
  stockList: [],
  
  // 原有状态：行情筛选参数
  filterParams: {
    market: 'all',       // 市场（all/sh/sz/cy/bj）
    industry: '',        // 行业
    concept: '',         // 概念
    sortType: 'percent', // 排序字段
    sortOrder: 'desc'    // 排序方向
  },
  
  // 原有状态：当前选中个股
  currentStock: {
    code: '',
    name: '',
    price: 0,
    percent: 0,
    volume: 0
  },
  
  // 原有状态：K线图数据
  klineData: {
    day: [],  // 日线
    week: [], // 周线
    month: [] // 月线
  },
  
  // 补充：K线渲染时间（对应setKlineRenderTime mutation）
  klineRenderTime: ''
}

const mutations = {
  // 新增：更新多端适配状态
  UPDATE_IS_PC(state, isPc) {
    state.isPc = isPc
  },
  
  // 原有状态对应的mutation：更新大盘指数
  UPDATE_MARKET_INDEX(state, indexData) {
    state.marketIndex = { ...state.marketIndex, ...indexData }
  },
  
  // 原有状态对应的mutation：更新行情列表
  UPDATE_STOCK_LIST(state, stockList) {
    state.stockList = stockList
  },
  
  // 原有状态对应的mutation：更新筛选参数
  UPDATE_FILTER_PARAMS(state, params) {
    state.filterParams = { ...state.filterParams, ...params }
  },
  
  // 原有状态对应的mutation：更新当前选中个股
  UPDATE_CURRENT_STOCK(state, stockInfo) {
    state.currentStock = { ...state.currentStock, ...stockInfo }
  },
  
  // 原有状态对应的mutation：更新K线数据
  UPDATE_KLINE_DATA(state, { type, data }) {
    state.klineData[type] = data
  },
  
  // 补充：缺失的setKlineRenderTime mutation（兼容Footer.vue调用）
  setKlineRenderTime(state, time) {
    state.klineRenderTime = time
  }
}

const actions = {
  // 新增：初始化窗口尺寸监听，动态更新isPc
  initResizeListener({ commit }) {
    // 初始触发一次，确保页面加载时状态正确
    commit('UPDATE_IS_PC', window.innerWidth >= 768)
    // 监听窗口resize事件
    window.addEventListener('resize', () => {
      commit('UPDATE_IS_PC', window.innerWidth >= 768)
    })
  },
  
  // 原有状态对应的action：加载大盘指数
  async loadMarketIndex({ commit }) {
    try {
      // 修复：改用axios调用Mock接口（如果没装axios，先执行npm install axios）
      const axios = require('axios')
      const res = await axios.get('/quote/marketIndex')
      if (res.data.code === 200) {
        commit('UPDATE_MARKET_INDEX', res.data.data)
      }
    } catch (error) {
      console.error('加载大盘指数失败：', error)
    }
  },
  
  // 原有状态对应的action：加载K线数据（保留，但注释掉不存在的getKlineData）
  async loadKlineData({ commit }, { code, type = 'day' }) {
    try {
      // 注释掉不存在的getKlineData，改用Mock数据
      // const { getKlineData } = require('@/api/quote')
      // const res = await getKlineData({ code, type })
      // if (res.code === 200) {
      //   commit('UPDATE_KLINE_DATA', { type, data: res.data })
      // }
      // 模拟K线数据返回
      const mockKlineData = []
      commit('UPDATE_KLINE_DATA', { type, data: mockKlineData })
    } catch (error) {
      console.error(`加载${type}K线数据失败：`, error)
    }
  },
  
  // 补充：缺失的refreshQuoteData action（兼容Footer.vue调用）
  async refreshQuoteData({ commit, dispatch }) {
    try {
      // 复用修复后的loadMarketIndex逻辑
      await dispatch('loadMarketIndex')
      // 注释掉不存在的getStockList，避免报错
      // const { getStockList } = require('@/api/quote')
      // const res = await getStockList(state.filterParams)
      // if (res.code === 200) commit('UPDATE_STOCK_LIST', res.data.list)
      
      // 触发K线渲染时间更新（兼容Footer.vue的mutation调用）
      commit('setKlineRenderTime', new Date().getTime())
    } catch (error) {
      console.error('刷新行情数据失败：', error)
    }
  }
}

const getters = {
  // 原有状态对应的getter：筛选后的行情列表
  filteredStockList: (state) => {
    const { market, industry, concept, sortType, sortOrder } = state.filterParams
    let result = [...state.stockList]
    
    // 市场筛选
    if (market !== 'all') {
      const prefixMap = { sh: '6', sz: '00', cy: '30', bj: '8' }
      result = result.filter(stock => stock.code.startsWith(prefixMap[market]))
    }
    
    // 行业筛选
    if (industry) {
      result = result.filter(stock => stock.industry === industry)
    }
    
    // 概念筛选
    if (concept) {
      result = result.filter(stock => stock.concept.includes(concept))
    }
    
    // 排序
    result.sort((a, b) => {
      return sortOrder === 'desc' ? b[sortType] - a[sortType] : a[sortType] - b[sortType]
    })
    
    return result
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}