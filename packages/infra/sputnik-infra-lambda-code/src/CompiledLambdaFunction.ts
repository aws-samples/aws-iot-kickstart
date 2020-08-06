import * as path from 'path'
import { sync as findup } from 'find-up'
import { Duration, Construct } from '@aws-cdk/core'
import { Runtime, Function, FunctionProps, IFunction } from '@aws-cdk/aws-lambda'
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

export interface DependencyProps<TDependencies> {
	readonly dependencies: TDependencies
}

export interface ExposedLambdaProps<TDependencies> extends Omit<FunctionProps,
	'code' | 'environment' | 'runtime' | 'functionName' | 'description' | 'handler' | 'role' | 'initialPolicy'
> {
	readonly dependencies: TDependencies
}

export interface CompiledLambdaProps<TEnvironment extends LambdaEnvironment> extends Omit<FunctionProps,
	'environment' | 'runtime' | 'handler'
> {
	readonly environment: TEnvironment
	readonly handler?: string
	readonly runtime?: Runtime
}

export class CompiledLambdaFunction<TEnvironment extends LambdaEnvironment>
	extends Function
	implements IFunction {
	constructor (scope: Construct, id: string, props: CompiledLambdaProps<TEnvironment>) {
		// Set defaults
		props = Object.assign({
			timeout: Duration.seconds(10),
			memorySize: 256,
			handler: 'index.handler',
			runtime: Runtime.NODEJS_12_X,
			layers: [
				SputnikLibraryLambdaLayer.getLayer(scope),
				...props.layers || [],
			],
		}, props)
		super(scope, id, props as unknown as FunctionProps)
	}
}
