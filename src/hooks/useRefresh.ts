import { PanelActiveContext } from '@/components/SysTabs/context';
import { useContext } from 'react';
import { useCallback } from 'react';
import { useEffect } from 'react';
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

/** useRefresh 选项 */
export type UseRefreshOptions = {
  /** 页面显示时静默刷新（默认 true；false 时仅 rf 变化才刷新） */
  refreshOnShow?: boolean;
};

/**
 * 统一刷新 Hook：自动感知调用场景
 * - SysTabs 面板内容中调用（经 PanelActiveContext 感知）：面板激活（懒挂载首屏 + 每次切回）时自动下拉动画刷新
 * - 页面中调用：首次进入下拉动画刷新，后台返回时静默刷新（refreshOnShow=false 时仅 rf 变化才刷新）
 * - 刷新版本标记（rf，见 utils/refresh）变化时：重新拉起下拉动画刷新
 *
 * @param callback 刷新回调：执行数据加载/更新逻辑；抛错时由业务侧自行提示
 * @param options 选项配置
 * @param options.refreshOnShow 页面显示时是否静默刷新（默认 true；false 时仅 rf 变化才刷新）
 */
const useRefresh = (
  callback: () => void | Promise<void>,
  options?: UseRefreshOptions,
) => {
  const {
    refreshOnShow = !0,
  } = options ?? {};

  // 面板激活状态：SysTabs 注入（null = 非面板场景，走页面级行为）
  const panelActive = useContext(PanelActiveContext);
  // 面板场景标记：跳过页面级自动触发（挂载下拉、显示检测），改由面板激活状态驱动
  const manual = panelActive !== null;

  // 1. 参数校验：非法回调给出警告，避免静默失败
  if (!isFunction(callback)) {
    print(`useRefresh expected parameter is a function, got ${typeof callback}`);
  }

  // 2. 内部状态（useGetSet 的 getter/setter 引用稳定，闭包安全）
  // 已刷新标记：true 表示完成过首次刷新，此后页面显示时静默刷新
  const [getFlag, setFlag] = useGetSet<boolean>(!1);
  // 本地记录的 rf
  const [getRf, setRf] = useGetSet<string | null>(null);
  // 刷新进行中标记：防止静默刷新、didShow 触发与用户手势下拉并发双刷
  const [getPending, setPending] = useGetSet<boolean>(!1);
  // 始终持有最新 callback，避免闭包捕获过期引用
  const fnRef = useLatest(callback);

  // 3. 检测 + 触发刷新（动画路径 / 静默路径）：
  //    动画路径：rf 变化或面板激活 → 拉起下拉动画，由第 4 步下拉回调执行刷新
  //    静默路径：页面场景已刷新过且允许显示刷新 → 直接执行 callback（后台返回不打断浏览）
  const fn = useCallback(async () => {
    const rf = refresh.get();
    const rfChanged = !safeEq(rf, getRf());
    if (rfChanged || manual) {
      try {
        await startPullDownRefresh();
      } catch {
        // 跨端兼容：不支持下拉刷新的环境（如 H5）忽略失败
      }
      setFlag(!1);
    }
    setRf(rf);
    if (!manual && safeEq(getFlag(), !0) && refreshOnShow) {
      // 静默刷新：与下拉回调互斥，避免并发执行 callback
      if (getPending())
        return;
      setPending(!0);
      try {
        await fnRef.current();
      } finally {
        setPending(!1);
      }
    }
    setFlag(!0);
  }, []);

  // 4. 下拉刷新回调：动画路径的实际刷新执行点（用户手势下拉与 startPullDownRefresh 编程触发均走此处）；
  //    callback 抛错时由业务侧自行提示，此处 try/finally 保证动画必然收起、状态必然恢复
  usePullDownRefresh(async () => {
    // 面板场景：非激活面板忽略下拉回调（多面板各自注册，防止错刷非当前面板）
    if (manual && !panelActive)
      return;
    // 互斥：刷新进行中（含动画展示期）忽略重复触发
    if (getPending())
      return;
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

  // 5. 面板场景：激活时触发刷新（懒挂载首屏 + 每次切回）；Promise 已捕获，错误由业务侧提示
  useEffect(() => {
    if (panelActive) {
      fn().catch(() => {
      });
    } else return;
  }, [panelActive]);

  // 6. 页面场景：页面每次显示时检测刷新（后台返回静默 / rf 变化动画）
  useDidShow(() => {
    if (!manual) {
      fn().catch(() => {
      });
    } else return;
  });

  // 7. 页面场景：首次挂载自动下拉刷新，完成首屏加载；面板场景跳过
  useMount(async () => {
    if (manual) {
      return;
    } else try {
      await startPullDownRefresh();
    } catch {
      // 跨端兼容：不支持下拉刷新的环境（如 H5）忽略失败
    }
  });
};

export default useRefresh;
