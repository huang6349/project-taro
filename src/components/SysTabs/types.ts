import type { ComponentProps } from 'react';
import type { ReactElement } from 'react';
import type { ReactNode } from 'react';
import type { Tabbar } from '@nutui/nutui-react-taro';

export type SysTabsItem = {
  text: string;
  icon: ReactNode;
};

export type RenderItem = (
  item: SysTabsItem,
  index: number,
) => ReactElement;

export type SysTabsProps = ComponentProps<typeof Tabbar> & {
  items: SysTabsItem[];
};
