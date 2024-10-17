import Config from '@/config'
import { Cache } from 'file-system-cache'
import { existsSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import { glob } from 'glob'
import { hash } from 'hasha'
import noop from 'lodash.noop'
import { minimatch } from 'minimatch'
import { dirname, join, resolve } from 'path'
import { format } from 'prettier'

export default class Writer {
    constructor(options = {}) {
        const {
            cwd = process.cwd(),
            ignore = ['**/.git/**', '**/node_modules/**'],
            cache = ((cache = '.cache') => {
                const local = dirname(import.meta.dirname)

                return resolve(local, cache)
            })(),
        } = options

        if (!cwd) {
            throw new Error('Writer `options.cwd` must be present.')
        }

        this.cwd = `${cwd}`

        this.config = new Config()

        this.ignore = new Set([ignore].flat().filter(String))

        if (!cache) {
            return
        }

        this.cache = new Cache({
            basePath: cache,
        })

        this.ignore.add(join(cache, '/**'))
    }

    ignored(without) {
        const ignored = [...this.ignore.values()]

        if (!Array.isArray(without)) {
            return ignored
        }

        return ignored.filter(ignore => !without.includes(ignore))
    }

    ignoring(file, without) {
        return this.ignored(without).find(ignore => minimatch(file, ignore))
    }

    async hash(content) {
        return await hash(content, {
            algorithm: 'md5',
        })
    }

    async read(file) {
        if (!existsSync(file)) {
            return
        }

        if (this.ignoring(file)) {
            return
        }

        const content = await readFile(file, 'utf8')

        const cache = await this.cache?.get(file)

        const hash = cache && (await this.hash(content))

        if (cache && cache === hash) {
            return
        }

        return content
    }

    async save(file, content) {
        await writeFile(file, content)

        await this.cache?.set(file, await this.hash(content))

        return file
    }

    async all(config = {}) {
        const write = this.write.bind(this)

        const files = await glob('**/**', {
            nodir: true,
            cwd: this.cwd,
            absolute: true,
            ignore: this.ignored(),
        })

        await Promise.all(files.map(write))

        return files
    }

    async write(file, config = {}) {
        const source = await this.read(file)

        if (!source) {
            return
        }

        const configuration = await this.config.get({ config })

        const content = await format(source, {
            filepath: file,
            ...configuration,
        }).catch(noop)

        content && (await this.save(file, content))

        return !!content
    }
}
