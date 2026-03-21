import type { ReactNode } from 'react';

export type PanelState = 'top' | 'middle' | 'bottom';

export interface SysDrawerProps {
  /** 中态高度 */
  middle?: number;
  /** 收起高度 */
  bottom: number;
  /** 拖拽把手 */
  handle?: ReactNode;
  /** 初始状态，默认收起 */
  initialState?: PanelState;
  /** 状态变化回调 */
  onStateChange?: (state: PanelState) => void;
  /** 拖拽开始回调 */
  onDragStart?: () => void;
  /** 拖拽结束回调 */
  onDragEnd?: (state: PanelState) => void;
  /** 自定义内容 */
  children?: ReactNode;
}
