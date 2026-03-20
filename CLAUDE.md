# CLAUDE.md

本文档为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

这是一个 **基于 Taro 的跨平台小程序项目**，使用 React 18。只需编写一次代码，即可编译到微信小程序、H5、React
Native、支付宝、百度、QQ、京东和鸿蒙系统。

## 常用命令

```bash
# 开发模式（监听模式）
npm run dev:weapp      # 微信小程序
npm run dev:h5         # H5/Web
npm run dev:rn         # React Native
npm run dev:alipay     # 支付宝
npm run dev:swan       # 百度
npm run dev:tt         # 字节/抖音
npm run dev:qq         # QQ
npm run dev:jd         # 京东
npm run dev:harmony-hybrid    # 鸿蒙混合

# 生产构建
npm run build:weapp    # 微信小程序
npm run build:h5       # H5/Web
npm run build:rn       # React Native
npm run build:alipay   # 支付宝
npm run build:swan     # 百度
npm run build:tt       # 字节/抖音
npm run build:qq       # QQ
npm run build:jd       # 京东
npm run build:harmony-hybrid  # 鸿蒙混合
```

## 架构

### 目录结构

```
src/
├── app.jsx              # 根组件
├── app.config.js       # 小程序页面、窗口、导航栏配置
├── app.scss            # 全局样式
├── assets/             # 静态资源
├── components/         # 通用组件
├── constants/          # 常量
├── hocs/               # 高阶组件
├── hofs/               # 高阶函数
├── hooks/              # 自定义 Hooks
├── pages/              # 页面组件
├── utils/              # 工具函数
├── index.html          # 入口 HTML
config/                 # Taro 构建配置（基于 Vite）
types/                  # TypeScript 类型定义
```

### 开发规范

#### 请求模式

每个页面有对应的 `*.service.js` 文件：

```
import { safeRequest } from '@/utils';

export const query = (params) => (
  safeRequest.Get(`/xxx/_query`, { params })
);

export default { query };
```

### 关键模式

**HTTP 请求** (`src/utils/safeRequest.ts`):

- 使用 `alova` + `@alova/adapter-axios` 发送请求
- 自动从 Token 存储注入 `satoken` 请求头
- 401 响应会清除 Token 并触发跳转
- 通过响应头处理 Token 刷新

**高阶函数** (`src/hofs/`):

- `withResponse` - 响应包装器，校验 `success` 后执行回调

**工具函数** (`src/utils/`):

- `hasValue` / `isNil` / `isNilOrEmpty` - 空值判断
- `safeEq` - 安全相等比较
- `token` - Token 管理
- `delay` - 延迟函数

**状态管理**:

- `react-use` - React Hooks 工具库
- `valtio` - 基于代理的状态管理

**UI 组件**:

- `@nutui/nutui-react-taro` - Taro 优化的组件库
- `@nutui/icons-react-taro` - 图标组件库
- `tailwindcss` - 原子化 CSS
- 样式使用 SASS，包含 NutUI 变量

**CSS 处理**:

- `babel-plugin-import` - 按需导入组件样式
- `autoprefixer` - H5 自动添加 CSS 前缀
- `clsx` - 类名拼接工具

**工具库**:

- `lodash-es` - 工具函数集合（ESM 版本）

### 配置文件

- `config/config.ts` - Taro 主配置（编译器、框架、插件）
- `config/postcss.config.js` - PostCSS 配置（TailwindCSS、Autoprefixer）
- `tailwind.config.js` - TailwindCSS 配置
- `src/app.config.js` - 小程序应用配置（页面、窗口）
- `tsconfig.json` - TypeScript 配置，包含路径别名（`@/*`）
- `.env.development` - 开发环境变量
- `.env.production` - 生产环境变量

### CSS 单位转换规则

| 平台    | px 转换     | NutUI 基准 |
|-------|-----------|----------|
| H5    | px -> rem | 750px    |
| 小程序   | px -> rpx | 750px    |
| NutUI | 375px     | -        |

- NutUI 组件样式无需转换（已在设计稿 375px 基准下）
