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
const PACKAGE_NAME = 'layer-sputnik-library'

export class SputnikLibraryLambdaLayer extends CompiledLambdaLayer {
	static get codeAsset (): AssetCode {
		return Code.fromAsset(lambdaPath(PACKAGE_NAME))
	}

	static private _instance: SputnikLibraryLambdaLayer

	static getLayer (scope: Construct): SputnikLibraryLambdaLayer {
		if (SputnikLibraryLambdaLayer._instance == null) {
			SputnikLibraryLambdaLayer._instance = new SputnikLibraryLambdaLayer(getRootStack(scope), PACKAGE_NAME)
		}

		return SputnikLibraryLambdaLayer._instance
	}

	private constructor (scope: Construct, id: string) {
		super(scope, id, {
			code: SputnikLibraryLambdaLayer.codeAsset,
			description: 'Npm dependencies for sputnik lambdas',
  		license: 'Apache-2.0',
		})
	}
}
