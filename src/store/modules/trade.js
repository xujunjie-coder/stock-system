export default {
  namespaced: true,
  state: {
    positionList: [], // 持仓列表（{ code, name, price, count, profit, profitRate }）
    orderList: [], // 委托单列表（{ id, code, name, type, price, count, status, time }）
    tradeRecord: [], // 交易记录
    currentTrade: { // 当前交易信息
      code: '',
      name: '',
      type: 'buy', // 买卖类型（buy/sell）
      price: 0,
      count: 0
    },
    reviewData: { // 复盘数据
      dateRange: [],
      totalProfit: 0,
      profitDetail: []
    }
  }
}