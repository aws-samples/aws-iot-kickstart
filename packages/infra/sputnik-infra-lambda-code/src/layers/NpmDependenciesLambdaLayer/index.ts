import { Construct, Stack } from '@aws-cdk/core'
import { Code, AssetCode } from '@aws-cdk/aws-lambda'
import { getRootStack } from '@deathstar/sputnik-infra-core/lib/utils/stack-utils'
import { lambdaPath, CompiledLambdaLayer } from '../../CompiledLambdaLayer'
import { namespaced } from '@deathstar/sputnik-infra-core/lib/utils/cdk-identity-utils'

// TODO: read from package.json
const PACKAGE_NAME = 'npm-dependencies'

export class NpmDependenciesLambdaLayer extends CompiledLambdaLayer {
	static get codeAsset (): AssetCode {
		return Code.fromAsset(lambdaPath(PACKAGE_NAME))
	}

	private static _instance: NpmDependenciesLambdaLayer

	static getLayer (scope: Construct): NpmDependenciesLambdaLayer {
		if (NpmDependenciesLambdaLayer._instance == null) {
			NpmDependenciesLambdaLayer._instance = new NpmDependenciesLambdaLayer(getRootStack(scope), `LayerVersion-${PACKAGE_NAME}`)
		}

		return NpmDependenciesLambdaLayer._instance
	}

	private constructor (scope: Construct, id: string) {
		super(scope, id, {
			code: NpmDependenciesLambdaLayer.codeAsset,
			layerVersionName: namespaced(scope, PACKAGE_NAME),
			description: 'Npm dependencies for sputnik lambdas',
  		license: 'Apache-2.0',
		})
	}
}
