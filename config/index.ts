import { defineConfig } from '@tarojs/cli';
import prodConfig from './config.prod';
import devConfig from './config.dev';
import config from './config';
import isDev from './isDev';

export default defineConfig<'vite'>((merge) => (
  merge({}, config, (isDev ? devConfig : prodConfig))),
);
