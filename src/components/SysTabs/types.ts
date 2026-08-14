import type { ComponentProps } from 'react';
import type { ReactNode } from 'react';
import type { Tabbar } from '@nutui/nutui-react-taro';

/** SysTabs.Item 子项属性：tab 配置 + 子界面内容 */
export type SysTabsItemProps = ComponentProps<typeof Tabbar.Item> & {
  children: ReactNode;
};

/** SysTabs 主体属性 */
export type SysTabsProps = Omit<
  ComponentProps<typeof Tabbar>,
  'value' | 'defaultValue' | 'onSwitch' | 'children'
> & {
  children: ReactNode;
};

/** 从 children 提取后的 Tab 配置 */
export type TabsItemConfig = {
  key: string;
  title: SysTabsItemProps['title'];
  icon: SysTabsItemProps['icon'];
  content: ReactNode;
};
