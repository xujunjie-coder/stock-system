export default {
  // 获取当前主题
  theme: state => state.user.systemSetting.theme,
  // 获取自选股代码列表
  selfSelectCodes: state => state.user.selfSelectStocks.map(item => item.code),
  // 获取当前行情筛选条件
  currentFilter: state => state.quote.filterParams,
  // 获取AI选股结果数量
  selectResultCount: state => state.ai.selectResult.length,
  // 获取持仓总收益
  totalPositionProfit: state => {
    return state.trade.positionList.reduce((total, item) => total + item.profit, 0)
  }
}