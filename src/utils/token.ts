import { removeStorageSync } from '@tarojs/taro';
import { getStorageSync } from '@tarojs/taro';
import { setStorageSync } from '@tarojs/taro';
import {
  TOKEN_NAME,
} from '@/constants';

// Token 管理工具
const token = {
  // 移除 Token
  remove: () => (
    removeStorageSync(TOKEN_NAME)
  ),
  // 获取 Token
  get: () => (
    getStorageSync(TOKEN_NAME)
  ),
  // 设置 Token
  set: (token: string) => (
    setStorageSync(TOKEN_NAME, token)
  ),
};

export default token;
