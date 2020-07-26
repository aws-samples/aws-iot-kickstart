/* eslint-disable @typescript-eslint/camelcase */
import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'
import { FileSystem, SymlinkFollowMode } from '@aws-cdk/core/lib/fs'

const ASSET_ROOT = process.env.CDK_OUTDIR as string

export interface BundlingOptions {
	readonly output?: string
	readonly stdout?: 'ignore' | 'inherit'
}

export function bundleAsset (sourcePath: string, cmd: string, options?: BundlingOptions): string {
	const { output, stdout = 'ignore' } = options || {}

	if (!path.isAbsolute(sourcePath)) {
		throw new Error(`Bundle only support absolute paths: ${sourcePath}`)
	}

	try {
		const sourceHash = FileSystem.fingerprint(sourcePath, { follow: SymlinkFollowMode.ALWAYS })

		// Only run command when hash changes
		const outDir = path.join(ASSET_ROOT, `asset.${sourceHash}`)

		fs.lstatSync(outDir).isDirectory()
	} catch (error) {
		// Quite noisy logs regarding dependencies
		const env: any = {
			...process.env,
			npm_config_production: 'true',
			npm_config_fund: 'false',
			npm_config_audit: 'false',
		}

		execSync(cmd, { env, cwd: sourcePath, stdio: [stdout, stdout, 'inherit'] })
	}

	return !output ? sourcePath : path.isAbsolute(output) ? output : path.join(sourcePath, output)
}
