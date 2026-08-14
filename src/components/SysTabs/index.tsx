import type { ReactElement } from 'react';
import type { ReactNode } from 'react';
import type { TabsItemConfig } from './types';
import type { SysTabsItemProps } from './types';
import type { SysTabsProps } from './types';
import { Tabbar } from '@nutui/nutui-react-taro';
import { View } from '@tarojs/components';
import { Children } from 'react';
import { isValidElement } from 'react';
import { useMemo } from 'react';
import { useState } from 'react';
import { clsx } from 'clsx';
import './index.scss';

const {
  TARO_APP_COLOR,
} = process.env;

/** SysTabs.Item 子项：纯配置载体，自身不渲染 DOM */
const SysTabsItem = (
  _props: SysTabsItemProps,
) => null;

/** 类型守卫：判断是否为 SysTabs.Item */
const isTabsItem = (
  child: ReactNode,
): child is ReactElement<SysTabsItemProps> => (
  isValidElement(child) && child.type === SysTabsItem
);

/** 从 children 提取 Tab 配置 */
const extractItems = (
  children: ReactNode,
): TabsItemConfig[] => (
  Children.toArray(children)
    .filter(isTabsItem)
    .map((child, index) => ({
      key: String(child.key ?? index),
      title: child.props.title ?? '',
      icon: child.props.icon,
      content: child.props.children,
    }))
);

/** 渲染 Tab 项 */
const renderItem = (
  item: TabsItemConfig,
) => (<Tabbar.Item
  key={item.key}
  title={item.title}
  icon={item.icon}
/>);

// ============== 组件 ==============
const SysTabs = (
  props: SysTabsProps,
) => {
  // 1. Props 解构
  const {
    className: cls,
    children,
    ...tabbarProps
  } = props;

  // 2. 内部状态（选中索引）
  const [selected, setSelected] = useState(0);

  // 3. 计算属性：提取 Tab 配置（依赖 children，tab 切换时引用稳定）
  const items = useMemo(() => (
    extractItems(children)
  ), [children]);

  return (<View
    className={clsx('sys-tabs', cls)}>
    {/* 子界面面板：渲染当前选中项内容 */}
    <View className="sys-tabs__panel">
      {items[selected]?.content}
    </View>
    {/* 底部标签栏 */}
    <Tabbar
      className="sys-tabs__tabbar"
      {...tabbarProps}
      value={selected}
      activeColor={TARO_APP_COLOR}
      safeArea={!0}
      onSwitch={(value) => {
        // 更新选中态（视图切换由 SysTabs 内部响应）
        setSelected(value || 0);
      }}>
      {items.map(renderItem)}
    </Tabbar>
  </View>);
};

// 静态挂载子组件
SysTabs.Item = SysTabsItem;

export default SysTabs;
