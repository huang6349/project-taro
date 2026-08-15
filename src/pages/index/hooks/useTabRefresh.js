import { useSnapshot } from 'valtio';
import { useRefresh } from '@/hooks';
import state from '../store';

/**
 * 构建当前 Tab 的刷新 Hook（基于 useRefresh 合并版）
 * - active：懒挂载首屏下拉 + 切回静默刷新 + 下拉回调守卫（非激活忽略）
 * - retapTick：点击当前 Tab（retap 派发）时下拉刷新
 *
 * 用法（返回的 Hook 须遵守 React Hooks 规则：组件顶层调用、每次渲染位置与数量稳定）：
 * const useTabRefreshHook = useTabRefresh(0); // 默认 0 = 首页
 * const useTabRefreshHook = useTabRefresh(2); // 指定 Tab
 * useTabRefreshHook(async () => { ... });
 *
 * @param index 当前界面所属 Tab 索引（默认 0；调用方需确保不超过 Tab 总数）
 * @returns (callback) => void：刷新 Hook，传入刷新回调
 */
const useTabRefresh = (index = 0) => {
  return (callback) => {
    // 1. 订阅页面 Tab 状态（selected 驱动激活，retapTick 驱动 retap 刷新）
    const {
      selected,
      retapTick,
    } = useSnapshot(state);

    // 2. 注入刷新信号：
    //    active：懒挂载首屏下拉 + 切回静默 + 下拉回调守卫（非激活忽略）
    //    retapTick：点击当前 Tab 时下拉刷新
    useRefresh(callback, {
      active: selected === index,
      retapTick,
    });
  };
};

export default useTabRefresh;
