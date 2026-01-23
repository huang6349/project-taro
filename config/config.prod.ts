import type { UserConfigExport } from '@tarojs/cli';

// 生产环境配置
const config: UserConfigExport<'vite'> = {
  // H5 配置
  h5: {
    // 启用兼容模式（输出 ES5）
    legacy: !0,
  },
};

export default config;
