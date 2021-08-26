// rollup.config.js
import commonjs from '@rollup/plugin-commonjs';


export default {
  input: 'src/index.js',
  output: {
    file: 'lib/build.js',
    format: 'umd',
    name: 'bodymovin-to-smil',
  },
  plugins: [
    commonjs(),
  ]
};