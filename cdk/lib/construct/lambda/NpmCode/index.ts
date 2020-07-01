/* eslint-disable @typescript-eslint/camelcase */
import * as fs from 'fs'
import * as path from 'path'
import { parse as parseIni } from 'ini'
import { execSync } from 'child_process'
import { AssetCode, Code, CodeConfig, ResourceBindOptions } from '@aws-cdk/aws-lambda'
import { AssetOptions } from '@aws-cdk/aws-s3-assets'
import { FollowMode } from '@aws-cdk/assets'
import { FileSystem, SymlinkFollowMode } from '@aws-cdk/core/lib/fs'
import { Construct, CfnResource } from '@aws-cdk/core'
// @ts-ignore not sure why declaration in @types/shorthash is not working during cdk build
import { unique as shorthash } from 'shorthash'
import { getRootStack } from '../../../utils/cdk-identity-utils'
import { ISource, SourceConfig } from '@aws-cdk/aws-s3-deployment'
import { Bucket } from '@aws-cdk/aws-s3'

const TRUE = /(true|1)/i

const ASSET_ROOT = process.env.CDK_OUTDIR as string

const VERBOSE = TRUE.test(String(process.env.CDK_NPMCODE_VERBOSE))
const STDOUT = VERBOSE ? 'inherit' : 'ignore'

export interface NpmCodeProps extends AssetOptions {
	/**
	 * The path to directory containing npm package.json with lambda code to install and bundle into zip.
	 */
	path: string

	/**
	 * Npm command to call to install npm.
	 * @defalt `npm install`
	 */
	cmd?: string

	/**
	 * Specifies path of directory or file to zip as asset. Defaults for entire source folder.
	 */
	artifact?: string
}

/**
 * Auto install npm package code before zipping directory for usage as lambda code asset.
 */
export class NpmCode extends Construct {
	/**
	 * Loads the function code from local directory and runs `npm install --production` on the directory.
	 *
	 * @param sourcePath Directory with the Lambda code and package.json
	 */
	static fromNpmPackageDir (scope: Construct, sourcePath: string, options?: AssetOptions): NpmCode {
		if (!path.isAbsolute(sourcePath)) {
			throw new Error(`NpmCode only support absolute paths: ${sourcePath}`)
		}

		const id = `NpmCode-${shorthash(sourcePath)}`

		const rootStack = getRootStack(scope)

		// Ensure single NpmCode asset per path
		let npmCode = rootStack.node.tryFindChild(id) as NpmCode

		if (npmCode == null) {
			// Scope the code to the root stack so not dependent on specific child
			npmCode = new NpmCode(rootStack, id, { ...options, path: sourcePath })
		}

		// add a dependendency on instance for scope to make sure npm install occurs before prepare called
		scope.node.addDependency(npmCode)

		return npmCode
	}

	readonly cmd: string
	readonly path: string
	readonly isInline: false
	readonly assetCode: AssetCode

	private readonly _sourceHash: string

	constructor (scope: Construct, id: string, props: NpmCodeProps) {
		super(scope, id)

		const { path: sourcePath, artifact, ...options } = props

		this.path = sourcePath
		this.cmd = props.cmd || 'npm install --production'

		const assetPath = artifact ? path.join(sourcePath, artifact) : sourcePath

		this._sourceHash = FileSystem.fingerprint(assetPath, { follow: SymlinkFollowMode.ALWAYS })

		// Only run command when hash changes
		const outDir = path.join(ASSET_ROOT, `asset.${this._sourceHash}`)

		try {
			fs.lstatSync(outDir).isDirectory()

			VERBOSE && console.log('NpmCode: asset already cached for hash:', sourcePath, outDir)
		} catch (error) {
			// Unfortunately we have to run this in constructor because hashing is done during before prepare,
			// which cause hash to be based on pre-cmd. If this gets published to cdk staging, it will be locked
			// and uable to deploy update of post-cmd results. So we need to run the cmd here so the hash
			// matches the final output.
			this.runCmd()
		}

		this.assetCode = Code.fromAsset(assetPath, { follow: FollowMode.ALWAYS, ...options })
	}

	public bind (scope: Construct): CodeConfig {
		return this.assetCode.bind(scope)
	}

	public bindToResource (resource: CfnResource, options: ResourceBindOptions = { }): void {
		return this.assetCode.bindToResource(resource, options)
	}

	public asSource (): ISource {
		const bind = (scope: Construct): SourceConfig => {
			const codeConfig = this.bind(scope)
			const bucketName = codeConfig.s3Location?.bucketName as string
			const objectKey = codeConfig.s3Location?.objectKey as string

			return {
				bucket: Bucket.fromBucketName(scope, `Source_${this.path}`, bucketName),
				zipObjectKey: objectKey,
			}
		}

		return {
			bind,
		}
	}

	private runCmd (): void {
		const dir = this.path

		// Ensure path is directory with package.json file
		if (!fs.lstatSync(path.join(dir, 'package.json')).isFile()) {
			throw new Error(`NpmCode path must be a directory with package.json file: ${dir}/package.json is missing!`)
		}

		// Quite noisy logs regarding dependencies
		const env: any = {
			...process.env,
			npm_config_production: 'true',
			npm_config_fund: 'false',
			npm_config_audit: VERBOSE ? 'true' : 'false',
		}

		// Check if package has local .npmrc config file to use
		try {
			const npmrc = parseIni(fs.readFileSync(path.join(dir, '.npmrc'), 'utf-8'))

			// Only supporting a few configs for now... need to add full support
			Object.entries(npmrc).forEach(([key, value]): void => {
				switch (key) {
					case 'package-lock':
						env['npm_config_package_lock'] = String(value)
						break
					default:
						console.warn('NpmCode: ignoring unsupported .npmrc config:', key, value)
						break
				}
			})
		} catch (error) {
			// ignore
		}

		const packageJson = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'))

		console.log(`NpmCode: running "${this.cmd}" for code asset:`, dir)
		execSync(this.cmd, { env, cwd: dir, stdio: [STDOUT, STDOUT, 'inherit'] })

		// Ensure node_modules was created correctly in directory, unless no dependencies in package
		if (Object.keys(packageJson.dependencies || {}).length !== 0 && !fs.lstatSync(path.join(dir, 'node_modules')).isDirectory()) {
			console.warn('NpmCode: package.json:', dir, packageJson)
			throw new Error(`NpmCode failed to create node_modules directory for "${dir}"`)
		}

		if (VERBOSE) {
			execSync('tree --link -a -l 2', { cwd: dir, stdio: 'inherit' })
		}

		console.log('NpmCode: successfully installed package:', dir)
	}
}
