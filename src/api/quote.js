import request from '@/utils/request'

/**
 * 封装行情模块接口，遵循项目统一请求规范
 */
export default {
  /**
   * 获取行情列表（支持分页、筛选）
   * @param {Object} params - 请求参数
   * @param {string} params.market - 市场类型（默认cn_a：沪深A股）
   * @param {number} params.page - 页码（默认1）
   * @param {number} params.size - 每页条数（默认20）
   * @param {string} params.change_rate - 涨跌幅区间（如：0-2、-5-0）
   * @param {string} params.volume - 成交量阈值（如：1000000：＞100万）
   * @param {string} params.keyword - 搜索关键词（股票代码/名称）
   */
  getQuoteList(params = {}) {
    // 默认参数
    const defaultParams = {
      market: 'cn_a',
      page: 1,
      size: 20,
      change_rate: '',
      volume: '',
      keyword: ''
    }
    return request({
      url: '/quote/list',
      method: 'GET',
      params: { ...defaultParams, ...params },
      timeout: 3000 // 行情类接口3秒超时
    })
  },

  /**
   * 获取K线数据
   * @param {Object} params - 请求参数
   * @param {string} params.code - 股票代码（必填）
   * @param {string} params.type - 周期类型（day/week/month，默认day）
   * @param {number} params.limit - 数据条数（默认30）
   */
  getKlineData(params = {}) {
    if (!params.code) throw new Error('股票代码不能为空')
    // 默认参数
    const defaultParams = {
      type: 'day',
      limit: 30,
      start: '', // 新增：开始时间（如2026-01-01）
      end: ''   // 新增：结束时间（如2026-01-25）
    }
    return request({
      url: '/quote/kline',
      method: 'GET',
      params: { ...defaultParams, ...params },
      timeout: 3000
    })
  },

  /**
   * 获取个股详情（整合行情、K线、预测数据）
   * @param {string} code - 股票代码（必填）
   */
  getStockDetail(code) {
    if (!code) throw new Error('股票代码不能为空')
    return request({
      url: `/quote/detail/${code}`,
      method: 'GET',
      timeout: 3000
    })
  },
  // 获取大盘指数数据（匹配 Mock /quote/marketIndex）
  getMarketIndex() {
    return request({
      url: '/quote/marketIndex',
      method: 'GET',
      timeout: 3000
    })
  },
  // 批量获取自选股行情
  getBatchQuote(params = {}) {
    if (!params.codes || params.codes.length === 0) throw new Error('股票代码列表不能为空')
    return request({
      url: '/quote/batch',
      method: 'GET',
      params: { codes: params.codes.join(','), ...params }, // 代码用逗号拼接
      timeout: 3000
    })
  }
}