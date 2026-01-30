export default {
  namespaced: true,
  state: {
    selectStrategy: '', // 选中的选股策略
    selectResult: [], // AI选股结果列表
    predictionData: { // AI预测数据
      code: '',
      predictPrice: 0,
      predictTrend: '', // 上涨/下跌/震荡
      confidence: 0, // 置信度
      reportUrl: ''
    },
    backtestResult: { // 回测结果
      profitRate: 0, // 收益率
      winRate: 0, // 胜率
      maxDrawdown: 0, // 最大回撤
      tradeCount: 0 // 交易次数
    }
  }
}