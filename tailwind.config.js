/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  plugins: [],
  theme: {
    extend: {
      transitionTimingFunction: {
        'ios': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
      transitionDuration: {
        '250': '250ms',
      },
    },
  },
  corePlugins: {
    // 小程序不需要 preflight
    preflight: process.env.TARO_ENV === 'h5'
      || process.env.TARO_ENV === 'harmony'
      || process.env.TARO_ENV === 'rn',
  },
};
