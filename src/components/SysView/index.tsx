import type { SysViewProps } from './types';
import { SafeArea } from '@nutui/nutui-react-taro';
import { View } from '@tarojs/components';
import clsx from 'clsx';
import './index.scss';

const SysView = (
  props: SysViewProps,
) => {
  const {
    className: cls,
    children,
    safeArea,
    ...viewProps
  } = props;

  return (<View
    className={clsx('sys', cls)}
    {...viewProps}>
    {children}
    {safeArea ? (<SafeArea
      position="bottom"
    />) : null}
  </View>);
};

SysView.defaultProps = {
  safeArea: !1,
};

export default SysView;
