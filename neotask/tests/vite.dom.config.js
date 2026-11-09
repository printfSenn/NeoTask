import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export default {
  root,
  plugins: [react()],
  logLevel: 'warn',
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    outDir: '/tmp/nt-iife',
    emptyOutDir: true,
    minify: false,
    lib: { entry: path.join(root, 'src/main.jsx'), formats: ['iife'], name: 'NeoTaskApp', fileName: () => 'app.js' }
  }
}
