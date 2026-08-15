import { House } from 'lucide-react-taro';
import { FolderOpen } from 'lucide-react-taro';
import { ListTodo } from 'lucide-react-taro';
import { MessageCircle } from 'lucide-react-taro';
import { User } from 'lucide-react-taro';
import { SysTabs } from '@/components';
import { useSnapshot } from 'valtio';
import state from '../../store';

/** Tab 图标（统一尺寸，lucide 内部处理跨端单位；顺序与 ITEMS 一一对应） */
const ICONS = [
  <House size={18} />,          // 首页
  <FolderOpen size={18} />,     // 资源
  <MessageCircle size={18} />,  // 消息
  <ListTodo size={18} />,       // 任务
  <User size={18} />,           // 我的
];

/** 5 个 Tab 配置（点击切换只更新主容器 active key，不走路由） */
const ITEMS = [{
  key: 'home',
  title: '首页',
  icon: ICONS[0],
}, {
  key: 'rsrc',
  title: '资源',
  icon: ICONS[1],
}, {
  key: 'msgs',
  title: '消息',
  icon: ICONS[2],
}, {
  key: 'task',
  title: '任务',
  icon: ICONS[3],
}, {
  key: 'mine',
  title: '我的',
  icon: ICONS[4],
}];

/**
 * 首页 Tabbar：SysTabs 包装，受控于页面 store
 * - 切换 Tab：更新 store.selected（主容器 active key，不走路由切换）
 * - 点击当前 Tab：retapTick +1（派发 retap 信号，各刷新 Hook 自行响应）
 * - activeColor/safeArea/fixed 使用 SysTabs 默认值（应用主题色、安全区、固定底部）
 */
const PageTabs = () => {
  // 1. 订阅页面状态（selected 驱动 Tabbar 高亮）
  const snap = useSnapshot(state);

  // 2. 事件处理：切换 Tab 只更新 active key，不走路由
  const handleSwitch = (value) => {
    state.selected = value;
  };

  // 3. 事件处理：点击当前已选中 Tab → 派发 retap 刷新信号
  const handleRetap = () => {
    state.retapTick += 1;
  };

  return (<SysTabs
    className="page-tabs"
    items={ITEMS}
    value={snap.selected}
    onSwitch={handleSwitch}
    onRetap={handleRetap}
  />);
};

export default PageTabs;
