import type { PanelState } from './types';
import type { SysDrawerProps } from './types';
import { useCallback } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import { useGetSet } from 'react-use';
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

  /** MovableView 的 y 坐标，实时响应拖拽变化 */
  const [getMovableY, setMovableY] = useGetSet(windowHeight - visibleHeight);

  /** 拖拽过程中更新 movableY */
  const handleChange = useCallback((e: any) => {
    // y 值限制：不能小于 windowHeight - bottom（对应高度不小于 bottom）
    const minY = windowHeight - bottom;
    setMovableY(Math.min(e.detail.y, minY));
  }, [bottom, windowHeight]);

  /** 拖拽结束后根据高度判断最终状态并通知外部 */
  const handleChangeEnd = useCallback(() => {
    const movableY = getMovableY();
    const finalHeight = windowHeight - movableY;
    setVisibleHeight(finalHeight);
    // 重置 movableY 初始值，与 visibleHeight 同步
    setMovableY(windowHeight - finalHeight);

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
      direction="all"
      inertia={!1}
      outOfBounds={!1}
      y={getMovableY()}
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
