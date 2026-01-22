import { createAlova } from 'alova';
import { axiosRequestAdapter } from '@alova/adapter-axios';
import ReactHook from 'alova/react';
import { showToast } from '@tarojs/taro';
import { token } from '@/utils';
import { delay } from '@/utils';
import { eq } from 'lodash-es';

const {
  TARO_APP_BASE_URL,
} = process.env;

// 基于 alova 的请求封装：自动注入 Token、刷新 Token、401 跳转、业务错误处理
const safeRequest = createAlova({
  requestAdapter: axiosRequestAdapter(),
  statesHook: ReactHook,
  shareRequest: !1,
  cacheFor: null,
  baseURL: TARO_APP_BASE_URL,
  timeout: 15 * 1000,
  async beforeRequest(method) {
    // 请求前添加 Token
    method.config.headers['satoken'] = await token.get();
  },
  responded: {
    // HTTP 成功响应（状态码 2xx），但需处理业务逻辑
    async onSuccess(response) {
      try {
        const {
          header,
          data: res,
        } = response as any;
        await delay(350);
        // 响应头返回新 satoken 时自动续期
        const satoken = header?.satoken;
        satoken && token.set(satoken);
        // 401 说明登录失效，清除凭证并跳转登录页
        eq(res?.code, 401) && token.remove();
        // 业务响应失败时抛出错误
        eq(res?.success, !1) && errorThrower(res);
        return res;
      } catch (error) {
        const {
          data: res,
        } = response as any;
        await errorHandler(error);
        return res;
      }
    },
    // HTTP 请求失败（网络错误、超时等）
    async onError() {
      await showToast({
        title: '请求没有得到响应，请检查网络设置',
        duration: 2000,
        icon: 'none',
      });
    },
  },
});

// 业务错误展示类型：决定错误如何呈现给用户
enum ErrorShowType {
  SILENT = 0,        // 静默
  WARN_MESSAGE = 1,  // 警告
  ERROR_MESSAGE = 2, // 错误
  NOTIFICATION = 3,  // 通知
  REDIRECT = 9,      // 重定向
}

// 处理业务错误（BizError）和网络错误
const errorHandler = async (error: any) => {
  if (eq(error.name, 'BizError')) {
    if (error.info) {
      const {
        errorMessage,
        showType,
      } = error.info;
      switch (showType) {
        case ErrorShowType.SILENT:
          break;
        case ErrorShowType.WARN_MESSAGE:
          await showToast({
            title: errorMessage,
            duration: 2000,
            icon: 'none',
          });
          break;
        case ErrorShowType.ERROR_MESSAGE:
          await showToast({
            title: errorMessage,
            duration: 2000,
            icon: 'none',
          });
          break;
        case ErrorShowType.REDIRECT:
          break;
        case ErrorShowType.NOTIFICATION:
          await showToast({
            title: errorMessage,
            duration: 2000,
            icon: 'none',
          });
          break;
        default:
          await showToast({
            title: errorMessage,
            duration: 2000,
            icon: 'none',
          });
      }
    }
  } else {
    await showToast({
      title: '请求没有得到响应，请检查网络设置',
      duration: 2000,
      icon: 'none',
    });
  }
};

// 构造业务错误并抛出，由 errorHandler 统一处理
const errorThrower = (res: any) => {
  const {
    success,
    data,
    message: errorMessage,
    code: errorCode,
    showType,
  } = res;
  if (eq(success, !0)) return;
  const error: any = new Error(errorMessage);
  error.name = 'BizError';
  error.info = {
    data,
    errorMessage,
    errorCode,
    showType,
  };
  throw error;
};

export default safeRequest;
