import type { RenderItem } from './types';
import type { SysTabBarProps } from './types';
import { Tabbar } from '@nutui/nutui-react-taro';
import { useSnapshot } from 'valtio';
import { clsx } from 'clsx';
import state from './index.state';
import './index.scss';

const {
  TARO_APP_COLOR,
} = process.env;

/** 渲染 Tab 项 */
const renderItem: RenderItem = (
  item,
  key,
) => {
  const {
    text,
    icon,
  } = item;
  return (<Tabbar.Item
    key={key}
    title={text}
    icon={icon}
  />);
};

// ============== 组件 ==============
const SysTabBar = (
  props: SysTabBarProps,
) => {
  // 1. Props 解构
  const {
    className: cls,
    items,
    ...tabbarProps
  } = props;

  // 2. 内部状态
  const snap = useSnapshot(state);

  return (<Tabbar
    className={clsx(cls)}
    {...tabbarProps}
    value={snap.selected}
    activeColor={TARO_APP_COLOR}
    safeArea={!0}
    fixed={!0}
    onSwitch={(value) => {
      // 更新选中态（视图切换由容器页响应，无页面跳转）
      state.selected = value || 0;
    }}>
    {items.map(renderItem)}
  </Tabbar>);
};

export default SysTabBar;
