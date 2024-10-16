import { resolve } from 'path'
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
    declaration: false,
    alias: {
        '~': __dirname,
        '@': resolve(__dirname, 'src'),
        '@lol': __dirname,
    },
    rollup: {
        inlineDependencies: true,
    },
})
