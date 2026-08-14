import type { ComponentProps } from 'react';
import type { View } from '@tarojs/components';

export type SysViewProps = ComponentProps<typeof View> & {
  safeArea?: boolean;
};
