import json from '@rollup/plugin-json'
import { terser } from 'rollup-plugin-terser'
import typescript from '@rollup/plugin-typescript'

import { dependencies } from './package.json'

const external = Object.keys(dependencies || '')
const globals = external.reduce((prev, current) => {
  const newPrev = prev

  newPrev[current] = current
  return newPrev
}, {})

export default {
  input: './src/index.ts',
  output: {
    file: './lib/index.js',
    format: 'cjs',
    banner: '#!/usr/bin/env node',
    globals,
  },
  external,
  plugins: [
    typescript({
      exclude: 'node_modules/**',
    }),
    json(),
    terser(),
  ],
}
