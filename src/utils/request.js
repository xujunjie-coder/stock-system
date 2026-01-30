import axios from 'axios';
import { Message } from 'element-ui';
import { ERR_CODE_MAP } from '@/api/config';

// 创建axios实例（使用环境变量基础路径）
const service = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 3000 // 行情类接口3秒超时（AI/交易类后续可扩展）
});

// 请求拦截器：统一添加消息类型头（匹配原型消息格式）
service.interceptors.request.use(
  config => {
    // 若配置了消息类型，添加到请求头
    if (config.headers['X-Msg-Type']) {
      config.headers['X-Msg-Type'] = config.headers['X-Msg-Type'];
    }
    return config;
  },
  error => {
    Message.error('请求失败，请检查网络');
    return Promise.reject(error);
  }
);

// 响应拦截器：统一处理错误码和Mock数据格式
service.interceptors.response.use(
  response => {
    const res = response.data;
    // Mock数据统一返回格式：{ code: 200, msg: '成功', data: {} }
    if (res.code !== 200) {
      // 匹配业务错误码提示
      const errMsg = ERR_CODE_MAP[res.code] || res.msg || '请求出错';
      Message.error(errMsg);
      return Promise.reject(res);
    }
    return res.data; // 直接返回data字段，简化组件调用
  },
  error => {
    // 区分404（接口不存在）和超时
    if (error.response && error.response.status === 404) {
      Message.error('接口不存在，请检查配置');
    } else {
      Message.error('响应超时，请稍后重试');
    }
    return Promise.reject(error);
  }
);

export default service;