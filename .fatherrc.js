import { defineConfig } from 'father';

export default defineConfig({
  plugins: ['@rc-component/father-plugin'],
  targets: {
    chrome: 51, // es2015, aligned with @ctrl/tinycolor
  },
});
