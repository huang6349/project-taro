/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  plugins: [],
  theme: { extend: {} },
  corePlugins: {
    preflight: process.env.TARO_ENV === 'h5'
      || process.env.TARO_ENV === 'harmony'
      || process.env.TARO_ENV === 'rn',
  },
};
