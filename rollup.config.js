import resolve from '@rollup/plugin-node-resolve';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import commonjs from '@rollup/plugin-commonjs';
import {babel} from '@rollup/plugin-babel';

// Note: Order of plugins are important here - https://rollupjs.org/guide/en/#build-hooks
const basePlugins = [
  commonjs(),
  nodePolyfills(),
  resolve({browser: true, extensions: ['.js', '.ts']}),
  babel({babelHelpers: 'runtime', plugins: ['@babel/plugin-transform-runtime']}),
];

export default {
  input: 'dist/transpiled/index.js',
  output: [
    {format: 'esm', dir: 'dist/esm'},
    {format: 'umd', name: 'webrtcCore', file: './samples/bundle.js'},
  ],
  external: [/@babel\/runtime/],
  plugins: basePlugins,
  watch: {include: 'src/**'},
};
