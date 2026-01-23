// babel-preset-taro 更多选项和默认值：
// https://docs.taro.zone/docs/next/babel-config
module.exports = {
  plugins: [
    ['import', {
      libraryName: 'react-use',
      camel2DashComponentName: !1,
      customName(/** @type {string} */ name) {
        const libraryDirectory = name.startsWith('Use')
          ? 'lib/component'
          : name.startsWith('create')
            ? 'lib/factory'
            : 'lib';
        return `react-use/${libraryDirectory}/${name}`;
      },
    }, 'react-use'],
    ['import', {
      libraryName: '@nutui/nutui-react-taro',
      camel2DashComponentName: !1,
      customStyleName(/** @type {string} */ name) {
        return `@nutui/nutui-react-taro/dist/es/packages/${name.toLowerCase()}/style`;
      },
      customName(/** @type {string} */ name) {
        return `@nutui/nutui-react-taro/dist/es/packages/${name.toLowerCase()}`;
      },
    }, 'nutui-react'],
  ],
  presets: [
    ['taro', {
      framework: 'react',
      ts: !0,
      compiler: 'webpack5',
    }],
  ],
};
