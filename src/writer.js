import Config from '@/config'
import { readFile, writeFile } from 'fs/promises'
import { glob } from 'glob'
import { format } from 'prettier'

const ignore = ['**/.git/**', '**/node_modules/**']

export default class Writer {
    constructor(options) {
        this.config = new Config()

        this.using({ ignore }).using(options)
    }

    using(options = {}) {
        this.options ||= {}

        this.options = { ...this.options, ...options }

        return this
    }

    async all(config = {}) {
        const write = this.write.bind(this)

        const files = await glob('**/**', {
            nodir: true,
            cwd: this.options.root,
            ignore: this.options.ignore,
        }).then(files => files.map(write))

        await Promise.all(files)
    }

    async write(file, config = {}) {
        await this.options.before?.(file)

        const source = await readFile(file, 'utf8')

        const configuration = await this.config.get({ config })

        const content = await format(source, {
            filepath: file,
            ...configuration,
        })

        await writeFile(file, content)

        await this.options.after?.(file)
    }
}
