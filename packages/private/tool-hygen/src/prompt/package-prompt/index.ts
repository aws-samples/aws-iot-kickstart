/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-useless-escape */
/* eslint-disable no-template-curly-in-string */
import { isString } from 'lodash'
import { valid as validateSemver, SemVer } from 'semver'
// @ts-ignore
import Snippet from 'enquirer/lib/prompts/snippet'
import { getPromptStoreValues, setPromptStoreValues } from '../store'

const STORE_KEY = 'package-snippet'

interface Options {
	readonly packageDir: string
  readonly scope: string
  readonly license: 'Apache-2.0' | 'UNLICENSED'
  readonly message?: string
  readonly noAuthor?: boolean
  readonly defaults?: {
    readonly version?: string
    readonly emailDomain?: string
    readonly homepage?: string
    readonly repository?: string
  }
  readonly prefix: boolean | string
}

export class PackagePrompt extends Snippet {
	value: any

	packageOptions: Options

	constructor (options: Options) {
		super({
			name: 'package',
			message: options.message || 'Fill out the fields in package.json',
			required: true,
			fields: [
				{
					name: 'version',
					validate (value: string | SemVer | null | undefined, state: any, item: { name: string, }, index: any): any {
						if (item && item.name === 'version' && !validateSemver(value)) {
							return 'version should be a valid semver value'
						}

						return true
					},
				},
			],
			async template () {
				const store = await getPromptStoreValues(STORE_KEY)

				const defaults = {
					...options.defaults || {},
					version: options.defaults?.version || '0.0.0-alpha.0',
					license: options.license,
					author_name: store.author_name || process.env.USER,
					author_email: store.author_email || `${process.env.USER}@${options.defaults?.emailDomain || 'example.com'}`,
				}

				let prefixField = ''

				if (isString(options.prefix)) {
					prefixField = `\${prefix:${options.prefix}}-`
				} else if (options.prefix !== false) {
					prefixField = '${prefix}-'
				}

				return `{
  "name": "${options.scope}/${prefixField}\${name}'}",
  "description": "\${description}",
  "version": "\${version:${defaults.version}}",
  "license": "\${license:${defaults.license}}",
  ${options.noAuthor ? '' : `"author": "\${author_name:${defaults.author_name}} <\${author_email:${defaults.author_email}}>",`}
  ...
}
  `
			},
		})

		this.packageOptions = options
	}

	result (value: any) {
		value = super.result(value)

		console.log('VALUE:', value)

		const { scope, noAuthor, packageDir } = this.packageOptions
		const { values } = value
		const { prefix, name, author_name, author_email, homepage, repository } = values

		if (homepage) {
			values.homepage = unescape(homepage)
		}

		if (repository) {
			values.repository = unescape(repository)
		}

		const packageName = prefix ? `${scope}/${prefix}-${name}` : `${scope}/${name}`

		const result = {
			...values,
			private: packageDir === 'private',
			packageScope: scope,
			noAuthor,
			packageName,
			packageDir: `packages/${packageDir}/${name}`,
			author: `${author_name} <${author_email}>`,
		}

		setPromptStoreValues(STORE_KEY, result)

		return result
	}
}
