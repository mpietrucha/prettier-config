import config from '@'
import isObject from 'lodash.isobject'
import noop from 'lodash.noop'
import { resolveConfig } from 'prettier'

export default class Config {
    constructor(runtime = {}, base = config) {
        this.base = base
        this.runtime = runtime

        this.cache = new Map()
    }

    async file(file) {
        if (!file) {
            return {}
        }

        if (this.cache.has(file)) {
            return this.cache.get(file)
        }

        const config = await resolveConfig(file).catch(noop)

        if (!config) {
            return this.file()
        }

        this.cache.set(file, config)

        return config
    }

    async get({ cache = {}, file = false, runtime = true, base = true } = {}) {
        const output = {}

        if (base) {
            isObject(this.base) && Object.assign(output, this.base)
        }

        if (file) {
            Object.assign(output, await this.file(file))
        }

        if (runtime) {
            isObject(this.runtime) && Object.assign(output, this.runtime)
        }

        if (isObject(cache)) {
            Object.assign(output, cache)
        }

        return output
    }
}
