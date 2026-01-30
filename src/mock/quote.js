import Mock from 'mockjs'

// 大盘指数数据
Mock.mock(/\/api\/quote\/marketIndex/, 'get', () => {
  return {
    code: 200,
    msg: 'success',
    data: [
      { code: '000300', name: '沪深300', change: 0.85 },
      { code: '000001', name: '上证指数', change: 0.32 },
      { code: '399001', name: '深证成指', change: 1.25 },
      { code: '399006', name: '创业板指', change: 1.89 }
    ]
  }
})

// 热门概念数据
Mock.mock(/\/api\/quote\/hotConcepts/, 'get', () => {
  return {
    code: 200,
    msg: 'success',
    data: [
      { name: '人工智能', stockCount: 56 },
      { name: '新能源汽车', stockCount: 42 },
      { name: '消费复苏', stockCount: 38 },
      { name: '半导体', stockCount: 31 }
    ]
  }
})

// 行情列表数据（核心修复：解析所有参数 + 兼容筛选）
Mock.mock(/\/api\/quote\/getQuoteList/, 'get', (options) => {
  console.log('Mock拦截到请求：', options); 
  // 解析所有参数（含筛选参数 changeRate/volume）
  const urlParams = new URLSearchParams(options.url.split('?')[1] || '');
  const market = urlParams.get('market') || 'cnA';
  const page = parseInt(urlParams.get('page')) || 1;
  const size = parseInt(urlParams.get('size')) || 20;
  const changeRate = urlParams.get('changeRate') || '';
  const volume = urlParams.get('volume') || '';

  // 基础数据总数
  const total = market === 'cnA' ? 200 : 80;
  // 生成基础数据
  let list = Mock.mock({
    [`array|${total}`]: [
      {
        'code|6': /[0-9]/,
        'name': '@ctitle(2,4)',
        'price|10-1000.2': 1,
        'change| -5~5.2': 1,
        'change_rate| -5~5.2': 1,
        'volume|100000-10000000': 1,
        'high|10-1000.2': 1,
        'low|10-1000.2': 1
      }
    ]
  }).array;

  // 兼容筛选参数（模拟筛选逻辑）
  // 1. 涨跌幅筛选
  if (changeRate) {
    const [min, max] = changeRate.split('-').map(Number);
    list = list.filter(item => {
      return item.change_rate >= min && item.change_rate <= max;
    });
  }
  // 2. 成交量筛选
  if (volume) {
    const minVolume = parseInt(volume);
    list = list.filter(item => item.volume >= minVolume);
  }

  // 处理分页（基于筛选后的数据）
  const filteredTotal = list.length;
  const start = (page - 1) * size;
  const end = start + size;
  const paginatedList = list.slice(start, end);

  // 处理涨跌幅与价格逻辑
  const finalList = paginatedList.map(item => {
    item.change = Math.round((item.price * item.change_rate / 100) * 100) / 100;
    item.high = Math.max(item.price, item.high);
    item.low = Math.min(item.price, item.low);
    return item;
  });

  return {
    code: 200,
    msg: 'success',
    data: {
      list: finalList,
      total: filteredTotal,
      page: page,
      size: size
    }
  }
})

// 个股详情数据
Mock.mock(/\/api\/quote\/getStockDetail/, 'get', (options) => {
  // 容错：避免code解析失败
  let code = '600519';
  try {
    code = options.url.match(/code=([^&]+)/)[1];
  } catch (e) {}
  
  return {
    code: 200,
    msg: 'success',
    data: {
      quote: {
        code,
        name: Mock.Random.ctitle(2, 4),
        price: Mock.Random.float(10, 1000, 2, 2),
        change: Mock.Random.float(-50, 50, 2, 2),
        change_rate: Mock.Random.float(-5, 5, 2, 2),
        volume: Mock.Random.integer(1000000, 100000000),
        high: Mock.Random.float(10, 1000, 2, 2),
        low: Mock.Random.float(10, 1000, 2, 2),
        market: code.startsWith('6') ? '沪A' : '深A'
      },
      kline: {
        day: Mock.mock({
          [`array|30`]: [
            {
              date: Mock.Random.date('yyyy-MM-dd'),
              open: Mock.Random.float(10, 1000, 2, 2),
              close: Mock.Random.float(10, 1000, 2, 2),
              high: Mock.Random.float(10, 1000, 2, 2),
              low: Mock.Random.float(10, 1000, 2, 2),
              volume: Mock.Random.integer(1000000, 100000000)
            }
          ]
        }).array
      },
      predict: {
        up_probability: Mock.Random.integer(50, 95),
        target_price: Mock.Random.float(10, 1000, 2, 2),
        accuracy_rate: Mock.Random.integer(70, 90)
      },
      related_stocks: Mock.mock({
        [`array|5`]: [
          {
            code: Mock.Random.string('number', 6),
            name: Mock.Random.ctitle(2, 4),
            relation: Mock.Random.pick(['同行业', '同概念'])
          }
        ]
      }).array
    }
  }
})

// 搜索联想数据
Mock.mock(/\/api\/search\/suggest/, 'get', (options) => {
  const urlParams = new URLSearchParams(options.url.split('?')[1] || '');
  const keyword = urlParams.get('keyword') || '';
  return {
    code: 200,
    msg: 'success',
    data: [
      {
        value: `${Mock.Random.ctitle(2, 4)}(${Mock.Random.string('number', 6)})`,
        code: Mock.Random.string('number', 6),
        name: Mock.Random.ctitle(2, 4),
        type: 'stock'
      },
      {
        value: `${Mock.Random.ctitle(2, 4)}(${Mock.Random.string('number', 6)})`,
        code: Mock.Random.string('number', 6),
        name: Mock.Random.ctitle(2, 4),
        type: 'stock'
      },
      {
        value: 'AI选股',
        path: '/ai/select',
        type: 'function'
      },
      {
        value: '模拟交易',
        path: '/trade',
        type: 'function'
      }
    ]
  }
})

// 新增K线数据Mock
Mock.mock(/\/api\/quote\/getKlineData/, 'get', (options) => {
  const urlParams = new URLSearchParams(options.url.split('?')[1] || '');
  const code = urlParams.get('code') || '600519';
  const type = urlParams.get('type') || 'day';

  let dataCount = 30 
  if (type === 'week') dataCount = 52 
  if (type === 'month') dataCount = 12 
  if (type === 'min') dataCount = 240 

  const klineData = Mock.mock({
    [`array|${dataCount}`]: [
      {
        date: type === 'min' 
          ? Mock.Random.time('HH:mm') 
          : Mock.Random.date('yyyy-MM-dd'),
        open: Mock.Random.float(10, 1000, 2, 2),
        close: Mock.Random.float(10, 1000, 2, 2),
        high: function() {
          return Math.max(this.open, this.close) + Mock.Random.float(0, 10, 2, 2)
        },
        low: function() {
          return Math.min(this.open, this.close) - Mock.Random.float(0, 10, 2, 2)
        },
        volume: Mock.Random.integer(1000000, 100000000)
      }
    ]
  }).array

  return {
    code: 200,
    msg: 'success',
    data: klineData
  }
})