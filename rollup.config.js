import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import nodePolyfills from 'rollup-plugin-polyfill-node';

// Note: Order of plugins are important here - https://rollupjs.org/guide/en/#build-hooks
const basePlugins = [
  commonjs(),
  nodePolyfills(),
  resolve({browser: true, extensions: ['.js', '.ts']}),
];

export default {
  input: 'dist/transpiled/index.js',
  output: [
    {format: 'esm', dir: 'dist/esm'},
    {format: 'umd', name: 'webrtcCore', file: './samples/bundle.js'},
  ],
  plugins: basePlugins,
  watch: {include: 'src/**'},
};
