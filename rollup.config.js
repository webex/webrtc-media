import resolve from '@rollup/plugin-node-resolve';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import commonjs from '@rollup/plugin-commonjs';

const basePlugins = [
  nodePolyfills(),
  resolve({browser: true, extensions: ['.js', '.ts']}),
  commonjs(),
];

export default {
  input: 'dist/transpiled/index.js',
  output: [
    {format: 'esm', dir: 'dist/esm'},
    {format: 'umd', name: 'webrtcCore',file:'./samples/index.js'},
  ],
  plugins: basePlugins,
  watch: {include: 'src/**'},
};
