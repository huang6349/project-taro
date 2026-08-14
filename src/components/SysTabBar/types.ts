import type { ComponentProps } from 'react';
import type { ReactElement } from 'react';
import type { ReactNode } from 'react';
import type { Tabbar } from '@nutui/nutui-react-taro';

export type SysTabBarItem = {
  text: string;
  icon: ReactNode;
};

export type RenderItem = (
  item: SysTabBarItem,
  index: number,
) => ReactElement;

export type SysTabBarProps = ComponentProps<typeof Tabbar> & {
  items: SysTabBarItem[];
};
