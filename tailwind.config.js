/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  plugins: [],
  theme: { extend: {} },
  corePlugins: {
    // 小程序不需要 preflight
    preflight: process.env.TARO_ENV === 'h5'
      || process.env.TARO_ENV === 'harmony'
      || process.env.TARO_ENV === 'rn',
  },
};
