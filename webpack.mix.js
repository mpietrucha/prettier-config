const mix = require('laravel-mix')
const package = require('./package.json')

mix.options({
    manifest: false
})

mix.webpackConfig({
    output: {
        libraryTarget: 'umd',
        globalObject: 'this',
        library: package.name
    }
})

;['src/index.js', 'src/builder.js'].forEach(source => mix.js(source, 'dist'))
