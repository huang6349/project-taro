import { useCallback } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useGetSet } from 'react-use';
import { useLatest } from 'react-use';
import { useMount } from 'react-use';
import { startPullDownRefresh } from '@tarojs/taro';
import { stopPullDownRefresh } from '@tarojs/taro';
import { useDidShow } from '@tarojs/taro';
import { getCurrentInstance } from '@tarojs/taro';
import { usePullDownRefresh } from '@tarojs/taro';
import { delay } from '@huang6349/taro-toolkit';
import { print } from '@huang6349/taro-toolkit';
import { isFunction } from 'lodash-es';
import { refresh } from '@/utils';
import { safeEq } from '@/utils';

/**
 * 页面级下拉动画锁：跨 useRefresh 实例共享（同一页面内）
 * 动画进行中重复 start 会触发真机动画重展开，旧流程 stop 落在新动画展开完成前调用而失效，
 * 导致下拉动画悬挂（一直处于刷新中）；锁保证同一时刻只有一个动画流程。
 * 按 page 实例隔离（WeakMap，页面销毁自动回收），不同页面互不影响。
 */
const animLocks = new WeakMap<object, {
  /** 动画进行中 */
  pending: boolean;
  /** 超时兜底：start 后回调异常未触发时自动释放锁，避免锁死 */
  timer: ReturnType<typeof setTimeout> | null;
}>();

const getAnimLock = (page: object) => {
  let lock = animLocks.get(page);
  if (!lock) {
    lock = { pending: !1, timer: null };
    animLocks.set(page, lock);
  }
  return lock;
};

/** 兜底锁 key：页面实例异常为空时共享（防御性，正常情况页面组件内 page 必非空） */
const FALLBACK_PAGE = {};

/** useRefresh 选项 */
export type UseRefreshOptions = {
  /** 页面显示时静默刷新（默认 true；false 时仅 rf 变化才刷新） */
  refreshOnShow?: boolean;
  /** 激活状态（懒挂载面板等场景）：false→true 切回时静默刷新；false 时忽略下拉刷新（防止多实例错刷） */
  active?: boolean;
  /** retap 信号（点击当前 Tab 派发）：变化且激活时拉起下拉刷新 */
  retapTick?: number;
};

/**
 * 统一刷新 Hook（useLoadRefresh + useShowRefresh 合并版）
 *
 * 触发时机总览（各路径互斥，每次刷新只执行一次 callback）：
 * | 时机 | 行为 |
 * |------|------|
 * | 首次挂载（懒挂载面板首次访问 / 页面首屏） | 下拉动画刷新 |
 * | 页面显示（后台返回） | rf 变化 → 下拉动画；已刷新过 → 静默刷新 |
 * | 面板切回（active false→true） | 静默刷新（不打断浏览） |
 * | retap（点击当前 Tab，retapTick 变化） | 下拉动画刷新 |
 * | 刷新版本标记（rf，见 utils/refresh）变化 | 下拉动画刷新 |
 *
 * 设计要点：
 * - 动画路径（startPullDownRefresh）与静默路径（直接执行 callback）互斥，防并发双刷
 * - 下拉动画由页面级锁互斥（真机防悬挂）：动画进行中重复触发会重展开动画，
 *   旧流程的 stop 落在新动画展开完成前调用而失效，导致动画常驻
 * - active/retapTick 为可选面板信号：由调用方从外部状态读取（如 valtio store），不依赖 Context
 *
 * @param callback 刷新回调：执行数据加载/更新逻辑；抛错时由业务侧自行提示
 * @param options 选项配置
 * @param options.refreshOnShow 页面显示时是否静默刷新（默认 true；false 时仅 rf 变化才刷新）
 * @param options.active 激活状态（默认 undefined = 纯页面场景）：false 时忽略下拉回调（多面板防错刷）；false→true 切回静默刷新
 * @param options.retapTick retap 信号（点击当前 Tab 派发）：变化且激活时下拉动画刷新
 */
const useRefresh = (
  callback: () => void | Promise<void>,
  options?: UseRefreshOptions,
) => {
  const {
    refreshOnShow = !0,
    active,
    retapTick,
  } = options ?? {};

  // 1. 参数校验：非法回调给出警告，避免静默失败
  if (!isFunction(callback)) {
    print(`useRefresh expected parameter is a function, got ${typeof callback}`);
  }

  // 2. 内部状态（useGetSet 的 getter/setter 引用稳定，闭包安全）
  // 已刷新标记：true 表示完成过首次刷新，此后静默刷新
  const [getFlag, setFlag] = useGetSet<boolean>(!1);
  // 本地记录的 rf
  const [getRf, setRf] = useGetSet<string | null>(null);
  // 刷新进行中标记：防止静默刷新、didShow 触发与用户手势下拉并发双刷
  const [getPending, setPending] = useGetSet<boolean>(!1);
  // 始终持有最新 callback 与 refreshOnShow，避免闭包捕获过期引用
  const fnRef = useLatest(callback);
  const refreshOnShowRef = useLatest(refreshOnShow);

  // 3. 页面级动画锁（同一页面内跨实例互斥）
  const animLock = getAnimLock(getCurrentInstance().page ?? FALLBACK_PAGE);

  // 4. 拉起下拉动画（带锁）：动画进行中跳过，避免真机动画重触发；start 失败（如 H5 不支持）释放锁
  const pullDown = useCallback(async () => {
    if (animLock.pending)
      return;
    animLock.pending = !0;
    // 超时兜底：回调异常未触发时自动释放锁（5s），避免锁死导致后续刷新全部被跳过
    animLock.timer = setTimeout(() => {
      animLock.pending = !1;
    }, 5000);
    try {
      await startPullDownRefresh();
    } catch {
      // 跨端兼容：不支持下拉刷新的环境（如 H5）忽略失败
      if (animLock.timer)
        clearTimeout(animLock.timer);
      animLock.pending = !1;
    }
  }, []);

  // 5. 刷新执行器：静默刷新与下拉回调共用的 callback 执行点（互斥：刷新进行中忽略重复触发）
  const run = useCallback(async () => {
    // 互斥：刷新进行中忽略重复触发
    if (getPending())
      return;
    setPending(!0);
    try {
      await fnRef.current();
    } finally {
      setPending(!1);
    }
  }, []);

  // 6. 检测 + 触发刷新（动画路径 / 静默路径）：
  //    动画路径：rf 变化 → 拉起下拉动画并重置已刷新标记（实际刷新交由第 7 步下拉回调执行）
  //    静默路径：已刷新过且允许显示刷新 → 直接执行 callback（后台返回不打断浏览）
  const fn = useCallback(async () => {
    const rf = refresh.get();
    const rfChanged = !safeEq(rf, getRf());
    if (rfChanged) {
      await pullDown();
      setFlag(!1);
    }
    setRf(rf);
    if (safeEq(getFlag(), !0) && refreshOnShowRef.current) {
      await run();
    }
    setFlag(!0);
  }, []);

  // 7. 下拉刷新回调：动画路径的刷新执行点（用户手势下拉与 startPullDownRefresh 编程触发均走此处）；
  //    仅激活面板响应（动画只由激活实例拉起，非激活忽略防止多面板错刷）；
  //    callback 抛错时由业务侧自行提示，finally 保证动画必然收起、动画锁必然释放
  usePullDownRefresh(async () => {
    // 非激活面板：忽略（不干预动画收起，由发起动画的激活实例负责）
    if (active === !1)
      return;
    // 并发兜底：刷新进行中再次触发（如手势下拉）→ 立即收起动画，防止动画悬挂
    if (getPending()) {
      stopPullDownRefresh();
      return;
    }
    try {
      await run();
      const rf = refresh.get();
      setRf(rf);
      // 完成一次下拉刷新 → 标记已刷新（此后切回/后台返回可走静默路径）
      setFlag(!0);
    } finally {
      // 延迟收起动画，保证刷新效果完整展示；动画已展开（回调已触发），stop 必然有效
      await delay(350);
      stopPullDownRefresh();
      // 释放动画锁：本次动画流程结束
      if (animLock.timer)
        clearTimeout(animLock.timer);
      animLock.pending = !1;
    }
  });

  // 8. 激活信号：false→true 切回 → 静默刷新；
  //    首次激活（懒挂载挂载时）跳过：首屏刷新由 useMount 负责，防止 flag 提前置位导致
  //    useDidShow 静默路径与下拉刷新并发双刷（首屏加载两次）
  const firstActiveRef = useRef(!0);
  useEffect(() => {
    if (!active) {
      return;
    }
    if (firstActiveRef.current) {
      firstActiveRef.current = !1;
      return;
    }
    fn().catch(() => {
    });
  }, [active]);

  // 9. retap 信号：点击当前 Tab → 下拉动画刷新（触发第 7 步回调执行刷新）
  useEffect(() => {
    if (active && retapTick !== undefined) {
      pullDown().catch(() => {
      });
    }
  }, [retapTick]);

  // 10. 页面显示事件（懒挂载架构下所有已挂载实例均收到）：检测刷新（后台返回静默 / rf 变化动画）
  useDidShow(() => {
    fn().catch(() => {
    });
  });

  // 11. 首次挂载自动下拉刷新，完成首屏加载
  //     懒挂载面板：首次访问才挂载 → 挂载即首屏；页面场景：页面首屏
  useMount(async () => {
    await pullDown();
  });
};

export default useRefresh;
