import type { ReactElement } from 'react';
import type { ReactNode } from 'react';
import type { TabsItemConfig } from './types';
import type { SysTabsItemProps } from './types';
import type { SysTabsProps } from './types';
import { Tabbar } from '@nutui/nutui-react-taro';
import { View } from '@tarojs/components';
import { Children } from 'react';
import { isValidElement } from 'react';
import { useCallback } from 'react';
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
    destroyInactive,
    children,
    ...tabbarProps
  } = props;

  // 2. 内部状态（选中索引）
  const [selected, setSelected] = useState(0);
  // 已挂载面板索引集合（懒挂载：首次选中时挂载，之后保留不销毁，状态与滚动位置不丢失）
  const [mounted, setMounted] = useState<Set<number>>(() => (
    new Set([0])
  ));

  // 3. 计算属性：提取 Tab 配置（依赖 children，tab 切换时引用稳定）
  const items = useMemo(() => (
    extractItems(children)
  ), [children]);

  // 4. 事件处理：切换 tab（引用稳定，减少 Tabbar 重渲染）
  const handleSwitch = useCallback((value: number) => {
    // 更新选中态
    setSelected(value || 0);
    // 懒挂载：标记新面板已挂载（保留模式不销毁）
    if (!destroyInactive) {
      setMounted(prev => new Set(prev).add(value || 0));
    }
  }, [destroyInactive]);

  // 5. 计算属性：面板数量变化时回落，避免选中索引越界
  const safeSelected = Math.min(selected, items.length - 1);

  return (<View
    className={clsx('sys-tabs', cls)}>
    {/* 子界面面板：懒挂载 + 保留（destroyInactive 时切走销毁） */}
    <View className="sys-tabs__panels">
      {items.map((item, index) => {
        // 销毁模式仅渲染当前选中；保留模式仅渲染已挂载项
        if (destroyInactive ? index !== safeSelected : !mounted.has(index)) {
          return null;
        }
        return (
          <View
            key={item.key}
            className={clsx('sys-tabs__panel', {
              // 保留模式：非选中面板隐藏（display: none）但保持挂载
              'sys-tabs__panel--hidden': !destroyInactive && index !== safeSelected,
            })}>
            {item.content}
          </View>
        );
      })}
    </View>
    {/* 底部标签栏 */}
    <Tabbar
      className="sys-tabs__tabbar"
      {...tabbarProps}
      value={safeSelected}
      activeColor={TARO_APP_COLOR}
      safeArea={!0}
      onSwitch={handleSwitch}>
      {items.map(renderItem)}
    </Tabbar>
  </View>);
};

SysTabs.defaultProps = {
  destroyInactive: !1,
};

// 静态挂载子组件
SysTabs.Item = SysTabsItem;

export default SysTabs;
