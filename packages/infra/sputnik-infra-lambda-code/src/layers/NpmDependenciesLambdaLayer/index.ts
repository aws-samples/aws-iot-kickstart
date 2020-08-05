import { Construct, Stack } from '@aws-cdk/core'
import { Code, AssetCode } from '@aws-cdk/aws-lambda'
import { lambdaPath, CompiledLambdaLayer, CompiledLambdaLayerProps } from '../../CompiledLambdaLayer'

function getRootStack (scope: Construct): Stack {
	let stack: Stack = Stack.of(scope)

	while (stack.parentStack != null) {
		stack = stack.parentStack
	}

	return stack
}

// TODO: read from package.json
const PACKAGE_NAME = 'layer-npm-dependencies'

export class NpmDependenciesLambdaLayer extends CompiledLambdaLayer {
	static get codeAsset (): AssetCode {
		return Code.fromAsset(lambdaPath(PACKAGE_NAME))
	}

	static private _instance: NpmDependenciesLambdaLayer

	static getLayer (scope: Construct): NpmDependenciesLambdaLayer {
		if (NpmDependenciesLambdaLayer._instance == null) {
			NpmDependenciesLambdaLayer._instance = new NpmDependenciesLambdaLayer(getRootStack(scope), PACKAGE_NAME)
		}

		return NpmDependenciesLambdaLayer._instance
	}

	private constructor (scope: Construct, id: string) {
		super(scope, id, {
			code: NpmDependenciesLambdaLayer.codeAsset,
			description: 'Npm dependencies for sputnik lambdas',
  		license: 'Apache-2.0',
		})
	}
}
