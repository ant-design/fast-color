import { defineConfig } from 'father';

export default defineConfig({
  plugins: ['@rc-component/father-plugin'],
  targets: {
    chrome: 74, // es2015, aligned with @ctrl/tinycolor
  },
});
