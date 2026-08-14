import { useCallback } from 'react';
import { useGetSet } from 'react-use';
import { useLatest } from 'react-use';
import { useMount } from 'react-use';
import { startPullDownRefresh } from '@tarojs/taro';
import { stopPullDownRefresh } from '@tarojs/taro';
import { useDidShow } from '@tarojs/taro';
import { usePullDownRefresh } from '@tarojs/taro';
import { delay } from '@huang6349/taro-toolkit';
import { print } from '@huang6349/taro-toolkit';
import { isFunction } from 'lodash-es';
import { refresh } from '@/utils';
import { safeEq } from '@/utils';

// 页面显示刷新 Hook：首次进入走下拉动画，后台返回时静默刷新，
// 刷新版本标记（rf）变化时重新拉起下拉刷新
const useShowRefresh = (
  callback: () => void | Promise<void>,
) => {
  // 1. 参数校验：非法回调给出警告，避免静默失败
  if (!isFunction(callback)) {
    print(`useShowRefresh expected parameter is a function, got ${typeof callback}`);
  }

  // 2. 内部状态（useGetSet 的 getter/setter 引用稳定，闭包安全）
  // 已刷新标记：true 表示完成过首次刷新，此后后台返回时静默刷新
  const [getFlag, setFlag] = useGetSet<boolean>(!1);
  // 本地记录的 rf
  const [getRf, setRf] = useGetSet<string | null>(null);
  // 刷新进行中标记：防止静默刷新、didShow 触发与用户手势下拉并发双刷
  const [getPending, setPending] = useGetSet<boolean>(!1);
  // 始终持有最新 callback，避免闭包捕获过期引用
  const fnRef = useLatest(callback);

  // 3. 页面显示检测：
  //    rf 变化 → 重置已刷新标记并拉起下拉刷新（实际刷新由第 4 步回调执行）；
  //    已刷新过且 rf 未变 → 直接执行 callback（后台返回静默刷新）
  const fn = useCallback(async () => {
    const rf = refresh.get();
    if (!safeEq(rf, getRf())) {
      try {
        await startPullDownRefresh();
      } catch {
        // 跨端兼容：不支持下拉刷新的环境（如 H5）忽略失败
      }
      setFlag(!1);
    }
    setRf(rf);
    if (safeEq(getFlag(), !0)) {
      // 静默刷新：与下拉回调互斥，避免并发执行 callback
      if (getPending()) {
        return;
      }
      setPending(!0);
      try {
        await fnRef.current();
      } finally {
        setPending(!1);
      }
    }
    setFlag(!0);
  }, []);

  // 4. 下拉刷新回调：执行刷新逻辑并记录最新 rf
  //    callback 抛错时由业务侧自行提示，此处保证动画必然收起
  usePullDownRefresh(async () => {
    // 互斥：刷新进行中（含动画展示期）忽略重复触发
    if (getPending()) {
      return;
    }
    setPending(!0);
    try {
      await fnRef.current();
      const rf = refresh.get();
      setRf(rf);
    } finally {
      // 延迟收起动画，保证刷新效果完整展示
      await delay(350);
      stopPullDownRefresh();
      setPending(!1);
    }
  });

  // 5. 页面每次显示时触发检测
  useDidShow(fn);

  // 6. 首次挂载启动下拉刷新（触发第 4 步回调完成首屏加载）
  useMount(async () => {
    try {
      await startPullDownRefresh();
    } catch {
      // 跨端兼容：不支持下拉刷新的环境（如 H5）忽略失败
    }
  });
};

export default useShowRefresh;
