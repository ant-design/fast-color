import { defineConfig } from 'father';

export default defineConfig({
  plugins: ['@rc-component/father-plugin'],
  targets: {
    // It's annoying ts will add prop def in class.
    // We have to use low version to compatible with this
    // Since some user not upgrade their webpack.
    chrome: 73,
  },
});
