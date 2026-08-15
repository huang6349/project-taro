import type { SysTabsPanelProps, SysTabsProps } from './types';
import { Tabbar } from '@nutui/nutui-react-taro';
import { useCallback } from 'react';
import { useEffect } from 'react';
import { useMemo } from 'react';
import { useState } from 'react';
import { useLatest } from 'react-use';
import { clsx } from 'clsx';
import SysView from '../SysView';
import './index.scss';

const {
  TARO_APP_COLOR,
} = process.env;

/**
 * SysTabs.Panel：Tab 选项界面对应的懒挂载/保活容器（基于 SysView）
 * - 懒挂载：首次 active 时才挂载 children（首屏只挂载默认 Tab）
 * - 保活：访问后保持挂载，切走 display:none 隐藏（状态与滚动位置不丢失）
 * - active 由外部受控（页面状态，如 valtio store）；内容中调用 useRefresh 可经
 *   active/retapTick 信号自动刷新（首屏下拉 / 切回静默 / retap 下拉）
 * - 基于 SysView：含 safeArea 能力，页面 Tab 内容无需再包 SysView
 */
const SysTabsPanel = (
  props: SysTabsPanelProps,
) => {
  // 1. Props 解构
  const {
    className: cls,
    active,
    children,
    ...viewProps
  } = props;

  // 2. 已访问标记：首次激活时置位，此后保持挂载（保活）
  const [visited, setVisited] = useState(active);
  useEffect(() => {
    if (active) {
      setVisited(!0);
    }
  }, [active]);

  // 3. 未访问过：不渲染（懒挂载，children 与其中的 Hook 副作用均不生效）
  if (!visited) {
    return null;
  }

  return (<SysView
    className={clsx('sys-tabs__panel', cls, {
      // 保留模式：非激活面板隐藏（display: none）但保持挂载
      'sys-tabs__panel--hidden': !active,
    })}
    {...viewProps}>
    {children}
  </SysView>);
};

/**
 * SysTabs：Tabbar 包装器（受控，纯标签栏，不含面板渲染）
 * - items 声明 Tab 配置（key/title/icon）
 * - value/onSwitch 受控：外部状态驱动（如 valtio store），点击只更新 active key，不走路由
 * - 点击当前已选中 Tab 派发 onRetap（retap 刷新信号，页面刷新 Hook 自行响应）
 * - 面板容器用 SysTabs.Panel（懒挂载 + 保活）
 *
 * 用法：
 * <SysTabs
 *   items={ITEMS}
 *   value={snap.selected}
 *   onSwitch={(v) => (state.selected = v)}
 *   onRetap={() => (state.retapTick += 1)} />
 *
 * 其余 props 透传 NutUI Tabbar（inactiveColor 等；value/activeColor/safeArea/fixed 由默认值兜底）
 */
const SysTabs = (
  props: SysTabsProps,
) => {
  // 1. Props 解构：className 与业务 props 分离，其余透传 Tabbar
  const {
    className: cls,
    items,
    value,
    onSwitch,
    onRetap,
    activeColor,
    safeArea,
    fixed,
    ...tabbarProps
  } = props;

  // 2. 最新引用：受控值经 ref 读取，handleSwitch 依赖稳定（引用稳定，减少 Tabbar 重渲染）
  const valueRef = useLatest(value);
  const onSwitchRef = useLatest(onSwitch);
  const onRetapRef = useLatest(onRetap);

  // 3. 计算属性：Tabbar.Item 列表（items 引用稳定时复用，减少 Tabbar 重渲染）
  const tabbarItems = useMemo(() => (
    items.map((item, index) => (
      <Tabbar.Item
        key={item.key ?? index}
        title={item.title}
        icon={item.icon}
      />
    ))
  ), [items]);

  // 4. 事件处理：同值 = retap（点击当前 Tab），异值 = 切换
  const handleSwitch = useCallback((next: number) => {
    const v = next || 0;
    if (v !== valueRef.current) {
      onSwitchRef.current?.(v);
    } else {
      onRetapRef.current?.(v);
    }
  }, []);

  // 5. 状态守卫：无 Tab 配置时不渲染标签栏
  if (!items.length) {
    return null;
  } else return (<Tabbar
    className={clsx('sys-tabs__tabbar', cls)}
    {...tabbarProps}
    value={value}
    activeColor={activeColor}
    safeArea={safeArea}
    fixed={fixed}
    onSwitch={handleSwitch}>
    {tabbarItems}
  </Tabbar>);
};

// 默认 props：与 NutUI Tabbar 默认行为对齐（应用主题色、安全区、固定底部）
SysTabs.defaultProps = {
  value: 0,
  activeColor: TARO_APP_COLOR,
  safeArea: !0,
  fixed: !0,
};

// 静态挂载子组件
SysTabs.Panel = SysTabsPanel;

export default SysTabs;
