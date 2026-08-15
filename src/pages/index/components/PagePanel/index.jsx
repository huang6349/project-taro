import { useSnapshot } from 'valtio';
import { SysTabs } from '@/components';
import { safeEq } from '@/utils';
import state from '../../store';

/**
 * 页面级 Tab 面板容器：SysTabs.Panel 的页面封装
 * - 懒挂载 + 保活由 SysTabs.Panel 提供（首次访问挂载，切走隐藏不卸载）
 * - 激活状态自动绑定 store.selected 与 selected prop（无需手动传 active）
 * - selected 与 ITEMS 数组下标一一对应（缺失/越界时面板永不激活，静默不渲染）
 *
 * 用法：
 * <PagePanel selected={0}>
 *   <HomeView />
 * </PagePanel>
 */
const PagePanel = (
  props,
) => {
  // 1. Props 解构：selected 绑定激活状态，children 为界面内容
  const {
    selected,
    children,
  } = props;

  // 2. 订阅选中索引（驱动懒挂载与激活显示；仅 selected 变化触发重渲染）
  const snap = useSnapshot(state);

  return (<SysTabs.Panel
    className="page-panel"
    active={safeEq(snap.selected, selected)}>
    {children}
  </SysTabs.Panel>);
};

export default PagePanel;
