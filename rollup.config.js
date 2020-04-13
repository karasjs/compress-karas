import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';

export default [{
  input: 'src/index.js',
  output: {
    file: 'index.js',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [
    babel({
      exclude: 'node_modules/**', // 只编译我们的源代码
      runtimeHelpers: true
    }),
  ],
}, {
  input: 'src/index.js',
  output: {
    file: 'index.min.js',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [
    babel({
      exclude: 'node_modules/**' // 只编译我们的源代码
    }),
    uglify({
      sourcemap: true,
    }),
  ],
}];
