import Mock from 'mockjs'

/**
 * 模拟行情列表数据
 */
Mock.mock(/\/quote\/list/, 'get', (options) => {
  // 修复：移除多余的 JSON.parse/JSON.stringify，补全括号，处理无参数情况
  const urlParamStr = options.url.split('?')[1] || ''; // 处理无参数的情况
  const params = urlParamStr
    .split('&')
    .reduce((obj, item) => {
      // 修复：跳过空字符串（比如参数串末尾有&的情况）
      if (!item) return obj;
      const [key, value] = item.split('=')
      obj[decodeURIComponent(key)] = decodeURIComponent(value)
      return obj
    }, {})

  // // 新增：兼容market参数（无论传什么，都返回A股数据，避免过滤）
  // const market = params.market || 'cn_a'
  // // 修复：即使非A股，也返回空数组（而非total=0），匹配前端Array(0)的接收逻辑
  // if (market !== 'cn_a') {
  //   return {
  //     code: 200,
  //     msg: 'success',
  //     data: [] // 直接返回空数组，匹配前端期望的数组格式
  //   }
  // }  
  // 模拟1000条数据（支持分页）
  const total = 1000
  const page = parseInt(params.page) || 1
  const size = parseInt(params.size) || 20
  const startIndex = (page - 1) * size

  // 生成模拟数据（调整字段名，匹配前端StockQuote.vue期望的字段）
  const list = Mock.mock({
    [`array|${size}`]: [
      {
        'code|6': /[0-9]/, // 股票代码（6位数字）
        'name': '@cword(2,4)', // 股票名称（2-4个中文字符）
        'price|100-2000.2': 1, // 最新价（100-2000，保留2位小数）
        'change|1-50.2': 1, // 涨跌额（1-50，保留2位小数）
        'change_rate|0.01-10.2': 1, // 涨跌幅（0.01-10，保留2位小数）
        'volume|100000-10000000': 1, // 成交量（10万-1000万）
        'high|100-2000.2': 1, // 最高价
        'low|100-2000.2': 1, // 最低价
        // 新增：补充前端可能期望的字段（匹配quote.js中的state字段）
        'percent': function() { return this.change_rate }, // 兼容sortType: 'percent'
        'industry': '@cword(2,4)', // 行业
        'concept': '@cword(2,4)' // 概念
      }
    ]
  }).array

  // 处理涨跌幅正负（随机）
  const formattedList = list.map(item => {
    // 50%概率为下跌
    if (Math.random() > 0.5) {
      item.change = -item.change
      item.change_rate = -item.change_rate
      item.percent = -item.percent // 同步percent字段
    }
    return item
  })

  // 排序处理
  if (params.sort_prop && params.sort_order) {
    formattedList.sort((a, b) => {
      const prop = params.sort_prop === 'changeRate' ? 'change_rate' : params.sort_prop
      return params.sort_order === 'asc' ? a[prop] - b[prop] : b[prop] - a[prop]
    })
  }

  // 修复2：避免直接赋值覆盖formattedList，先复制再处理搜索
    let finalList = [...formattedList];
    // 优化后代码（确保数据长度符合分页逻辑）
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase()
      const filtered = finalList.filter(item => 
        item.code.includes(keyword) || item.name.toLowerCase().includes(keyword)
      )
      // 修复：搜索后总条数为 filtered.length，重新计算分页截取范围
    const filteredTotal = filtered.length
    const searchStartIndex = (page - 1) * size
    finalList = filtered.slice(searchStartIndex, searchStartIndex + size)
    total = filteredTotal // 更新总条数，前端分页组件能正确显示页数
  } else {
    finalList = finalList.slice(startIndex, startIndex + size)
  }
  // 返回时携带更新后的 total
    return {
      code: 200,
      msg: 'success',
      list: finalList,
      total: filteredTotal,
      page: page,
      size: size
  }
})

/**
 * 模拟K线数据（30天）
 */
Mock.mock(/\/quote\/kline/, 'get', (options) => {
  // 修复1：移除多余的 JSON.parse/JSON.stringify，补全括号，处理无参数情况
  const urlParamStr = options.url.split('?')[1] || ''; // 处理无参数的情况
  const params = urlParamStr
    .split('&')
    .reduce((obj, item) => {
      // 修复：跳过空字符串（比如参数串末尾有&的情况）
      if (!item) return obj;
      const [key, value] = item.split('=')
      obj[decodeURIComponent(key)] = decodeURIComponent(value)
      return obj
    }, {})

  const limit = parseInt(params.limit) || 30
  const type = params.type || 'day'

  // 优化后代码（周/月按正确粒度递减）
  const getDateList = (count) => {
    const dateList = []
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date()
      if (type === 'day') {
        date.setDate(date.getDate() - i) // 日线：按天递减
      } else if (type === 'week') {
        date.setDate(date.getDate() - i * 7) // 周线：按周递减
        date.setDate(date.getDate() - (date.getDay() || 7) + 1) // 取周一
      } else if (type === 'month') {
        date.setMonth(date.getMonth() - i) // 月线：按月递减
        date.setDate(1) // 取当月1号
      }
      dateList.push(date.toLocaleDateString().replace(/\//g, '-'))
    }
    // 去重（避免周/月粒度下日期重复）
    return [...new Set(dateList)]
  }

  const dateList = getDateList(limit)
  const klineData = []

  // 生成K线数据
  dateList.forEach(date => {
    const open = Mock.mock('@float(100, 2000, 2, 2)')
    const close = Mock.mock(`@float(${open * 0.95}, ${open * 1.05}, 2, 2)`)
    const high = Mock.mock(`@float(${Math.max(open, close)}, ${Math.max(open, close) * 1.03}, 2, 2)`)
    const low = Mock.mock(`@float(${Math.min(open, close) * 0.97}, ${Math.min(open, close)}, 2, 2)`)

    klineData.push({
      date,
      open,
      close,
      high,
      low,
      volume: Mock.mock('@integer(100000, 10000000)')
    })
  })

  return {
    code: 200,
    msg: 'success',
    data: klineData // 直接返回数组
  }
})

/**
 * 模拟个股详情数据
 */
Mock.mock(/\/quote\/detail\/\d+/, 'get', () => {
  const code = Mock.mock('@integer(600000, 601999)')
  const name = Mock.mock('@cword(2,4)')
  const price = Mock.mock('@float(100, 2000, 2, 2)')
  const change = Mock.mock('@float(1, 50, 2, 2)')
  const changeRate = (change / price * 100).toFixed(2)
  const percent = changeRate // 补充percent字段

  return {
    code: 200,
    msg: 'success',
    data: {
      quote: {
        code,
        name,
        price,
        change: Math.random() > 0.5 ? change : -change,
        change_rate: Math.random() > 0.5 ? changeRate : -changeRate,
        percent: Math.random() > 0.5 ? changeRate : -changeRate, // 兼容前端字段
        volume: Mock.mock('@integer(100000, 10000000)'),
        high: Mock.mock(`@float(${price}, ${price * 1.03}, 2, 2)`),
        low: Mock.mock(`@float(${price * 0.97}, ${price}, 2, 2)`),
        open: Mock.mock(`@float(${price * 0.98}, ${price * 1.02}, 2, 2)`),
        industry: '@cword(2,4)',
        concept: '@cword(2,4)'
      },
      // 修复后：按周期分组，补全所有K线字段
      kline: {
        // 日线：30天数据（默认显示）
        day: Mock.mock({
          [`array|30`]: [
            {
              'date': '@date("yyyy-MM-dd")',       // 日期
              'open|100-2000.2': 1,                // 开盘价
              'close|100-2000.2': 1,               // 收盘价
              'high|100-2000.2': 1,                // 最高价
              'low|100-2000.2': 1,                 // 最低价
              'volume|100000-10000000': 1          // 成交量
            }
          ]
        }).array,
        // 周线：12周数据（约3个月）
        week: Mock.mock({
          [`array|12`]: [
            {
              'date': '@date("yyyy-MM-dd")',
              'open|100-2000.2': 1,
              'close|100-2000.2': 1,
              'high|100-2000.2': 1,
              'low|100-2000.2': 1,
              'volume|100000-10000000': 1
            }
          ]
        }).array,
        // 月线：6月数据（约半年）
        month: Mock.mock({
          [`array|6`]: [
            {
              'date': '@date("yyyy-MM-dd")',
              'open|100-2000.2': 1,
              'close|100-2000.2': 1,
              'high|100-2000.2': 1,
              'low|100-2000.2': 1,
              'volume|100000-10000000': 1
            }
          ]
        }).array
      },
      // predict字段无需修改，保持原逻辑
      predict: {
        trend: Math.random() > 0.5 ? 'up' : 'down',
        probability: Mock.mock('@integer(60, 95)'),
        accuracy_rate: Mock.mock('@integer(70, 90)'),
        target_price: Mock.mock(`@float(${price * 1.05}, ${price * 1.1}, 2, 2)`),
        support_price: Mock.mock(`@float(${price * 0.95}, ${price}, 2, 2)`),
        pressure_price: Mock.mock(`@float(${price * 1.05}, ${price * 1.1}, 2, 2)`),
      }
    }
  }
})

// 新增：模拟大盘指数接口（匹配quote.js中的loadMarketIndex）
Mock.mock(/\/quote\/marketIndex/, 'get', () => {
  return {
    code: 200,
    msg: 'success',
    data: {
      sh: 3250.15,
      sz: 10500.28,
      cy: 2180.56,
      bj: 980.33
    }
  }
})

// 新增：模拟批量获取自选股行情（匹配 /quote/batch）
Mock.mock(/\/quote\/batch/, 'get', (options) => {
  const urlParamStr = options.url.split('?')[1] || ''
  const params = urlParamStr.split('&').reduce((obj, item) => {
    if (!item) return obj
    const [key, value] = item.split('=')
    obj[decodeURIComponent(key)] = decodeURIComponent(value)
    return obj
  }, {})
  const codes = params.codes ? params.codes.split(',') : [] // 解析逗号分隔的代码

  // 生成对应代码的行情数据
  const list = codes.map(code => {
    const price = Mock.mock('@float(100, 2000, 2, 2)')
    const change = Mock.mock('@float(1, 50, 2, 2)')
    return {
      code,
      name: '@cword(2,4)',
      price,
      change: Math.random() > 0.5 ? change : -change,
      change_rate: Math.random() > 0.5 ? (change/price*100).toFixed(2) : -(change/price*100).toFixed(2)
    }
  })

  return {
    code: 200,
    msg: 'success',
    data: { list }
  }
})