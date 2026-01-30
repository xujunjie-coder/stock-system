<template>
  <div class="help-center-page">
    <el-card shadow="hover" style="height: 100%;">
      <div class="card-header">
        <h3>帮助中心</h3>
        <el-input
          v-model="searchKey"
          placeholder="搜索帮助内容"
          prefix-icon="el-icon-search"
          class="search-input"
          @keyup.enter.native="searchHelp"
        ></el-input>
      </div>
      
      <div class="help-content">
        <el-tabs v-model="activeTab" type="border-card">
          <el-tab-pane label="功能操作" name="operation">
            <div class="help-section">
              <h4>行情查看</h4>
              <ul class="help-list">
                <li>Q：如何切换行情市场？</li>
                <li>A：在行情首页的筛选栏中选择市场类型，支持沪深A股、创业板等市场切换。</li>
                <li>Q：如何查看个股详情？</li>
                <li>A：点击行情表格中的股票代码或名称，即可进入个股详情页，查看K线图、AI预测等信息。</li>
                <li>Q：如何筛选特定条件的股票？</li>
                <li>A：使用行情首页的高级筛选功能，可按涨跌幅、成交量、行业等条件筛选股票。</li>
                <li>Q：如何查看大盘指数成分股？</li>
                <li>A：点击页面顶部或右侧辅助栏的大盘指数（如沪深300），即可跳转至指数详情页查看成分股。</li>
              </ul>
            </div>
            
            <div class="help-section">
              <h4>AI选股</h4>
              <ul class="help-list">
                <li>Q：如何使用AI选股功能？</li>
                <li>A：进入AI选股页面，选择选股策略和筛选条件（风险等级、行业等），点击"开始选股"即可获取AI推荐股票。</li>
                <li>Q：如何查看选股策略的历史表现？</li>
                <li>A：点击"选股回测"按钮，选择历史时间段，系统会生成策略收益率、胜率等回测数据。</li>
                <li>Q：AI评分的维度有哪些？</li>
                <li>A：AI评分包含估值、成长、资金、政策四个维度，点击评分星级可查看详细拆解。</li>
                <li>Q：AI预测的历史准确率如何查看？</li>
                <li>A：个股详情页和AI预测报告中会显示模型近30天/90天的预测准确率，供参考决策。</li>
              </ul>
            </div>
            
            <div class="help-section">
              <h4>模拟交易</h4>
              <ul class="help-list">
                <li>Q：委托数量有什么限制？</li>
                <li>A：科创板股票委托数量≥200股，其他股票≥100股，均需为100股的整数倍，系统会自动校验。</li>
                <li>Q：如何撤销未成交的委托？</li>
                <li>A：在交易面板的委托单列表中，找到状态为"待成交"的委托单，点击"撤单"按钮即可。</li>
                <li>Q：如何查看交易复盘报告？</li>
                <li>A：进入交易复盘页面，选择统计时间段，系统会生成总收益、胜率、盈亏分布等复盘数据。</li>
                <li>Q：委托价格偏离市价时无法提交怎么办？</li>
                <li>A：当委托价格偏离市价±5%时，系统会弹出二次确认提示，确认后即可提交委托。</li>
              </ul>
            </div>
            
            <div class="help-section">
              <h4>自选股管理</h4>
              <ul class="help-list">
                <li>Q：如何创建自选股分组？</li>
                <li>A：在个人中心或自选股管理页面，点击"新建分组"，输入分组名称即可创建。</li>
                <li>Q：如何批量移动股票到其他分组？</li>
                <li>A：开启批量操作模式，勾选目标股票后点击"移动到分组"，选择目标分组即可完成批量移动。</li>
                <li>Q：如何设置股票价格提醒？</li>
                <li>A：在个人中心的行情提醒设置中，添加股票代码、选择提醒类型（上涨/下跌）和阈值即可。</li>
              </ul>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="AI策略说明" name="aiStrategy">
            <div class="help-section">
              <h4>低估值高成长策略</h4>
              <p>该策略筛选市盈率（PE）低于行业均值、净利润增长率连续3年超15%、ROE（净资产收益率）超12%的股票，聚焦价值与成长兼具的优质标的。</p>
              <p>适用场景：长期价值投资，风险等级：中低风险</p>
              <p>历史准确率：82%（近1年），适合风险承受能力中等的投资者。</p>
            </div>
            
            <div class="help-section">
              <h4>科技创新策略</h4>
              <p>聚焦半导体、人工智能、新能源、生物医药等高新技术行业，筛选研发投入占比超5%、营收增长率超20%的成长型企业，捕捉技术创新带来的增长机会。</p>
              <p>适用场景：中长期成长投资，风险等级：中高风险</p>
              <p>历史准确率：78%（近1年），适合风险承受能力较高的投资者。</p>
            </div>
            
            <div class="help-section">
              <h4>消费升级策略</h4>
              <p>关注食品饮料、家电、医疗健康、旅游服务等必选消费与可选消费行业，筛选ROE超15%、现金流稳定、品牌壁垒较强的龙头企业，抗周期能力突出。</p>
              <p>适用场景：稳健投资，风险等级：低风险</p>
              <p>历史准确率：85%（近1年），适合风险承受能力较低的投资者。</p>
            </div>
            
            <div class="help-section">
              <h4>周期复苏策略</h4>
              <p>布局煤炭、钢铁、化工、有色金属等周期性行业，通过行业景气度指标（如PMI、产品价格）筛选触底回升阶段的股票，捕捉周期反转带来的短期收益。</p>
              <p>适用场景：短期波段投资，风险等级：高风险</p>
              <p>历史准确率：75%（近1年），适合风险承受能力较高、能把握周期节奏的投资者。</p>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="交易规则" name="tradeRule">
            <div class="help-section">
              <h4>交易时间</h4>
              <p>模拟交易时间与A股实盘一致：</p>
              <p>集合竞价：9:15-9:25（其中9:20-9:25不可撤单）</p>
              <p>连续竞价：9:30-11:30，13:00-14:57</p>
              <p>收盘集合竞价：14:57-15:00（不可撤单）</p>
              <p>注：非交易时间提交的委托单将转为下一交易日的预埋单。</p>
            </div>
            
            <div class="help-section">
              <h4>委托规则</h4>
              <ul class="help-list">
                <li>1. 委托数量：沪A/深A股票≥100股，科创板≥200股，均需为100股的整数倍（不足100股的零股需一次性卖出）。</li>
                <li>2. 委托价格：遵循价格笼子规则，普通股票涨跌停幅度为±10%，ST股票为±5%，科创板为±20%。</li>
                <li>3. 撤单规则：未成交的委托单可在交易时间内撤单，收盘集合竞价阶段（14:57-15:00）不可撤单。</li>
                <li>4. 成交规则：遵循"价格优先、时间优先"原则，相同价格下先提交的委托先成交。</li>
              </ul>
            </div>
            
            <div class="help-section">
              <h4>费用规则</h4>
              <p>模拟交易费用按以下标准计算（仅用于模拟，不涉及真实资金）：</p>
              <ul class="help-list">
                <li>1. 佣金：成交金额的0.025%，最低5元/笔；</li>
                <li>2. 印花税：卖出时按成交金额的0.1%征收，买入时不征收；</li>
                <li>3. 过户费：沪A股票按成交金额的0.002%征收，深A股票不征收；</li>
                <li>4. 其他费用：暂不收取监管费、经手费等其他费用。</li>
              </ul>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="常见问题" name="faq">
            <div class="help-section">
              <ul class="help-list">
                <li>Q：模拟资金是否可以重置？</li>
                <li>A：目前暂不支持模拟资金重置功能，初始模拟资金为10万元，可通过交易积累收益。</li>
                <li>Q：行情数据多久刷新一次？</li>
                <li>A：默认刷新频率为3秒（PC端）/5秒（移动端），可在系统设置中调整刷新间隔（3秒-30秒）。</li>
                <li>Q：如何开启高对比度模式？</li>
                <li>A：进入个人中心的系统设置页面，在界面设置中选择"高对比度模式"即可开启，增强文字与背景对比度。</li>
                <li>Q：为什么AI预测结果会与实际行情有差异？</li>
                <li>A：AI预测基于历史数据和算法模型推导，仅为参考，实际行情受政策、资金、突发事件等多种因素影响，存在不确定性。</li>
                <li>Q：如何导出交易记录或行情数据？</li>
                <li>A：交易记录可在交易记录查询页面点击"导出数据"导出Excel文件；行情数据可在行情首页点击"导出"按钮导出。</li>
                <li>Q：系统支持哪些浏览器？</li>
                <li>A：推荐使用Chrome（≥80版本）、Edge（≥80版本）、Safari（≥14版本）或微信浏览器，低版本浏览器可能存在兼容性问题。</li>
              </ul>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="联系我们" name="contact">
            <div class="contact-content">
              <div class="contact-item">
                <el-icon name="el-icon-phone"></el-icon>
                <div class="contact-info">
                  <div class="contact-label">客服电话</div>
                  <div class="contact-value">400-123-4567（工作日9:00-18:00）</div>
                </div>
              </div>
              
              <div class="contact-item">
                <el-icon name="el-icon-message"></el-icon>
                <div class="contact-info">
                  <div class="contact-label">在线客服</div>
                  <div class="contact-value">点击页面右下角"在线客服"图标咨询</div>
                </div>
              </div>
              
              <div class="contact-item">
                <el-icon name="el-icon-email"></el-icon>
                <div class="contact-info">
                  <div class="contact-label">邮箱咨询</div>
                  <div class="contact-value">support@stock-system.com</div>
                </div>
              </div>
              
              <div class="contact-item">
                <el-icon name="el-icon-wechat"></el-icon>
                <div class="contact-info">
                  <div class="contact-label">微信公众号</div>
                  <div class="contact-value">扫码关注"同花顺行情分析助手"获取更多帮助</div>
                </div>
              </div>
              
              <div class="feedback-form" style="margin-top: 20px;">
                <h4>问题反馈</h4>
                <el-form :model="feedbackForm" :rules="feedbackRules" ref="feedbackForm">
                  <el-form-item label="问题类型" prop="type">
                    <el-select v-model="feedbackForm.type" placeholder="选择问题类型">
                      <el-option label="功能故障" value="fault"></el-option>
                      <el-option label="功能建议" value="suggest"></el-option>
                      <el-option label="数据异常" value="data"></el-option>
                      <el-option label="其他问题" value="other"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="问题描述" prop="content">
                    <el-input v-model="feedbackForm.content" type="textarea" :rows="5" placeholder="请详细描述您遇到的问题"></el-input>
                  </el-form-item>
                  <el-form-item label="联系方式" prop="contact">
                    <el-input v-model="feedbackForm.contact" placeholder="请留下您的手机号或邮箱，便于我们联系您"></el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="submitFeedback">提交反馈</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchKey: '',
      activeTab: 'operation',
      feedbackForm: {
        type: '',
        content: '',
        contact: ''
      },
      feedbackRules: {
        type: [
          { required: true, message: '请选择问题类型', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请描述您遇到的问题', trigger: 'blur' },
          { min: 10, message: '问题描述不少于10个字符', trigger: 'blur' }
        ],
        contact: [
          { required: true, message: '请留下联系方式', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 搜索帮助内容
    searchHelp() {
      if (!this.searchKey) {
        this.$message.info('请输入搜索关键词')
        return
      }
      // 简单模拟搜索功能，实际项目可对接后端搜索接口
      this.$message.success(`已为您找到包含"${this.searchKey}"的帮助内容`)
    },
    // 提交反馈
    submitFeedback() {
      this.$refs.feedbackForm.validate((valid) => {
        if (valid) {
          this.$message.success('问题反馈提交成功，我们将尽快处理并与您联系')
          this.feedbackForm = {
            type: '',
            content: '',
            contact: ''
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.help-center-page {
  height: 100%;
  padding: 10px;
  overflow-y: auto;
}
.el-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}
h3 {
  font-size: 18px;
  color: #333;
  margin: 0;
  padding-left: 8px;
  border-left: 3px solid #e53935;
}
.search-input {
  width: 300px;
}
.help-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
.el-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.el-tabs__content {
  flex: 1;
  overflow-y: auto;
}
.help-section {
  margin-bottom: 24px;
}
.help-section h4 {
  font-size: 16px;
  color: #333;
  margin: 0 0 16px 0;
  padding-left: 8px;
  border-left: 2px solid #e53935;
}
.help-list {
  margin: 0;
  padding-left: 20px;
  line-height: 2;
  color: #666;
}
.help-list li {
  margin-bottom: 8px;
}
.contact-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.contact-item {
  display: flex;
  align-items: center;
  gap: 16px;
}
.contact-item el-icon {
  font-size: 24px;
  color: #e53935;
}
.contact-label {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}
.contact-value {
  font-size: 14px;
  color: #666;
}
.feedback-form {
  padding: 16px;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
}
/* 移动端适配 */
@media screen and (max-width: 767px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .search-input {
    width: 100%;
  }
  .el-tabs__header {
    overflow-x: auto;
    white-space: nowrap;
  }
  .contact-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>