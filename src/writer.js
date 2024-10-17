import Config from '@/config'
import Cache from 'file-system-cache'
import { existsSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import { glob } from 'glob'
import { hash } from 'hasha'
import { resolve } from 'path'
import { format } from 'prettier'

const config = config => new Config(config)

const cache = basePath => {
    if (!basePath) {
        return
    }

    return new Cache({ basePath })
}

export default class Writer {
    constructor(options) {
        this.using({
            ignore: ['**/.git/**', '**/node_modules/**'],
            cache: resolve(import.meta.dirname, '.cache'),
        })

        this.using(options)

        this.config = config()

        this.cache = cache(this.options.cache)
    }

    using(options = {}) {
        this.options ||= {}

        this.options = { ...this.options, ...options }
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
    }

    async all(config = {}) {
        const write = this.write.bind(this)

        const files = await glob('**/**', {
            nodir: true,
            absolute: true,
            cwd: this.options.root,
            ignore: this.options.ignore,
        }).then(files => files.map(write))

        await Promise.all(files)
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
        })

        await this.save(file, content)
    }
}
