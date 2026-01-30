import request from '@/utils/request'

// 获取行情列表
export function getQuoteList(params) {
  // 简化传参：直接透传params，避免重复定义
  return request({
    url: '/api/quote/getQuoteList',
    method: 'get',
    params: params || {
      market: 'cnA',
      page: 1,
      size: 20,
      changeRate: '',
      volume: ''
    }
  })
}

// 获取个股详情（行情+K线+预测）
export function getStockDetail(code) {
  return request({
    url: '/api/quote/getStockDetail',
    method: 'get',
    params: { code }
  })
}

// 获取K线数据
export function getKlineData(params) {
  return request({
    url: '/api/quote/getKlineData',
    method: 'get',
    params
  })
}

// 新增：获取大盘指数（与现有接口格式对齐）
export function getMarketIndex() {
  return request({
    url: '/api/quote/marketIndex',
    method: 'get'
  })
}

// 新增：获取热门概念（与现有接口格式对齐）
export function getHotConcepts() {
  return request({
    url: '/api/quote/hotConcepts',
    method: 'get'
  })
}