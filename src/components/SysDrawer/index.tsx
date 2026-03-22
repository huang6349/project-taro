import type { PanelState } from './types';
import type { SysDrawerProps } from './types';
import { useCallback } from 'react';
import { useRef } from 'react';
import { useMemo } from 'react';
import { useState } from 'react';
import { View } from '@tarojs/components';
import { getSystemInfoSync } from '@tarojs/taro';
import { clsx } from 'clsx';
import './index.scss';

/** 吸附动画时长 */
const ANIMATION_DURATION = 200;

/** 最小拖拽距离（防止点击误触） */
const MIN_DRAG_DISTANCE = 10;

const SysDrawer = (
  props: SysDrawerProps,
) => {
  const {
    middle,
    bottom,
    handle,
    initialState = 'bottom',
    onDragStart,
    onDragEnd,
    onStateChange,
    children,
  } = props;

  /** 屏幕高度 */
  const windowHeight = useRef(
    getSystemInfoSync()?.windowHeight ?? 667,
  ).current;

  /**
   * 缓存计算值
   * - pos: 三种状态对应的 top 值
   * - bounds: top/bottom 边界
   * - mid: 中间分界点
   */
  const {
    pos,
    bounds,
    mid,
  } = useMemo(() => {
    const bottomTop = windowHeight - bottom;
    return {
      pos: { top: 0, middle: windowHeight - (middle ?? windowHeight * 0.5), bottom: bottomTop },
      bounds: { top: 0, bottom: bottomTop },
      mid: bottomTop / 2,
    };
  }, [windowHeight, middle, bottom]);

  /** 面板 top 值（触发渲染） */
  const [top, setTop] = useState(() => (
    pos[initialState]
  ));

  /** 是否拖拽中（控制 transition） */
  const [dragging, setDragging] = useState(!1);

  /** top 实时值（用于计算，不触发渲染） */
  const topRef = useRef(top);

  /** 抽屉 DOM ref（直接操作样式） */
  const drawerRef = useRef<any>(null);

  /** 是否拖拽中（事件处理中读取） */
  const draggingRef = useRef(!1);

  /** 拖拽开始的触摸 Y */
  const startYRef = useRef(0);

  /** 拖拽开始的 top 值 */
  const startTopRef = useRef(0);

  /**
   * 吸附到目标位置
   * @param target - 目标 top 值
   * @param cb - 动画结束回调
   */
  const snap = useCallback((target: number, cb?: () => void) => {
    setTop(target);
    topRef.current = target;
    cb && setTimeout(cb, ANIMATION_DURATION + 10);
  }, []);

  /** 拖拽开始：记录起始位置和触摸点 */
  const handleTouchStart = useCallback((e: any) => {
    const t = e.touches?.[0];
    if (!t) return;
    setDragging(!0);
    draggingRef.current = !0;
    startYRef.current = t.clientY;
    startTopRef.current = topRef.current;
    onDragStart?.();
  }, [onDragStart]);

  /**
   * 拖拽中：直接操作 DOM 避免 re-render
   * - 计算新的 top 值
   * - 应用边界限制
   * - 直接设置元素样式
   */
  const handleTouchMove = useCallback((e: any) => {
    if (!draggingRef.current) return;
    const t = e.touches?.[0];
    if (!t) return;
    e.preventDefault?.();

    const delta = t.clientY - startYRef.current;
    let newTop = startTopRef.current + delta;

    // 边界限制：确保 top 在 [bounds.top, bounds.bottom] 范围内
    newTop = Math.max(bounds.top, Math.min(bounds.bottom, newTop));

    drawerRef.current && (drawerRef.current.style.top = `${newTop}px`);
    topRef.current = newTop;
  }, [bounds]);

  /**
   * 拖拽结束：根据方向和位置判断目标状态
   * - 上滑：位置在 mid 以上 -> top，以下 -> middle
   * - 下滑：位置在 mid 以下 -> bottom，以上 -> middle
   */
  const handleTouchEnd = useCallback(() => {
    if (!draggingRef.current) return;
    setDragging(!1);
    draggingRef.current = !1;

    // 移动距离过小视为点击
    if (Math.abs(topRef.current - startTopRef.current) < MIN_DRAG_DISTANCE) return;

    // 判断方向
    const dir = topRef.current < startTopRef.current ? 'up' : 'down';

    // 判断目标状态
    let state: PanelState;
    if (dir === 'up' && topRef.current < mid) {
      state = 'top';
    } else if (dir === 'down' && topRef.current > mid) {
      state = 'bottom';
    } else {
      state = 'middle';
    }

    snap(pos[state], () => {
      onDragEnd?.(state);
      onStateChange?.(state);
    });
  }, [snap, onDragEnd, onStateChange, pos, mid]);

  return (<View
    className="sys-drawer-container"
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
    catchMove={!0}>
    <View
      ref={drawerRef}
      className={clsx('sys-drawer')}
      style={{
        transition: dragging ? 'none' : `top ${ANIMATION_DURATION}ms ease-out`,
        top: `${top}px`,
      }}>
      <View className="sys-drawer-panel">
        <View className="sys-drawer__handle">
          {handle || <View className="sys-drawer__handle-bar" />}
        </View>
        <View className="sys-drawer__content">
          {children}
        </View>
      </View>
    </View>
  </View>);
};

SysDrawer.defaultProps = {
  initialState: 'bottom',
};

export default SysDrawer;
