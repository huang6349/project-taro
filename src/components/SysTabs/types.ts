import type { ComponentProps } from 'react';
import type { ReactNode } from 'react';
import type { Tabbar } from '@nutui/nutui-react-taro';

/**
 * SysTabs.Item 子项属性：tab 配置 + 子界面内容
 * 排除 Tabbar.Item 原生 children（ReactNode），避免类型交叉吞掉函数形式
 */
export type SysTabsItemProps = Omit<
  ComponentProps<typeof Tabbar.Item>,
  'children'
> & {
  /** 子界面内容；函数形式时入参为面板激活状态（用于面板级联动，如激活时刷新） */
  children: ReactNode | ((active: boolean) => ReactNode);
};

/**
 * SysTabs 主体属性
 * 排除 Tabbar 的受控属性（value/defaultValue/onSwitch 由内部管理）与 children（改由 SysTabs.Item 声明）
 */
export type SysTabsProps = Omit<
  ComponentProps<typeof Tabbar>,
  'value' | 'defaultValue' | 'onSwitch' | 'children'
> & {
  /** 切换时是否销毁非激活子界面，默认 false（懒挂载 + 保留，状态不丢失） */
  destroyInactive?: boolean;
  /** 子界面内容：SysTabs.Item 列表 */
  children: ReactNode;
};

/** 从 children 提取后的 Tab 配置（SysTabs 内部使用） */
export type TabsItemConfig = {
  /** 面板唯一标识：SysTabs.Item 的 key，缺省时回落到渲染顺序索引 */
  key: string;
  title: SysTabsItemProps['title'];
  icon: SysTabsItemProps['icon'];
  /** 子界面内容；函数形式由 SysTabs 渲染时传入激活态 */
  content: ReactNode | ((active: boolean) => ReactNode);
};

/** 单个面板组件属性（SysTabs 内部渲染使用） */
export type SysTabsPanelProps = {
  /** 面板配置 */
  item: TabsItemConfig;
  /** 面板是否为激活态（决定隐藏样式 + 注入激活上下文） */
  active: boolean;
};
