import { proxy } from 'valtio';

/**
 * 首页 Tab 状态（valtio 驱动，无 context）
 * - retapTick：retap 信号计数（点击当前已选中 Tab 时 +1，各刷新 Hook 监听变化响应）
 * - selected：当前选中 Tab 索引（点击 Tab 只更新 active key，不走路由）
 */
export default proxy({
  retapTick: 0,
  selected: 0,
});
