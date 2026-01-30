import Mock from 'mockjs'

// 持仓列表
Mock.mock('/api/trade/getHoldList', 'get', () => {
  return {
    code: 200,
    msg: 'success',
    data: [
      {
        holdId: Mock.Random.guid(),
        stockCode: '600519',
        stockName: '贵州茅台',
        avgCost: 1800.50,
        currentPrice: 1850.80,
        holdAmount: 100,
        marketValue: 185080.00,
        floatingProfit: 5030.00,
        profitRate: 2.80,
        marketType: '沪A'
      },
      {
        holdId: Mock.Random.guid(),
        stockCode: '002594',
        stockName: '比亚迪',
        avgCost: 250.30,
        currentPrice: 245.80,
        holdAmount: 500,
        marketValue: 122900.00,
        floatingProfit: -2250.00,
        profitRate: -1.80,
        marketType: '深A'
      }
    ]
  }
})

// 委托单列表
Mock.mock('/api/trade/getOrderList', 'get', (options) => {
  const { status = '' } = options.params
  const statusMap = {
    '': ['pending', 'filled', 'cancelled'], // 全部
    'pending': ['pending'], // 待成交
    'filled': ['filled'], // 已成交
    'cancelled': ['cancelled'] // 已撤单
  }
  
  const list = Mock.mock({
    [`array|10`]: [
      {
        orderId: Mock.Random.guid(),
        stockCode: Mock.Random.string('number', 6),
        stockName: Mock.Random.ctitle(2, 4),
        orderDirection: Mock.Random.pick(['buy', 'sell']),
        orderPrice: Mock.Random.float(10, 1000, 2, 2),
        orderAmount: Mock.Random.integer(100, 10000),
        dealAmount: function() {
          return this.orderStatus === 'filled' ? this.orderAmount : (this.orderStatus === 'pending' ? Mock.Random.integer(0, this.orderAmount) : 0)
        },
        orderStatus: Mock.Random.pick(statusMap[status] || statusMap['']),
        createTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
        dealTime: function() {
          return this.orderStatus === 'filled' ? Mock.Random.datetime('yyyy-MM-dd HH:mm:ss') : ''
        },
        marketType: Mock.Random.pick(['沪A', '深A', '科创板', '创业板'])
      }
    ]
  }).array

  return {
    code: 200,
    msg: 'success',
    data: {
      list,
      total: list.length
    }
  }
})

// 交易记录
Mock.mock('/api/trade/getTradeRecord', 'get', (options) => {
  const { page = 1, size = 20 } = options.params
  const list = Mock.mock({
    [`array|${size}`]: [
      {
        tradeId: Mock.Random.guid(),
        stockCode: Mock.Random.string('number', 6),
        stockName: Mock.Random.ctitle(2, 4),
        tradeDirection: Mock.Random.pick(['buy', 'sell']),
        tradePrice: Mock.Random.float(10, 1000, 2, 2),
        tradeAmount: Mock.Random.integer(100, 10000),
        tradeAmountTotal: function() {
          return (this.tradePrice * this.tradeAmount).toFixed(2)
        },
        tradeTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
        fee: Mock.Random.float(5, 50, 2, 2),
        marketType: Mock.Random.pick(['沪A', '深A'])
      }
    ]
  }).array

  return {
    code: 200,
    msg: 'success',
    data: {
      list,
      total: 50,
      page: parseInt(page),
      size: parseInt(size)
    }
  }
})

// 交易复盘
Mock.mock('/api/trade/getTradeReview', 'get', (options) => {
  const { startDate, endDate } = options.params
  return {
    code: 200,
    msg: 'success',
    data: {
      totalTradeCount: Mock.Random.integer(20, 50),
      totalProfit: Mock.Random.float(5000, 50000, 2, 2),
      winRate: Mock.Random.float(60, 85, 2, 2),
      avgProfitPerTrade: Mock.Random.float(100, 1000, 2, 2),
      maxProfitTrade: Mock.Random.float(5000, 20000, 2, 2),
      maxLossTrade: Mock.Random.float(-10000, -1000, 2, 2),
      profitDistribution: [
        { range: '-5%~0%', count: Mock.Random.integer(3, 8) },
        { range: '0%~5%', count: Mock.Random.integer(5, 15) },
        { range: '5%~10%', count: Mock.Random.integer(3, 8) },
        { range: '>10%', count: Mock.Random.integer(2, 5) }
      ],
      startDate: startDate || Mock.Random.date('yyyy-MM-dd'),
      endDate: endDate || Mock.Random.date('yyyy-MM-dd')
    }
  }
})

// 委托买入
Mock.mock('/api/trade/submitBuyOrder', 'post', (options) => {
  const data = JSON.parse(options.body)
  // 模拟校验
  if (data.orderPrice <= 0 || data.orderAmount <= 0) {
    return { code: 1002, msg: '委托参数错误' }
  }
  // 模拟科创板数量校验
  if (data.marketType === '科创板' && data.orderAmount < 200) {
    return { code: 1002, msg: '科创板委托数量需≥200股且为100股的整数倍' }
  }
  // 模拟其他市场数量校验
  if (data.marketType !== '科创板' && data.orderAmount < 100) {
    return { code: 1002, msg: '委托数量需≥100股且为100股的整数倍' }
  }
  // 模拟价格偏离校验
  if (Math.abs((data.orderPrice - data.currentPrice) / data.currentPrice) > 0.05) {
    return { code: 1004, msg: '当前委托价格偏离市价±5%' }
  }
  return {
    code: 200,
    msg: '买入委托提交成功',
    data: {
      orderId: Mock.Random.guid(),
      createTime: new Date().toLocaleString()
    }
  }
})

// 委托卖出
Mock.mock('/api/trade/submitSellOrder', 'post', (options) => {
  const data = JSON.parse(options.body)
  // 模拟校验
  if (data.orderPrice <= 0 || data.orderAmount <= 0) {
    return { code: 1002, msg: '委托参数错误' }
  }
  return {
    code: 200,
    msg: '卖出委托提交成功',
    data: {
      orderId: Mock.Random.guid(),
      createTime: new Date().toLocaleString()
    }
  }
})

// 撤单
Mock.mock('/api/trade/cancelOrder', 'post', (options) => {
  const { orderId } = JSON.parse(options.body)
  if (!orderId) {
    return { code: 400, msg: '订单ID不能为空' }
  }
  return {
    code: 200,
    msg: '撤单成功',
    data: {
      orderId,
      cancelTime: new Date().toLocaleString()
    }
  }
})

// 资金账户信息
Mock.mock('/api/trade/getAccountInfo', 'get', () => {
  return {
    code: 200,
    msg: 'success',
    data: {
      availableBalance: 100000.00, // 可用资金
      frozenBalance: 15000.50, // 冻结资金
      totalAsset: 115000.50, // 总资产
      todayProfit: 2800.30, // 今日盈亏
      totalProfit: 15680.80, // 总盈亏
      profitRate: 12.50 // 总收益率
    }
  }
})