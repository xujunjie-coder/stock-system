import request from '@/utils/request'

// 获取持仓列表
export function getHoldList() {
  return request({
    url: '/api/trade/getHoldList',
    method: 'get'
  })
}

// 获取委托单列表
export function getOrderList(params) {
  return request({
    url: '/api/trade/getOrderList',
    method: 'get',
    params
  })
}

// 获取交易记录
export function getTradeRecord(params) {
  return request({
    url: '/api/trade/getTradeRecord',
    method: 'get',
    params
  })
}

// 交易复盘分析
export function getTradeReview(params) {
  return request({
    url: '/api/trade/getTradeReview',
    method: 'get',
    params
  })
}

// 委托买入
export function submitBuyOrder(data) {
  return request({
    url: '/api/trade/submitBuyOrder',
    method: 'post',
    data
  })
}

// 委托卖出
export function submitSellOrder(data) {
  return request({
    url: '/api/trade/submitSellOrder',
    method: 'post',
    data
  })
}

// 撤单
export function cancelOrder(data) {
  return request({
    url: '/api/trade/cancelOrder',
    method: 'post',
    data
  })
}

// 获取资金账户信息
export function getAccountInfo() {
  return request({
    url: '/api/trade/getAccountInfo',
    method: 'get'
  })
}