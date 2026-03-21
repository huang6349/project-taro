import type { PanelState } from './types';
import type { SysDrawerProps } from './types';
import { useCallback } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import { MovableArea } from '@tarojs/components';
import { MovableView } from '@tarojs/components';
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
    onDragEnd,
    children,
  } = props;

  /** 屏幕高度 */
  const windowHeight = useRef(
    getSystemInfoSync()?.windowHeight,
  ).current;

  /** 抽屉当前显示高度 */
  const [visibleHeight, setVisibleHeight] = useState(() => {
    switch (initialState) {
      case 'top':
        return windowHeight;
      case 'middle':
        return middle ?? windowHeight * 0.5;
      case 'bottom':
      default:
        return bottom;
    }
  });

  /** 记录上一次拖拽的 y 坐标，用于计算拖拽距离 */
  const lastYRef = useRef(windowHeight - visibleHeight);

  /** 拖拽过程中更新 lastYRef */
  const handleChange = useCallback((e: any) => {
    // y 值限制：不能小于 windowHeight - bottom（对应高度不小于 bottom）
    const minY = windowHeight - bottom;
    lastYRef.current = Math.min(e.detail.y, minY);
  }, [bottom, windowHeight]);

  /** 拖拽结束后根据高度判断最终状态并通知外部 */
  const handleChangeEnd = useCallback(() => {
    const finalHeight = windowHeight - lastYRef.current;
    setVisibleHeight(finalHeight);

    // 根据高度判断最终状态（误差 10px）
    let state: PanelState = 'bottom';
    if (finalHeight >= windowHeight - 10) {
      state = 'top';
    } else if (finalHeight > bottom + 10) {
      state = 'middle';
    }
    onDragEnd?.(state);
  }, [bottom, onDragEnd, windowHeight]);

  return (<MovableArea
    className="sys-drawer-area"
    style={{ height: `calc(100vh - ${bottom}px)` }}>
    <MovableView
      className="sys-drawer"
      y={windowHeight - visibleHeight}
      direction="vertical"
      inertia={!1}
      outOfBounds={!1}
      onChange={handleChange}
      onChangeEnd={handleChangeEnd}>
      <View className="sys-drawer-panel">
        <View className="sys-drawer__handle">
          {/* 自定义把手或默认把手 */}
          {handle || <View className="sys-drawer__handle-bar" />}
        </View>
        <View className="sys-drawer__content">
          {/* 抽屉内容 */}
          {children}
        </View>
      </View>
    </MovableView>
  </MovableArea>);
};

SysDrawer.defaultProps = {
  initialState: 'bottom',
};

export default SysDrawer;
