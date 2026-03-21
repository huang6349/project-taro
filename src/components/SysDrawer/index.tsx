import type { PanelState } from './types';
import type { SysDrawerProps } from './types';
import { useCallback } from 'react';
import { useEffect } from 'react';
import { useMemo } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { View } from '@tarojs/components';
import { getSystemInfoSync } from '@tarojs/taro';
import './index.scss';

/**
 * 底部抽屉组件
 * 支持上下拖拽切换三种状态：展开、中间、收起
 */
const SysDrawer = (
  props: SysDrawerProps,
) => {
  const {
    middle,
    bottom,
    handle,
    initialState,
    onStateChange,
    onDragStart,
    onDragEnd,
    children,
  } = props;

  /** 触摸起始 Y 坐标 */
  const startYRef = useRef(0);
  /** 触摸起始高度 */
  const startHeightRef = useRef(0);
  const [visibleHeight, setVisibleHeight] = useState(bottom);
  const [isDragging, setIsDragging] = useState(false);

  /** 屏幕高度 */
  const windowHeight = useMemo(() => (
    getSystemInfoSync()?.windowHeight
  ), []);

  /** 中间态高度，默认半屏 */
  const middleHeight = useMemo(() => (
    middle ?? windowHeight * 0.5
  ), [middle, windowHeight]);

  // 初始化高度
  useEffect(() => {
    const getInitialHeight = () => {
      switch (initialState) {
        case 'top':
          return windowHeight;
        case 'middle':
          return middleHeight;
        case 'bottom':
        default:
          return bottom;
      }
    };
    setVisibleHeight(getInitialHeight());
  }, [initialState, middleHeight, bottom, windowHeight]);

  /** 触摸开始 */
  const handleTouchStart = useCallback((e: any) => {
    startYRef.current = e.touches[0].clientY;
    startHeightRef.current = visibleHeight;
    setIsDragging(true);
    onDragStart?.();
  }, [visibleHeight, onDragStart]);

  /** 触摸移动 */
  const handleTouchMove = useCallback((e: any) => {
    if (!isDragging) return;
    const deltaY = startYRef.current - e.touches[0].clientY;
    const newHeight = Math.max(bottom, Math.min(windowHeight, startHeightRef.current + deltaY));
    setVisibleHeight(newHeight);
  }, [isDragging, bottom, windowHeight]);

  /** 触摸结束，计算吸附状态 */
  const handleTouchEnd = useCallback(() => {
    const currentHeight = visibleHeight;
    const toBottomThreshold = bottom + (middleHeight - bottom) / 2;
    const toTopThreshold = middleHeight + (windowHeight - middleHeight) / 2;

    // 计算吸附目标
    let snapState: PanelState;
    if (currentHeight < toBottomThreshold) {
      snapState = 'bottom';
    } else if (currentHeight < toTopThreshold) {
      snapState = 'middle';
    } else {
      snapState = 'top';
    }

    // 高度映射表
    const heightMap: Record<PanelState, number> = {
      top: windowHeight,
      middle: middleHeight,
      bottom,
    };

    // 更新高度并触发回调
    setVisibleHeight(heightMap[snapState]);
    onStateChange?.(snapState);
    onDragEnd?.(snapState);
    setIsDragging(false);
  }, [visibleHeight, bottom, middleHeight, windowHeight, onStateChange, onDragEnd]);

  return (<View
    // 拖拽时禁用过渡动画
    className={clsx('sys-drawer', { 'sys-drawer--dragging': isDragging })}
    style={{ height: `${visibleHeight}px` }}
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}>
    <View className="sys-drawer__handle">
      {/* 自定义把手或默认把手 */}
      {handle || <View className="sys-drawer__handle-bar" />}
    </View>
    <View className="sys-drawer__content">
      {/* 抽屉内容 */}
      {children}
    </View>
  </View>);
};

// 默认值
SysDrawer.defaultProps = {
  initialState: 'bottom',
};

export default SysDrawer;
