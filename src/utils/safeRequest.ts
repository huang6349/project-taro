import { createAlova } from 'alova';
import AdapterTaro from '@alova/adapter-taro';
import { showToast } from '@tarojs/taro';
import { token } from '@/utils';
import { delay } from '@/utils';
import { eq } from 'lodash-es';

// 安全请求实例，自动处理 Token 和错误
const safeRequest = createAlova({
  ...AdapterTaro(),
  shareRequest: !1,
  cacheFor: null,
  baseURL: process.env.TARO_APP_BASE_URL,
  timeout: 15 * 1000,
  async beforeRequest(method) {
    // 请求前添加 Token
    method.config.headers['satoken'] = await token.get();
  },
  responded: {
    // 请求成功
    async onSuccess(response) {
      try {
        const {
          header,
          data: res,
        } = response as any;
        await delay(350);
        // 响应头新的 satoken 存入本地
        const satoken = header?.satoken;
        satoken && token.set(satoken);
        // 401 清除 Token
        const is = eq(res?.code, 401);
        is && token.remove();
        // 业务失败抛出错误
        if (eq(res?.success, !1))
          errorThrower(res);
        return res;
      } catch (error) {
        const {
          data: res,
        } = response as any;
        await errorHandler(error);
        return res;
      }
    },
    // 请求错误
    async onError() {
      await showToast({
        title: '请求没有得到响应，请检查网络设置',
        duration: 2000,
        icon: 'none',
      });
    },
  },
});

// 错误展示类型
enum ErrorShowType {
  SILENT = 0,        // 静默
  WARN_MESSAGE = 1,  // 警告
  ERROR_MESSAGE = 2, // 错误
  NOTIFICATION = 3,  // 通知
  REDIRECT = 9,      // 重定向
}

// 错误处理函数
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

// 业务错误抛出函数
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
