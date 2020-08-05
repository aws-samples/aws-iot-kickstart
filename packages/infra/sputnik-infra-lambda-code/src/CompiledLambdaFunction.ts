import * as path from 'path'
import { sync as findup } from 'find-up'
import { Duration, Construct } from '@aws-cdk/core'
import { Runtime, SingletonFunction, SingletonFunctionProps, IFunction, L } from '@aws-cdk/aws-lambda'
import { NpmDependenciesLambdaLayer } from './layers/NpmDependenciesLambdaLayer'
import { SputnikLibraryLambdaLayer } from './layers/SputnikLibraryLambdaLayer'

export function lambdaPath (name: string): string {
	const dist = findup('dist', { cwd: __dirname, type: 'directory' })

	if (dist == null) {
		throw new Error(`Failed to find "dist" folder for @lambda/${name} from "${__dirname}"`)
	}

	return path.join(dist, '@lambda', `${name}.zip`)
}

export interface LambdaEnvironment {
	[key: string]: string
}

export interface LambdaProps<TEnvironment extends LambdaEnvironment> extends Omit<SingletonFunctionProps,
	'code' | 'environment' | 'runtime' | 'functionName' | 'description' | 'uuid' | 'handler'
> {
	readonly environment: TEnvironment
	readonly handler?: string
}

export interface CompiledLambdaProps<TEnvironment extends LambdaEnvironment> extends Omit<SingletonFunctionProps,
	'environment'
> {
	readonly environment: TEnvironment
}

export class CompiledLambdaFunction<TEnvironment extends LambdaEnvironment>
	extends SingletonFunction
	implements IFunction {
	constructor (scope: Construct, id: string, props: LambdaProps<TEnvironment>) {
		// Set defaults
		props = Object.assign({
			timeout: Duration.seconds(10),
			memorySize: 256,
			handler: 'index.handler',
			runtime: Runtime.NODEJS_12_X,
			layers: [
				NpmDependenciesLambdaLayer.getLayer(scope),
				SputnikLibraryLambdaLayer.getLayer(scope),
			],
		}, props)
		super(scope, id, props as unknown as SingletonFunctionProps)
	}
}
