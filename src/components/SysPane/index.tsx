import type { FC } from 'react';
import type { SysPaneProps } from './types';
import type { SysPaneRef } from './types';
import { forwardRef } from 'react';
import { memo } from 'react';
import { useCallback } from 'react';
import { useImperativeHandle } from 'react';
import { useMemo } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import { clamp } from 'lodash-es';
import { endsWith } from 'lodash-es';
import { isFunction } from 'lodash-es';
import { isNaN } from 'lodash-es';
import { isString } from 'lodash-es';
import { isUndefined } from 'lodash-es';
import { View } from '@tarojs/components';
import { getSystemInfoSync } from '@tarojs/taro';
import { clsx } from 'clsx';
import { useDrag } from './useDrag';
import './index.scss';

/** 默认吸附点配置：隐藏、50%高度、97%高度 */
const DEFAULT_DETENTS = [0, '50%', '97%'];

// ============== 组件 ==============
const SysPane: FC<SysPaneProps> = forwardRef<SysPaneRef, SysPaneProps>((
  props,
  ref,
) => {
  // 1. Props 解构
  const {
    className: cls,
    children,
    detents = DEFAULT_DETENTS,
    dimVisible = !0,
    expansionSwitchThreshold = 50,
    grabberVisible = !1,
    largestUndimmedDetentIndex = -1,
    permanent = !1,
  } = props;

  // 2. State 状态
  /** 当前吸附点索引 */
  const [currentDetentIndex, setCurrentDetentIndex] = useState(0);
  /** 面板是否展开 */
  const [opened, setOpened] = useState(permanent);

  // 3. Refs
  /** 内容滚动容器引用 */
  const scrollContainerRef = useRef<any>(null);
  /** 视口高度缓存 */
  const windowHeightRef = useRef(
    getSystemInfoSync()?.windowHeight ?? 667,
  );

  // 4. 计算属性 - parsedDetents
  /**
   * 解析吸附点配置
   * - 数值类型直接使用
   * - 百分比字符串转为像素值
   * - 过滤无效值
   */
  const parsedDetents = useMemo(() => (
    detents.map((d) => {
      if (isString(d) && endsWith(d, '%')) {
        const parsed = +d.slice(0, -1);
        return isNaN(parsed)
          ? undefined
          : Math.round((parsed / 100) * windowHeightRef.current);
      }
      return d;
    }).filter((v) => !isUndefined(v)) as number[]
  ), [detents]);

  /** 最大吸附点高度 */
  const largestDetent = parsedDetents[parsedDetents.length - 1];
  /** 是否处于最大吸附点 */
  const isLargestDetent = currentDetentIndex === parsedDetents.length - 1;
  /** 是否处于最小吸附点 */
  const isSmallestDetent = currentDetentIndex === 0;

  // 5. 内部方法
  /**
   * 更新吸附点索引
   * @param value - 新的索引值或更新函数
   */
  const updateDetentIndex = useCallback((value: number | ((prev: number) => number)) => {
    setCurrentDetentIndex((prev) => (
      isFunction(value) ? value(prev) : value
    ));
  }, []);

  /** 关闭面板 */
  const handleClose = useCallback(() => {
    setOpened(!1);
  }, []);

  /**
   * 点击遮罩层关闭面板
   * - permanent 模式下不响应
   */
  const handleDismiss = useCallback(() => {
    if (!permanent) {
      updateDetentIndex(0);
      setOpened(!1);
    }
  }, [permanent, updateDetentIndex]);

  /** 重置内容滚动位置到顶部 */
  const handleResetScroll = useCallback(() => {
    scrollContainerRef.current?.scrollTo?.({ x: 0, y: 0 });
  }, []);

  // 6. 手势拖拽
  const {
    transform,
    handleGestureStart,
    handleGestureMove,
    handleGestureEnd,
    handleGestureCancel,
  } = useDrag({
    isLargestDetent,
    isSmallestDetent,
    largestDetent,
    expansionSwitchThreshold,
    permanent,
    maxDetentIndex: parsedDetents.length - 1,
    onUpdateDetentIndex: updateDetentIndex,
    onClose: handleClose,
    onResetScroll: handleResetScroll,
  });

  // 7. 计算属性 - 依赖手势状态
  /** 当前吸附点高度 */
  const currentDetent = parsedDetents[currentDetentIndex];
  /** 最终 transform 值 */
  const resultingTransform = Math.max(transform + (opened ? -currentDetent : 0), -largestDetent);
  /** 是否显示遮罩层 */
  const showDim = dimVisible && opened && currentDetentIndex > largestUndimmedDetentIndex;
  /** 是否启用过渡动画 */
  const shouldTransition = transform === 0;

  // 8. 触摸事件处理
  /** 触摸开始：提取 Y 坐标并传递给手势处理 */
  const handleTouchStart = useCallback((e: any) => {
    const y = e.touches?.[0]?.pageY;
    if (!isUndefined(y)) handleGestureStart(y);
  }, [handleGestureStart]);

  /** 触摸移动：提取 Y 坐标并传递给手势处理 */
  const handleTouchMove = useCallback((e: any) => {
    const y = e.touches?.[0]?.pageY;
    if (!isUndefined(y)) handleGestureMove(y);
  }, [handleGestureMove]);

  // 9. Ref 暴露 - 外部调用方法
  useImperativeHandle(ref, () => ({
    scrollContainer: scrollContainerRef,
    /** 打开面板 */
    open: () => setOpened(!0),
    /** 关闭面板 */
    close: () => setOpened(!1),
    /** 展开到上一吸附点 */
    expand: () => updateDetentIndex((v) => clamp(v + 1, 0, parsedDetents.length - 1)),
    /** 展开到指定吸附点 */
    expandToIndex: (i: number) => updateDetentIndex(i),
    /** 折叠到下一吸附点 */
    collapse: () => updateDetentIndex((v) => clamp(v - 1, 0, parsedDetents.length - 1)),
  }), [parsedDetents.length, updateDetentIndex]);

  // 10. 渲染
  return (<View className="pane-box">
    {/* 遮罩层 */}
    <View
      className={clsx('pane-dim', showDim ? 'on' : 'off')}
      onClick={handleDismiss}
    />
    {/* 面板主体 */}
    <View
      className={clsx('pane', cls, { 'anim': shouldTransition, 'no-dim': !showDim })}
      style={{
        height: `${largestDetent}px`,
        bottom: 0,
        transform: `translate3d(0, calc(100% + ${resultingTransform}px), 0)`,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleGestureEnd}
      onTouchCancel={handleGestureCancel}
      catchMove={!0}>
      {/* 拖拽手柄 */}
      <View className={clsx('pane-grip', grabberVisible ? 'on' : 'off')}>
        <View className="grip-bar" />
      </View>
      {/* 内容区域 */}
      <View
        ref={scrollContainerRef}
        className={clsx(
          'pane-body',
          { 'has-grip': grabberVisible },
          { 'no-touch': isLargestDetent },
          transform !== 0 ? 'dragging' : 'scroll',
        )}>
        {children}
      </View>
    </View>
  </View>);
});

SysPane.defaultProps = {
  detents: DEFAULT_DETENTS,
  dimVisible: !0,
  largestUndimmedDetentIndex: -1,
  expansionSwitchThreshold: 50,
  permanent: !1,
  grabberVisible: !1,
};

export default memo(SysPane);
