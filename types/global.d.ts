/// <reference types="@tarojs/taro" />

declare module '*.png';
declare module '*.gif';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.styl';

declare namespace NodeJS {
  interface ProcessEnv {
    /** NODE 内置环境变量, 会影响到最终构建生成产物 */
    NODE_ENV: 'development' | 'production';
    /** 当前构建的平台 */
    TARO_ENV: 'weapp' | 'swan' | 'alipay' | 'h5' | 'rn' | 'tt' | 'qq' | 'jd' | 'harmony' | 'jdrn';
    /** 小程序或应用的名称 */
    TARO_APP_PROJECT: string;
    /** 小程序或应用的名称 */
    TARO_APP_NAME: string;
    /** 导航栏等 UI 组件的主题颜色 */
    TARO_APP_COLOR: string;
    /** 小程序或应用的 AppID */
    TARO_APP_ID: string;
  }
}
