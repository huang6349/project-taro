const {
  TARO_APP_COLOR,
  TARO_APP_NAME,
} = process.env;

export default defineAppConfig({
  pages: [
    'pages/index/index',
  ],
  window: {
    navigationBarBackgroundColor: TARO_APP_COLOR,
    navigationBarTextStyle: 'white',
    navigationBarTitleText: TARO_APP_NAME,
    backgroundColor: '#f7f8fa',
    backgroundTextStyle: 'dark',
    backgroundColorTop: '#f7f8fa',
    backgroundColorBottom: '#f7f8fa',
  },
});
