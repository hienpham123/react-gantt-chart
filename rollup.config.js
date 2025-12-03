import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default {
  input: 'src/lib/index.js',
  output: [
    {
      file: packageJson.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    {
      file: packageJson.module,
      format: 'esm',
      sourcemap: true,
      exports: 'named',
    },
  ],
  external: ['react', 'react-dom', 'prop-types'],
  plugins: [
    resolve({
      browser: true,
    }),
    commonjs(),
    postcss({
      extract: true,
      minimize: true,
    }),
  ],
};

