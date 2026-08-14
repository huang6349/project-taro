import { getStorageSync } from '@tarojs/taro';
import { setStorageSync } from '@tarojs/taro';
import { RF_NAME } from '@/constants';

// 刷新版本标记工具：供 useLoadRefresh / useShowRefresh 使用，
// 业务代码在数据变更后写入标记，hooks 检测到标记变化时自动触发页面刷新
const refresh = {
  // 获取刷新版本标记（未设置或为空时返回 null）
  get: (): string | null => (
    getStorageSync(RF_NAME) || null
  ),
  // 设置刷新版本标记
  set: (rf: string | null) => (
    setStorageSync(RF_NAME, rf)
  ),
};

export default refresh;
