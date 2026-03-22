import type { PanelState } from './types';
import type { SysDrawerProps } from './types';
import { useCallback } from 'react';
import { useMemo } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import { View } from '@tarojs/components';
import { getSystemInfoSync } from '@tarojs/taro';
import './index.scss';

/** 触摸事件信息 */
interface TouchInfo {
  startY: number;
  currentY: number;
  deltaY: number;
}

/** 吸附动画时长 */
const ANIMATION_DURATION = 150;

/** 最小拖拽距离（防止点击误触） */
const MIN_DRAG_DISTANCE = 10;

/** 吸附阈值（位置过半时吸附到下一状态） */
const SNAP_THRESHOLD = 0.5;

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

  // 屏幕高度
  const windowHeight = useRef(
    getSystemInfoSync()?.windowHeight ?? 667,
  ).current;

  // 各状态对应的 panelTop 值
  const positions = useMemo(() => ({
    top: 0,
    middle: windowHeight - (middle ?? windowHeight * 0.5),
    bottom: windowHeight - bottom,
  }), [windowHeight, middle, bottom]);

  // 面板顶部距屏幕顶部的距离
  const [panelTop, setPanelTop] = useState(() => (
    positions[initialState]
  ));

  // 拖拽过程中实时更新的位置（ref，用于动画计算）
  const currentY = useRef(panelTop);

  // 是否正在拖拽（控制 CSS transition）
  const [isDragging, setIsDragging] = useState(!1);

  // 是否正在拖拽（ref 版本，用于事件处理中立即读取）
  const isDraggingRef = useRef(!1);

  // 触摸信息
  const touchInfo = useRef<TouchInfo>({
    startY: 0,
    currentY: 0,
    deltaY: 0,
  });

  // 拖拽开始的 Y
  const dragStartY = useRef(0);

  // 执行吸附动画
  const animateTo = useCallback((targetTop: number, callback?: () => void) => {
    setPanelTop(targetTop);
    currentY.current = targetTop;

    if (callback) {
      setTimeout(callback, ANIMATION_DURATION + 10);
    }
  }, []);

  // 拖拽开始：记录起始位置，标记拖拽状态
  const handleTouchStart = useCallback((e: any) => {
    const touch = e.touches?.[0];
    if (!touch) return;

    setIsDragging(!0);
    isDraggingRef.current = !0;
    touchInfo.current.startY = touch.clientY;
    touchInfo.current.currentY = touch.clientY;
    touchInfo.current.deltaY = 0;
    dragStartY.current = currentY.current;

    onDragStart?.();
  }, [onDragStart]);

  // 拖拽中：实时更新面板位置，处理边界限制
  const handleTouchMove = useCallback((e: any) => {
    if (!isDraggingRef.current) return;

    const touch = e.touches?.[0];
    if (!touch) return;

    e.preventDefault?.();

    const deltaY = touch.clientY - touchInfo.current.startY;
    let newTop = dragStartY.current + deltaY;

    // 边界限制：硬限制
    newTop = Math.max(positions.top, Math.min(positions.bottom, newTop));

    touchInfo.current.currentY = touch.clientY;
    touchInfo.current.deltaY = deltaY;
    setPanelTop(newTop);
    currentY.current = newTop;
  }, [positions]);

  // 拖拽结束：根据位置和方向判断目标状态，触发吸附动画
  const handleTouchEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    setIsDragging(!1);
    isDraggingRef.current = !1;

    const deltaY = touchInfo.current.deltaY;

    // 最小移动距离判断，防止点击误触发
    if (Math.abs(deltaY) < MIN_DRAG_DISTANCE) {
      return;
    }

    const direction: 'up' | 'down' = deltaY < 0 ? 'up' : 'down';

    // 根据位置和方向判断目标状态
    const threshold = (positions.top + positions.bottom) * SNAP_THRESHOLD;
    let targetState: PanelState;

    if (direction === 'up') {
      // 上滑：展开
      targetState = currentY.current < threshold ? 'top' : 'middle';
    } else {
      // 下滑：收起
      targetState = currentY.current > threshold ? 'bottom' : 'middle';
    }

    const targetTop = positions[targetState];

    animateTo(targetTop, () => {
      onDragEnd?.(targetState);
      onStateChange?.(targetState);
    });
  }, [animateTo, onDragEnd, onStateChange, positions]);

  return (<View
    className="sys-drawer-container"
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
    catchMove>
    <View
      className="sys-drawer"
      style={{
        top: `${panelTop}px`,
        transition: isDragging ? 'none' : `top ${ANIMATION_DURATION}ms ease-out`,
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
