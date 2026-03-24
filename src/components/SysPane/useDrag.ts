import { useCallback } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import { clamp } from 'lodash-es';

// ============== 常量 ==============
/** 最小拖拽距离，低于此值视为无效拖拽 */
const MIN_DRAG_DISTANCE = 10;

/** 快速滑动速度阈值 */
const VELOCITY_THRESHOLD = 0.4;

/** 触发关闭的拖拽比例阈值 */
const CLOSE_THRESHOLD = 0.25;

/** 对数阻尼函数 - 向上拖拽时产生弹性阻尼效果 */
const dampenValue = (v: number) => (
  8 * (Math.log(v + 1) - 2)
);

// ============== 类型定义 ==============
/** useDrag Hook 配置项 */
interface UseDragOptions {
  /** 是否处于最大吸附点 */
  isLargestDetent: boolean;
  /** 是否处于最小吸附点 */
  isSmallestDetent: boolean;
  /** 最大吸附点高度 */
  largestDetent: number;
  /** 触发吸附点切换的拖拽距离阈值 */
  expansionSwitchThreshold: number;
  /** 面板是否永久显示 */
  permanent: boolean;
  /** 最大吸附点索引 */
  maxDetentIndex: number;
  /** 更新当前吸附点索引 */
  onUpdateDetentIndex: (value: number) => void;
  /** 关闭面板 */
  onClose: () => void;
  /** 重置滚动位置 */
  onResetScroll: () => void;
}

// ============== Hook ==============
export function useDrag(
  options: UseDragOptions,
) {
  const {
    isLargestDetent,
    isSmallestDetent,
    largestDetent,
    expansionSwitchThreshold,
    permanent,
    maxDetentIndex,
    onUpdateDetentIndex,
    onClose,
    onResetScroll,
  } = options;

  // 手势状态
  const [transform, setTransform] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const originRef = useRef<number | null>(null);
  const currentIndexRef = useRef(0);

  /** 重置所有手势状态 */
  const resetState = useCallback(() => {
    setTransform(0);
    originRef.current = null;
    startTimeRef.current = null;
  }, []);

  /** 触摸开始：记录起点和时间 */
  const handleGestureStart = useCallback((y: number) => {
    originRef.current = y;
    startTimeRef.current = Date.now();
  }, []);

  /** 触摸移动：根据方向计算 transform */
  const handleGestureMove = useCallback(
    (y: number) => {
      if (originRef.current === null) return;

      const delta = y - originRef.current;
      let newTransform: number;

      if (isLargestDetent) {
        // 最大吸附点：只允许向下拖拽
        newTransform = Math.max(delta, 0);
      } else if (isSmallestDetent) {
        // 最小吸附点：向上拖拽产生阻尼效果
        newTransform = delta <= 0 ? delta : dampenValue(delta);
      } else {
        // 中间吸附点：自由拖拽
        newTransform = delta;
      }

      setTransform(newTransform);
    },
    [isLargestDetent, isSmallestDetent],
  );

  /** 触摸结束：判断触发吸附点切换、关闭或回弹 */
  const handleGestureEnd = useCallback(() => {
    const elapsed = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
    const velocity = elapsed > 0 ? Math.abs(transform) / (elapsed / 1000) : 0;
    const isQuickSwipe = velocity > VELOCITY_THRESHOLD;

    // 无效拖拽：距离过短且非快速滑动
    if (Math.abs(transform) < MIN_DRAG_DISTANCE && !isQuickSwipe) {
      resetState();
      return;
    }

    // 向上拖拽：切换到上一吸附点
    if (transform < -expansionSwitchThreshold || (isQuickSwipe && transform < 0)) {
      if (!isLargestDetent) {
        const nextIndex = clamp(currentIndexRef.current + 1, 0, maxDetentIndex);
        onUpdateDetentIndex(nextIndex);
        currentIndexRef.current = nextIndex;
        onResetScroll();
      }
    } else if (transform > expansionSwitchThreshold || (isQuickSwipe && transform > 0)) {
      // 向下拖拽
      const draggedRatio = Math.abs(transform) / largestDetent;
      if (!permanent && isSmallestDetent && draggedRatio > CLOSE_THRESHOLD) {
        // 最底层吸附点 + 拖拽比例超过阈值：关闭面板
        onClose();
        onUpdateDetentIndex(0);
        currentIndexRef.current = 0;
      } else if (!isSmallestDetent) {
        // 非最底层：切换到下一吸附点
        const nextIndex = clamp(currentIndexRef.current - 1, 0, maxDetentIndex);
        onUpdateDetentIndex(nextIndex);
        currentIndexRef.current = nextIndex;
      }
    }

    resetState();
  }, [
    transform,
    expansionSwitchThreshold,
    isLargestDetent,
    isSmallestDetent,
    largestDetent,
    permanent,
    maxDetentIndex,
    onUpdateDetentIndex,
    onClose,
    onResetScroll,
    resetState,
  ]);

  return {
    transform,
    handleGestureStart,
    handleGestureMove,
    handleGestureEnd,
    handleGestureCancel: resetState,
  };
}
