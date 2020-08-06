import { AssetOptions } from '@aws-cdk/aws-s3-assets'
import { Construct } from '@aws-cdk/core'
import { isAbsolute, basename, join, dirname } from 'path'
// @ts-ignore
import { unique as shorthash } from 'shorthash'
import { getRootStack } from '../../../utils/cdk-identity-utils'
import { Source, SourceConfig, ISource } from '@aws-cdk/aws-s3-deployment'
import { lstatSync, existsSync, mkdirSync } from 'fs'
import { execSync } from 'child_process'

const CDKOUT = process.env.CDK_OUTPUT_DIR || join(__dirname, '../../../../cdk.out')

export interface ZipSourceProps extends AssetOptions {

	/**
	 * The path to the directory to package into a zip file
	 */
	path: string
}

/**
 * Zip provided folder before deploying it to S3 with aws-s3-deployment.
 * This will allow you to compress a folder to a zip file and upload it to S3 as a zip file.
 */
export class ZipSource extends Construct {
	static fromFolder (scope: Construct, path: string, options?: AssetOptions): ZipSource {
		if (!isAbsolute(path)) {
			throw new Error(`NpmCode only support absolute paths: ${path}`)
		}

		const id = `NpmCode-${shorthash(path)}`

		const rootStack = getRootStack(scope)

		// Ensure single NpmCode asset per path
		let zipSource = rootStack.node.tryFindChild(id) as ZipSource

		if (zipSource == null) {
			// Scope the code to the root stack so not dependent on specific child
			zipSource = new ZipSource(rootStack, id, { ...options, path })
		}

		// add a dependendency on instance for scope to make sure npm install occurs before prepare called
		scope.node.addDependency(zipSource)

		return zipSource
	}

	readonly path: string

	readonly outputDir: string

	readonly outputFile: string

	readonly isInline: boolean = false

	readonly _assetSource: ISource

	constructor (scope: Construct, id: string, props: ZipSourceProps) {
		super(scope, id)

		const { path, ...options } = props

		this.path = path
		this.outputDir = join(CDKOUT, 'tmp', basename(path))
		this.outputFile = `${basename(path)}.zip`

		if (!existsSync(this.outputDir)) {
			mkdirSync(this.outputDir, { recursive: true })
		}

		this.runCmd()

		this._assetSource = Source.asset(this.outputDir, options)
	}

	public bind (scope: Construct): SourceConfig {
		return this._assetSource.bind(scope)
	}

	private runCmd (): void {
		const dir = this.path

		// Ensure path is directory
		if (!lstatSync(dir).isDirectory()) {
			throw new Error('ZipSource path must be a directory!')
		}

		const cmd = `zip -r -FS -X "${join(this.outputDir, this.outputFile)}" "./${basename(this.path)}"`
		const cwd = dirname(this.path)

		console.log(`ZipSource: running "${cmd}" for asset:`, dir)
		execSync(cmd, { cwd })

		// Ensure zip file was created correctly in cdk.out
		if (!existsSync(join(this.outputDir, this.outputFile))) {
			throw new Error(`ZipSource failed to create zip file from directory "${dir}"`)
		}

		console.log('ZipSource: successfully packaged directory:', dir)
	}
}
