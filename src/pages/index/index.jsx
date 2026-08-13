import { View } from '@tarojs/components';
import { Text } from '@tarojs/components';
import { Button } from '@tarojs/components';
import { ScrollView } from '@tarojs/components';
import { useRef } from 'react';
import { useCallback } from 'react';
import SysPane from '@/components/SysPane';
import { CONTENT_LIST, FEATURES } from './constants';
import './index.scss';

const SysPaneDemo = () => {
  /** SysPane 组件实例引用 */
  const paneRef = useRef(null);

  /** 打开抽屉 */
  const handleOpen = useCallback(() => {
    paneRef.current?.open();
  }, []);

  /** 收起抽屉 */
  const handleCollapse = useCallback(() => {
    paneRef.current?.collapse();
  }, []);

  /** 展开全部 */
  const handleExpand = useCallback(() => {
    paneRef.current?.expand();
  }, []);

  return (<View className="sys-pane-demo">
    {/* 顶部标题区 */}
    <View className="demo-header">
      <View className="header-icon">
        <Text className="header-icon-text">
          P
        </Text>
      </View>
      <Text className="header-title">
        SysPane
      </Text>
      <Text className="header-subtitle">
        轻量 · 灵活 · 高性能
      </Text>
    </View>
    {/* 功能列表 */}
    <View className="demo-cards">
      {FEATURES.map((item, index) => (
        <View
          className="feature-card"
          key={index}>
          <View className="card-num">
            {index + 1}
          </View>
          <View className="card-body">
            <Text className="card-title">
              {item.title}
            </Text>
            <Text className="card-desc">
              {item.desc}
            </Text>
          </View>
        </View>
      ))}
    </View>
    {/* 主按钮 */}
    <View className="demo-action">
      <Button
        className="main-btn"
        onClick={handleOpen}>
        体验组件
      </Button>
    </View>
    {/* 底部抽屉面板 */}
    <SysPane
      detents={[150, '45%', '100%']}
      grabberVisible={!0}
      dimVisible={!1}
      permanent={!0}
      ref={paneRef}>
      <View className="sheet-header">
        <Text className="sheet-title">
          功能演示
        </Text>
      </View>
      <ScrollView
        className="sheet-content"
        scrollY={!0}>
        <View className="sheet-actions">
          <Button
            className="sheet-btn-cancel"
            onClick={handleCollapse}>
            收起
          </Button>
          <Button
            className="sheet-btn-confirm"
            onClick={handleExpand}>
            展开全部
          </Button>
        </View>
        {CONTENT_LIST.map((text, index) => (
          <View
            className="content-row"
            key={index}>
            <View className="content-num">
              {index + 1}
            </View>
            <Text className="content-text">
              {text}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SysPane>
  </View>);
};

export default SysPaneDemo;
