import type { ReactNode, MutableRefObject } from 'react';

export interface SysPaneRef {
  /** 面板内容容器的 DOM 引用 */
  scrollContainer: MutableRefObject<HTMLDivElement | null>;
  /** 打开面板 */
  open: () => void;
  /** 关闭面板 */
  close: () => void;
  /** 展开到上一个吸附点 */
  expand: () => void;
  /** 展开到指定吸附点 @param i 吸附点索引 */
  expandToIndex: (i: number) => void;
  /** 折叠到下一个吸附点 */
  collapse: () => void;
}

export interface SysPaneProps {
  /** 额外的 CSS 类名 */
  className?: string;
  /**
   * 吸附点数值数组，面板会在这些位置停住。
   *
   * 每个吸附点可以是像素值或视口高度的百分比，从底部向上计算。
   * 无效的值会被忽略。
   *
   * **重要**：吸附点需从小到大排序，否则表现可能异常。
   *
   * @example [100, 200, 300] [100, "50%"], ["90%"]
   * @default ["50%", "97%"]
   */
  detents?: Array<string | number>;
  /** 拖拽超过多少像素后切换展开状态 @default 50 */
  expansionSwitchThreshold?: number;
  /** 是否显示顶部的拖拽手柄
   *
   * 注意：该组件主要针对移动端，但在桌面端也可以通过拖拽手柄来展开/折叠面板。
   * @default false
   */
  grabberVisible?: boolean;
  /** 不遮罩背景的最大吸附点索引，默认为 `-1` 表示始终遮罩。 @default -1 */
  largestUndimmedDetentIndex?: number;
  /** 面板是否为永久显示，无法关闭 @default false */
  permanent?: boolean;
  /** 面板内容 */
  children?: ReactNode;
}
