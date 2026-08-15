import type { ComponentProps } from 'react';
import type { ReactNode } from 'react';
import type { Tabbar } from '@nutui/nutui-react-taro';
import type { SysViewProps } from '../SysView/types';

/** Tab 配置项 */
export type SysTabsItemConfig = {
  /** Tab 唯一标识；缺省时回落到渲染顺序索引 */
  key?: string | number;
  /** 标题 */
  title: string;
  /** 图标节点 */
  icon?: ReactNode;
};

/**
 * SysTabs 主体属性
 * value/onSwitch 受控（外部状态驱动，如 valtio store），onRetap 派发「点击当前已选中 Tab」
 */
export type SysTabsProps = Omit<
  ComponentProps<typeof Tabbar>,
  'value' | 'defaultValue' | 'onSwitch' | 'children'
> & {
  /** Tab 配置列表 */
  items: SysTabsItemConfig[];
  /** 受控选中索引 */
  value?: number;
  /** 切换回调：点击非当前 Tab */
  onSwitch?: (value: number) => void;
  /** retap 回调：点击当前已选中 Tab（用于页面派发刷新信号） */
  onRetap?: (value: number) => void;
};

/** SysTabs.Panel 属性：Tab 选项界面的懒挂载/保活容器（基于 SysView，含 safeArea 能力） */
export type SysTabsPanelProps = SysViewProps & {
  /** 是否激活（受控）；首次 active 时挂载，切走隐藏不卸载 */
  active: boolean;
};
