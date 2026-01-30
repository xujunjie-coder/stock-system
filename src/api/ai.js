import request from '@/utils/request'

// AI选股策略列表
export function getAIStrategyList() {
  return request({
    url: '/api/ai/getStrategyList',
    method: 'get'
  })
}

// AI智能选股
export function aiSelectStock(params) {
  return request({
    url: '/api/ai/selectStock',
    method: 'post',
    data: params
  })
}

// AI选股回测
export function aiStrategyBacktest(params) {
  return request({
    url: '/api/ai/strategyBacktest',
    method: 'post',
    data: params
  })
}

// AI行情预测
export function aiStockPrediction(params) {
  return request({
    url: '/api/ai/stockPrediction',
    method: 'get',
    params
  })
}

// AI预测完整报告
export function getAIPredictionReport(params) {
  return request({
    url: '/api/ai/getPredictionReport',
    method: 'get',
    params
  })
}