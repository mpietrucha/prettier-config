import { resolve } from 'path'
import { defineConfig } from 'vite'
import { dependencies } from './package.json'

export default defineConfig({
    resolve: {
        alias: {
            '~': resolve(__dirname),
            '@': resolve(__dirname, 'src'),
        },
    },
    build: {
        lib: {
            entry: [resolve(__dirname, 'src/index.js'), resolve(__dirname, 'src/builder.js')],
        },
        rollupOptions: {
            external: Object.keys(dependencies),
        },
    },
})
