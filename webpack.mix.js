const path = require('path')
const mix = require('laravel-mix')
const package = require('./package.json')

mix.options({
    manifest: false,
})

mix.webpackConfig({
    target: 'node',
    output: {
        globalObject: 'this',
        library: {
            name: package.name,
            type: 'umd',
        },
    },
    externals: '@prettier/sync'
})

mix.alias({
    '~': __dirname,
    '@': path.join(__dirname, 'src'),
})

const bundles = ['src/index.js', 'src/builder.js']

bundles.forEach(bundle => mix.js(bundle, 'dist'))
