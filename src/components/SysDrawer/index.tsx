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
    onDragStart,
    onDragEnd,
    children,
  } = props;

  /** 触摸起始 Y 坐标 */
  const startYRef = useRef(0);
  /** 触摸起始高度 */
  const startHeightRef = useRef(0);
  /** 触摸开始时间（用于计算速度） */
  const startTimeRef = useRef(0);
  /** Drawer DOM 引用 */
  const drawerRef = useRef<any>(null);
  /** 当前状态 */
  const [currentState, setCurrentState] = useState<PanelState>('bottom');
  const [visibleHeight, setVisibleHeight] = useState(bottom);
  /** 拖拽状态用 ref 避免重渲染，className 用 state */
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  /** 屏幕高度 */
  const windowHeight = useMemo(() => (
    getSystemInfoSync()?.windowHeight
  ), []);

  /** 中间态高度，默认半屏 */
  const middleHeight = useMemo(() => (
    middle ?? windowHeight * 0.5
  ), [middle, windowHeight]);

  // 初始化高度和状态
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
    setCurrentState(initialState ?? 'bottom');
  }, [initialState, middleHeight, bottom, windowHeight]);

  /** 触摸开始 */
  const handleTouchStart = useCallback((e: any) => {
    startYRef.current = e.touches[0].clientY;
    startHeightRef.current = visibleHeight;
    startTimeRef.current = Date.now();
    isDraggingRef.current = true;

    // 直接移除 transition，完全避免 React 重渲染
    const drawer = drawerRef.current;
    if (drawer) {
      drawer.style.transition = 'none';
    }

    onDragStart?.();
  }, [visibleHeight, onDragStart]);

  /** 触摸移动 */
  const handleTouchMove = useCallback((e: any) => {
    if (!isDraggingRef.current) return;
    const deltaY = startYRef.current - e.touches[0].clientY;
    const newHeight = Math.max(bottom, Math.min(windowHeight, startHeightRef.current + deltaY));
    // 直接操作 DOM 样式实现即时响应，避免 React state 批量更新的延迟
    const drawer = drawerRef.current;
    if (drawer) {
      drawer.style.height = `${newHeight}px`;
    }
  }, [bottom, windowHeight]);

  /** 触摸结束，保持当前位置 */
  const handleTouchEnd = useCallback(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;

    // 从DOM获取最终高度
    const domHeight = parseFloat(drawer.style.height);
    if (isNaN(domHeight)) {
      isDraggingRef.current = false;
      setIsDragging(false);
      return;
    }

    // 保持在当前位置
    setVisibleHeight(domHeight);
    isDraggingRef.current = false;
    setIsDragging(false);
    onDragEnd?.(currentState);
  }, [currentState, onDragEnd]);

  return (<View
    // 拖拽时禁用过渡动画
    className={clsx('sys-drawer', { 'sys-drawer--dragging': isDragging })}
    style={{ height: `${visibleHeight}px` }}
    ref={drawerRef}
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
    catchMove>
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
