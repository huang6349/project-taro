import type { ReactElement } from 'react';
import type { ReactNode } from 'react';
import type { SysTabsItemProps } from './types';
import type { SysTabsPanelProps } from './types';
import type { SysTabsProps } from './types';
import type { TabsItemConfig } from './types';
import { Tabbar } from '@nutui/nutui-react-taro';
import { View } from '@tarojs/components';
import { Children } from 'react';
import { PanelActiveContext } from './context';
import { isValidElement } from 'react';
import { useCallback } from 'react';
import { useMemo } from 'react';
import { useState } from 'react';
import { clsx } from 'clsx';
import './index.scss';

const {
  TARO_APP_COLOR,
} = process.env;

/** SysTabs.Item 子项：纯配置载体，自身不渲染 DOM（配置由 SysTabs 提取） */
const SysTabsItem = (
  _props: SysTabsItemProps,
) => null;

/** 类型守卫：从 children 中筛出 SysTabs.Item 声明 */
const isTabsItem = (
  child: ReactNode,
): child is ReactElement<SysTabsItemProps> => (
  isValidElement(child) && child.type === SysTabsItem
);

/** 从 children 提取 Tab 配置（key 缺省时回落到渲染顺序索引） */
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

/** 单个面板：注入激活状态（面板内容通过 useRefresh 自动感知并刷新；内容为函数时额外传入激活态） */
const SysTabsPanel = (
  props: SysTabsPanelProps,
) => {
  // 参数解构
  const {
    item,
    active,
  } = props;
  return (<PanelActiveContext.Provider value={active}>
    <View
      className={clsx('sys-tabs__panel', {
        // 保留模式：非选中面板隐藏（display: none）但保持挂载
        'sys-tabs__panel--hidden': !active,
      })}>
      {/* 内容为函数时传入激活态（面板级联动：激活时刷新等） */}
      {typeof item.content === 'function' ? item.content(active) : item.content}
    </View>
  </PanelActiveContext.Provider>);
};

// ============== 组件 ==============
/**
 * SysTabs：子组件式声明的 Tab 容器
 * - 子项通过 SysTabs.Item 声明（纯配置载体，内容为 children）
 * - 面板懒挂载 + 保留：首次选中时挂载，切走不销毁（destroyInactive=true 时切走销毁）
 * - 面板内容中调用 useRefresh 可自动感知激活态刷新（懒挂载首屏 + 每次切回）
 *
 * 用法：
 * <SysTabs>
 *   <SysTabs.Item title="首页" icon={...}>
 *     面板内容
 *   </SysTabs.Item>
 * </SysTabs>
 *
 * 其余 props 透传 NutUI Tabbar（如 inactiveColor、fixed 等）
 */
const SysTabs = (
  props: SysTabsProps,
) => {
  // 1. Props 解构：className 与业务 props 分离，其余透传 Tabbar
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
    const next = value || 0;
    // 更新选中态
    setSelected(next);
    // 懒挂载：标记新面板已挂载（保留模式不销毁）
    if (!destroyInactive) {
      setMounted(prev => new Set(prev).add(next));
    } else return;
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
        } else return (<SysTabsPanel
          key={item.key}
          item={item}
          active={index === safeSelected}
        />);
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
