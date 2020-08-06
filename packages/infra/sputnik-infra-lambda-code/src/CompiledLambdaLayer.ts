import * as path from 'path'
import { sync as findup } from 'find-up'
import { Construct } from '@aws-cdk/core'
import { Runtime, LayerVersion, LayerVersionProps } from '@aws-cdk/aws-lambda'

export function lambdaPath (name: string): string {
	const dist = findup('dist', { cwd: __dirname, type: 'directory' })

	if (dist == null) {
		throw new Error(`Failed to find "dist" folder for @lambda/${name} from "${__dirname}"`)
	}

	return path.join(dist, '@lambda', `${name}.zip`)
}

export class CompiledLambdaLayer extends LayerVersion {
	constructor (scope: Construct, id: string, props: LayerVersionProps) {
		// Set defaults
		props = Object.assign({
			compatibleRuntimes: [
				Runtime.NODEJS_10_X,
				Runtime.NODEJS_12_X,
			],
		}, props)
		super(scope, id, props as unknown as LayerVersionProps)
	}
}
