// src/mock/index.js
import Mock from 'mockjs'

// 1. 全局配置：模拟网络延迟（可选，但建议加，模拟真实请求）
Mock.setup({
  timeout: '200-600' // 随机延迟200-600ms，避免请求太快导致的交互问题
})

// 2. 引入行情模块的Mock规则（关键！不引入则quote.js的规则不生效）
import './quote'

// 3. 控制台打印，确认Mock已启动（方便调试）
console.log('✅ Mock服务已启动，已注册行情相关接口规则')

export default Mock