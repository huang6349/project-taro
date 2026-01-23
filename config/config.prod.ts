import type { UserConfigExport } from '@tarojs/cli';

// 生产环境配置
const config: UserConfigExport<'webpack5'> = {
  // H5 配置
  h5: {
    compile: {
      include: [
        // 确保产物为 es5
        (filename: string) => /node_modules\/(?!(@babel|core-js|style-loader|css-loader|react|react-dom))/.test(filename),
      ],
    },
  },
};

export default config;
