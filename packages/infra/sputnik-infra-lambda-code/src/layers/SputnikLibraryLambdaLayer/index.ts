import { Construct, Stack } from '@aws-cdk/core'
import { Code, AssetCode, ILayerVersion, LayerVersion } from '@aws-cdk/aws-lambda'
import { StringParameter } from '@aws-cdk/aws-ssm'
import { getRootStack } from '@deathstar/sputnik-infra-core/lib/utils/stack-utils'
import { lambdaPath, CompiledLambdaLayer } from '../../CompiledLambdaLayer'
import { namespaced } from '@deathstar/sputnik-infra-core/lib/utils/cdk-identity-utils'

// TODO: read from package.json
const PACKAGE_NAME = 'sputnik-lib'

const stackMap = new Map<Stack, ILayerVersion>()

export class SputnikLibraryLambdaLayer extends CompiledLambdaLayer {
	static get codeAsset (): AssetCode {
		return Code.fromAsset(lambdaPath(PACKAGE_NAME))
	}

	private static parameterName (): string {
		return `/shared-layer-version-proxy/${PACKAGE_NAME}/shared/layerVersionArn`
	}

	static getLayerVersion (scope: Construct): ILayerVersion {
		const stack = getRootStack(scope)
		let layerVersion = stackMap.get(stack)

		if (layerVersion == null) {
			const layerVersionArn = StringParameter.valueForStringParameter(stack, this.parameterName())

			layerVersion = LayerVersion.fromLayerVersionArn(stack, `SharedLayerVersion-${PACKAGE_NAME}`, layerVersionArn)

			stack.node.addDependency(this._instance)
			stackMap.set(stack, layerVersion)
		}

		return layerVersion
	}

	private static _instance: SputnikLibraryLambdaLayer

	static createLayerVersion (scope: Construct): SputnikLibraryLambdaLayer {
		if (this._instance != null) {
			throw new Error(`LayerVersion "${PACKAGE_NAME}" instance already created`)
		}

		const layerVersion = new SputnikLibraryLambdaLayer(getRootStack(scope), `LayerVersion-${PACKAGE_NAME}`)
		this._instance = layerVersion

		return layerVersion
	}

	private constructor (scope: Construct, id: string) {
		super(scope, id, {
			code: SputnikLibraryLambdaLayer.codeAsset,
			layerVersionName: namespaced(scope, PACKAGE_NAME),
			description: 'Npm dependencies for sputnik lambdas',
			license: 'Apache-2.0',
		})

		// Store the arn in a SSM enable cross-stack usage https://github.com/aws/aws-cdk/issues/1972
		new StringParameter(this, 'VersionArn', {
			parameterName: SputnikLibraryLambdaLayer.parameterName(),
			stringValue: this.layerVersionArn,
		})
	}
}
