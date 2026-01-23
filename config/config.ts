import type { UserConfigExport } from '@tarojs/cli';
import type { Plugin } from 'vite';
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite';
import tailwindcss from 'tailwindcss';
import vitePluginImp from 'vite-plugin-imp';
import path from 'path';

// 环境变量：项目名称、App 名称（RN）
const {
  TARO_APP_PROJECT,
  TARO_APP_NAME,
} = process.env;

// 基础/通用配置
const config: UserConfigExport<'vite'> = {
  // 项目名称
  projectName: TARO_APP_PROJECT,
  // 项目创建日期
  date: '2026-1-20',
  // 设计稿基准尺寸
  designWidth: (input: any) => {
    // NutUI 组件使用 375 基准
    if (input?.file?.replace(/\\+/g, '/').indexOf('@nutui') > -1)
      return 375;
    // 项目代码使用 750 基准
    return 750;
  },
  // 设备像素比：设计稿宽度 -> 像素比
  deviceRatio: {
    640: 2.34 / 2,  // 640px -> 1.17
    750: 1,         // 750px -> 1
    375: 2,         // 375px -> 2
    828: 1.81 / 2,  // 828px -> 0.905
  },
  // 源码根目录
  sourceRoot: 'src',
  // 输出目录
  outputRoot: 'dist',
  // Taro 插件
  plugins: [
    '@tarojs/plugin-html',
    '@tarojs/plugin-http',
  ],
  // 全局常量
  defineConstants: {},
  // 路径别名
  alias: {
    '@/assets': path.resolve(__dirname, '..', 'src/assets'),
    '@/components': path.resolve(__dirname, '..', 'src/components'),
    '@/constants': path.resolve(__dirname, '..', 'src/constants'),
    '@/hocs': path.resolve(__dirname, '..', 'src/hocs'),
    '@/hofs': path.resolve(__dirname, '..', 'src/hofs'),
    '@/hooks': path.resolve(__dirname, '..', 'src/hooks'),
    '@/utils': path.resolve(__dirname, '..', 'src/utils'),
  },
  // 文件复制配置
  copy: {
    patterns: [],
    options: {},
  },
  // 框架
  framework: 'react',
  // 编译器配置
  compiler: {
    type: 'vite',
    // Vite 插件
    vitePlugins: [
      // 小程序 TailwindCSS 插件：rem 转 rpx、注入 CSS 变量作用域
      UnifiedViteWeappTailwindcssPlugin({
        rem2rpx: !0,
        // H5/Harmony/RN 平台禁用（使用 rem 而非 rpx）
        disabled: process.env.TARO_ENV === 'h5'
          || process.env.TARO_ENV === 'harmony'
          || process.env.TARO_ENV === 'rn',
        injectAdditionalCssVarScope: !0,
      }),
      // PostCSS 配置加载插件：将 tailwindcss 注入到 postcss 配置中
      {
        name: 'postcss-config-loader-plugin',
        config(config) {
          if (typeof config.css?.postcss === 'object') {
            config.css?.postcss?.plugins?.unshift(tailwindcss());
          }
        },
      },
      // 组件库样式自动导入插件：按需导入 NutUI 组件样式
      vitePluginImp({
        libList: [{
          libName: '@nutui/nutui-react-taro',
          // 组件样式路径
          style: (name) => `@nutui/nutui-react-taro/dist/es/packages/${name.toLowerCase()}/style`,
          // 是否将组件名转为中划线格式
          camel2DashComponentName: !1,
          // 是否替换旧导入方式
          replaceOldImport: !1,
        }],
      }),
    ] as Plugin[],
  },
  // SASS 全局变量文件
  sass: {
    data: '@import "@nutui/nutui-react-taro/dist/styles/variables.scss";',
  },
  // 小程序配置
  mini: {
    postcss: {
      // px 转 rpx
      pxtransform: {
        enable: !0,
        config: {
          selectorBlackList: ['nut-'],
        },
      },
      // CSS 中 url 图片转换
      url: {
        enable: !0,
        config: {
          limit: 1024,
        },
      },
      // CSS Modules 配置
      cssModules: {
        enable: !1,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
    // CSS 提取配置
    miniCssExtractPluginOption: {
      ignoreOrder: !0,
    },
    // 主包优化
    optimizeMainPackage: {
      enable: !0,
    },
  },
  // H5 配置
  h5: {
    // 公共路径
    publicPath: '/',
    // 静态资源目录
    staticDirectory: 'static',
    // CSS 提取配置
    miniCssExtractPluginOption: {
      ignoreOrder: !0,
      filename: 'css/[name].[hash].css',
      chunkFilename: 'css/[name].[chunkhash].css',
    },
    postcss: {
      // px 转 rem
      pxtransform: {
        enable: !0,
        config: {
          selectorBlackList: ['nut-'],
        },
      },
      // Autoprefixer 自动添加前缀
      autoprefixer: {
        enable: !0,
        config: {},
      },
      // CSS Modules 配置
      cssModules: {
        enable: !1,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
  },
  // React Native 配置
  rn: {
    appName: TARO_APP_NAME,
    postcss: {
      cssModules: {
        enable: !1,
      },
    },
  },
};

export default config;
