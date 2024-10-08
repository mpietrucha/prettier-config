import defaults from '@/index.js'
import prettier from '@prettier/sync'

export const config = path => prettier.resolveConfig(path) || {}

export const build = (path, options = {}) => ({
    ...options,
    ...config(path),
    ...defaults,
})

export default build
