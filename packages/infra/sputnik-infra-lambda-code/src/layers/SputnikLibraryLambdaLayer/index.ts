import { Construct, Stack } from '@aws-cdk/core'
import { Code, AssetCode } from '@aws-cdk/aws-lambda'
import { getRootStack } from '@deathstar/sputnik-infra-core/lib/utils/stack-utils'
import { lambdaPath, CompiledLambdaLayer } from '../../CompiledLambdaLayer'
import { namespaced } from '@deathstar/sputnik-infra-core/lib/utils/cdk-identity-utils'

// TODO: read from package.json
const PACKAGE_NAME = 'sputnik-lib'

export class SputnikLibraryLambdaLayer extends CompiledLambdaLayer {
	static get codeAsset (): AssetCode {
		return Code.fromAsset(lambdaPath(PACKAGE_NAME))
	}

	private static _instance: SputnikLibraryLambdaLayer

	static getLayer (scope: Construct): SputnikLibraryLambdaLayer {
		if (SputnikLibraryLambdaLayer._instance == null) {
			SputnikLibraryLambdaLayer._instance = new SputnikLibraryLambdaLayer(getRootStack(scope), `LayerVersion-${PACKAGE_NAME}`)
		}

		return SputnikLibraryLambdaLayer._instance
	}

	private constructor (scope: Construct, id: string) {
		super(scope, id, {
			code: SputnikLibraryLambdaLayer.codeAsset,
			layerVersionName: namespaced(scope, PACKAGE_NAME),
			description: 'Npm dependencies for sputnik lambdas',
  		license: 'Apache-2.0',
		})
	}
}
