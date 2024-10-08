import defaults from '@/index.js'
import prettier from '@prettier/sync'

const config = path => prettier.resolveConfig(path) || {}

const build = (path, options = {}) => ({ ...options, ...config(path), ...defaults })

export default { build, config, prettier }
