import Mock from 'mockjs'

// AI选股策略列表
Mock.mock('/api/ai/getStrategyList', 'get', () => {
  return {
    code: 200,
    msg: 'success',
    data: [
      {
        strategyId: 'value_growth',
        strategyName: '低估值高成长策略',
        desc: '筛选市盈率低于行业均值、净利润增长率连续3年超15%的股票',
        applyMarket: '沪深A股',
        accuracyRate: 82
      },
      {
        strategyId: 'tech_innovation',
        strategyName: '科技创新策略',
        desc: '聚焦半导体、人工智能、新能源等高新技术行业，研发投入占比超5%',
        applyMarket: '沪深A股、创业板',
        accuracyRate: 78
      },
      {
        strategyId: 'consumption_upgrade',
        strategyName: '消费升级策略',
        desc: '关注食品饮料、家电、医疗健康等必选消费行业，ROE超15%',
        applyMarket: '沪深A股',
        accuracyRate: 85
      },
      {
        strategyId: 'cycle_recovery',
        strategyName: '周期复苏策略',
        desc: '布局煤炭、钢铁、化工等周期性行业，景气度触底回升的股票',
        applyMarket: '沪深A股',
        accuracyRate: 75
      }
    ]
  }
})

// AI智能选股
Mock.mock('/api/ai/selectStock', 'post', (options) => {
  const data = JSON.parse(options.body)
  const { strategyId = 'value_growth', count = 10, riskLevel = 'medium', industry = 'all' } = data
  
  // 行业映射
  const industryMap = {
    'all': ['消费', '科技', '金融', '制造', '医药'],
    'consumption': ['消费'],
    'tech': ['科技'],
    'finance': ['金融'],
    'manufacture': ['制造'],
    'medical': ['医药']
  }
  const targetIndustries = industryMap[industry] || ['消费', '科技', '金融']
  
  // 风险等级映射
  const riskMap = {
    'low': ['low'],
    'medium': ['low', 'medium'],
    'high': ['low', 'medium', 'high']
  }
  const targetRisks = riskMap[riskLevel] || ['low', 'medium']
  
  const list = Mock.mock({
    [`array|${count}`]: [
      {
        stockCode: Mock.Random.string('number', 6),
        stockName: Mock.Random.ctitle(2, 4),
        industry: function() {
          return Mock.Random.pick(targetIndustries)
        },
        currentPrice: Mock.Random.float(10, 1000, 2, 2),
        targetPrice: function() {
          return (this.currentPrice * Mock.Random.float(1.05, 1.3)).toFixed(2)
        },
        score: Mock.Random.integer(70, 95),
        riskLevel: function() {
          return Mock.Random.pick(targetRisks)
        },
        reason: Mock.Random.cparagraph(1, 2),
        accuracyRate: Mock.Random.integer(75, 90),
        scoreDetail: {
          valuation: Mock.Random.integer(60, 95), // 估值维度
          growth: Mock.Random.integer(60, 95), // 成长维度
          capital: Mock.Random.integer(60, 95), // 资金维度
          policy: Mock.Random.integer(60, 95) // 政策维度
        }
      }
    ]
  }).array

  return {
    code: 200,
    msg: '选股成功',
    data: {
      strategyId,
      strategyName: '低估值高成长策略',
      list,
      total: parseInt(count),
      riskLevel,
      industry
    }
  }
})

// AI选股回测
Mock.mock('/api/ai/strategyBacktest', 'post', (options) => {
  const data = JSON.parse(options.body)
  const { strategyId = 'value_growth', startDate, endDate } = data
  
  // 生成回测数据
  const tradeMonths = Math.floor(Math.random() * 12) + 6 // 6-18个月
  const baseProfit = Mock.Random.float(5, 20, 2, 2) // 基准收益
  const strategyProfit = baseProfit + Mock.Random.float(3, 10, 2, 2) // 策略收益
  
  return {
    code: 200,
    msg: '回测成功',
    data: {
      strategyId,
      strategyName: '低估值高成长策略',
      startDate: startDate || Mock.Random.date('yyyy-MM-dd'),
      endDate: endDate || Mock.Random.date('yyyy-MM-dd'),
      backtestPeriod: `${tradeMonths}个月`,
      strategyProfitRate: strategyProfit, // 策略收益率
      benchmarkProfitRate: baseProfit, // 基准收益率（沪深300）
      excessProfitRate: (strategyProfit - baseProfit).toFixed(2), // 超额收益率
      winRate: Mock.Random.float(60, 85, 2, 2), // 胜率
      maxDrawdown: Mock.Random.float(5, 15, 2, 2), // 最大回撤
      tradeCount: Mock.Random.integer(30, 80), // 交易次数
      profitDistribution: [
        { range: '-5%~0%', count: Mock.Random.integer(5, 15) },
        { range: '0%~5%', count: Mock.Random.integer(10, 25) },
        { range: '5%~10%', count: Mock.Random.integer(8, 20) },
        { range: '>10%', count: Mock.Random.integer(5, 12) }
      ]
    }
  }
})

// AI行情预测
Mock.mock('/api/ai/stockPrediction', 'get', (options) => {
  const { stockCode, period = '1d' } = options.params
  
  // 周期映射
  const periodMap = {
    '1d': '1日',
    '3d': '3日',
    '1w': '1周',
    '1m': '1月'
  }
  const periodName = periodMap[period] || '1日'
  
  // 生成预测数据
  const upProbability = Mock.Random.integer(40, 90)
  const trend = upProbability >= 50 ? 'up' : 'down'
  
  return {
    code: 200,
    msg: '预测成功',
    data: {
      stockCode,
      stockName: Mock.Random.ctitle(2, 4),
      period,
      periodName,
      trend,
      upProbability,
      downProbability: 100 - upProbability,
      targetPrice: Mock.Random.float(10, 1000, 2, 2),
      supportPrice: Mock.Random.float(10, 1000, 2, 2), // 支撑位
      pressurePrice: Mock.Random.float(10, 1000, 2, 2), // 压力位
      analysis: Mock.Random.cparagraph(2, 3),
      factors: [
        { name: '基本面', score: Mock.Random.integer(60, 95), desc: Mock.Random.csentence(10, 20) },
        { name: '技术面', score: Mock.Random.integer(60, 95), desc: Mock.Random.csentence(10, 20) },
        { name: '资金面', score: Mock.Random.integer(60, 95), desc: Mock.Random.csentence(10, 20) },
        { name: '政策面', score: Mock.Random.integer(60, 95), desc: Mock.Random.csentence(10, 20) }
      ],
      accuracyRate: Mock.Random.integer(70, 90), // 历史准确率
      updateTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
    }
  }
})

// AI预测完整报告
Mock.mock('/api/ai/getPredictionReport', 'get', (options) => {
  const { stockCode, period = '1m' } = options.params
  
  return {
    code: 200,
    msg: '获取报告成功',
    data: {
      stockInfo: {
        stockCode,
        stockName: Mock.Random.ctitle(2, 4),
        industry: Mock.Random.pick(['消费', '科技', '金融', '制造', '医药']),
        currentPrice: Mock.Random.float(10, 1000, 2, 2),
        marketType: Mock.Random.pick(['沪A', '深A', '创业板'])
      },
      predictionSummary: {
        period: period,
        periodName: '1个月',
        trend: Mock.Random.pick(['up', 'down']),
        upProbability: Mock.Random.integer(50, 90),
        targetPrice: Mock.Random.float(10, 1000, 2, 2),
        profitSpace: function() {
          const space = (this.targetPrice - this.stockInfo.currentPrice) / this.stockInfo.currentPrice * 100
          return space.toFixed(2)
        },
        operationSuggest: Mock.Random.pick(['买入', '持有', '卖出', '观望']),
        accuracyRate: Mock.Random.integer(75, 90)
      },
      detailedAnalysis: {
        fundamental: Mock.Random.cparagraph(3, 5), // 基本面分析
        technical: Mock.Random.cparagraph(3, 5), // 技术面分析
        capitalFlow: Mock.Random.cparagraph(2, 3), // 资金流向分析
        industryTrend: Mock.Random.cparagraph(2, 3) // 行业趋势分析
      },
      priceForecast: {
        supportLevels: [
          { price: Mock.Random.float(10, 1000, 2, 2), desc: '强支撑' },
          { price: Mock.Random.float(10, 1000, 2, 2), desc: '弱支撑' }
        ],
        pressureLevels: [
          { price: Mock.Random.float(10, 1000, 2, 2), desc: '强压力' },
          { price: Mock.Random.float(10, 1000, 2, 2), desc: '弱压力' }
        ],
        priceRange: {
          min: Mock.Random.float(10, 1000, 2, 2),
          max: Mock.Random.float(10, 1000, 2, 2)
        }
      },
      riskTips: [
        Mock.Random.csentence(15, 25),
        Mock.Random.csentence(15, 25),
        Mock.Random.csentence(15, 25)
      ],
      updateTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
      dataSource: '同花顺行情数据 + AI预测模型'
    }
  }
})