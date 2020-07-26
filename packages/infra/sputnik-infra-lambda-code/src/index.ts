/* eslint-disable import/export */
/* eslint-disable @typescript-eslint/no-namespace */
import * as path from 'path'
import { sync as findup } from 'find-up'
import { Code, AssetCode, Runtime } from '@aws-cdk/aws-lambda'

const DEFAULT_HANDLER = 'index.handler'

function lambdaPath (name: string): string {
	const dist = findup('dist', { cwd: __dirname, type: 'directory' })

	if (dist == null) {
		throw new Error(`Failed to find "dist" folder for @lambda/${name} from "${__dirname}"`)
	}

	return path.join(dist, '@lambda', `${name}.zip`)
}

interface LambdaEnvironment {
	[key: string]: string
}

interface LambdaCodeDefinition {
	readonly code: AssetCode

	/**
	 * Default handler exposed by the lambda code.
	 */
	readonly handler: string

	readonly runtime: Runtime
}

export const AdminServiceCode: LambdaCodeDefinition = {
	code: Code.fromAsset(lambdaPath('admin-service')),
	handler: DEFAULT_HANDLER,
	runtime: Runtime.NODEJS_12_X,
}
export namespace AdminServiceCode {
	export interface Environment extends LambdaEnvironment {
		USER_POOL_ID: string
		TENANT_ROLE_ARN: string
		INTERNAL_TENANT: string
		INTERNAL_GROUPS: string
	}
}

export const DeploymentsServiceCode: LambdaCodeDefinition = {
	code: Code.fromAsset(lambdaPath('deployments-service')),
	handler: DEFAULT_HANDLER,
	runtime: Runtime.NODEJS_12_X,
}
export namespace DeploymentsServiceCode {
	export interface Environment extends LambdaEnvironment {
		TABLE_DEVICES: string
		TABLE_DEVICE_TYPES: string
		TABLE_DEVICE_BLUEPRINTS: string
		TABLE_DEPLOYMENTS: string
		TABLE_SETTINGS: string
		AWS_ACCOUNT: string
		IAM_ROLE_ARN_FOR_GREENGRASS_GROUPS: string
		IOT_POLICY_GREENGRASS_CORE: string
		DATA_BUCKET: string
		IOT_ENDPOINT: string
	}
}

export const DevicesServiceCode: LambdaCodeDefinition = {
	code: Code.fromAsset(lambdaPath('devices-service')),
	handler: DEFAULT_HANDLER,
	runtime: Runtime.NODEJS_12_X,
}
export namespace DevicesServiceCode {
	export interface Environment extends LambdaEnvironment {
		DEFAULT_NAMESPACE: string
		TABLE_DEVICES: string
		TABLE_DEVICE_TYPES: string
		TABLE_SETTINGS: string
		IOT_DEFAULT_CONNECT_POLICY: string
	}
}

export const DeviceNamespaceSyncCode: LambdaCodeDefinition = {
	code: Code.fromAsset(lambdaPath('device-namespace-sync')),
	handler: DEFAULT_HANDLER,
	runtime: Runtime.NODEJS_12_X,
}
export namespace DeviceNamespaceSyncCode {
	export interface Environment extends LambdaEnvironment {
		GRAPHQL_ENDPOINT: string
		DEFAULT_NAMESPACE: string
	}
}

export const JITOnboardingServiceCode: LambdaCodeDefinition = {
	code: Code.fromAsset(lambdaPath('jit-onboarding-service')),
	handler: DEFAULT_HANDLER,
	runtime: Runtime.NODEJS_12_X,
}
export namespace JITOnboardingServiceCode {
	export interface Environment extends LambdaEnvironment {
		TABLE_DEVICES: string
		TABLE_DEVICE_TYPES: string
		TABLE_DEVICE_BLUEPRINTS: string
		TABLE_DEPLOYMENTS: string
		TABLE_SETTINGS: string
		AWS_ACCOUNT: string
		IAM_ROLE_ARN_FOR_GREENGRASS_GROUPS: string
		IOT_POLICY_GREENGRASS_CORE: string
		DATA_BUCKET: string
		IOT_ENDPOINT: string
	}
}

export const SettingsServiceCode: LambdaCodeDefinition = {
	code: Code.fromAsset(lambdaPath('settings-service')),
	handler: DEFAULT_HANDLER,
	runtime: Runtime.NODEJS_12_X,
}
export namespace SettingsServiceCode {
	export interface Environment extends LambdaEnvironment {
		IOT_JUST_IN_TIME_ON_BOARDING_TOPIC_RULE: string
	}
}

export const SystemsServiceCode: LambdaCodeDefinition = {
	code: Code.fromAsset(lambdaPath('systems-service')),
	handler: DEFAULT_HANDLER,
	runtime: Runtime.NODEJS_12_X,
}
export namespace SystemsServiceCode {
	export interface Environment extends LambdaEnvironment {
		TABLE_DEVICES: string
		TABLE_DEVICE_BLUEPRINTS: string
		TABLE_DEVICE_TYPES: string
		TABLE_SYSTEMS: string
		TABLE_SYSTEM_BLUEPRINTS: string
		TABLE_SETTINGS: string
	}
}

export const S3HelperCustomResourceCode: LambdaCodeDefinition = {
	code: Code.fromAsset(lambdaPath('s3-helper')),
	handler: DEFAULT_HANDLER,
	runtime: Runtime.NODEJS_12_X,
}
export namespace S3HelperCustomResourceCode {
	type Environment = undefined
}

export const UtilsCustomResourceCode: LambdaCodeDefinition = {
	code: Code.fromAsset(lambdaPath('helper-utils')),
	handler: DEFAULT_HANDLER,
	runtime: Runtime.NODEJS_12_X,
}
export namespace UtilsCustomResourceCode {
	export interface Environment extends LambdaEnvironment {
		TABLE_DEVICES: string
		TABLE_DEVICE_BLUEPRINTS: string
		TABLE_DEVICE_TYPES: string
		TABLE_SYSTEMS: string
		TABLE_SYSTEM_BLUEPRINTS: string
		TABLE_SETTINGS: string
		GREENGRASS_SERVICE_ROLE_ARN: string
	}
}

export const CognitoPreTokenGenerationCode: LambdaCodeDefinition = {
	code: Code.fromAsset(lambdaPath('cognito-pre-token-generation')),
	handler: DEFAULT_HANDLER,
	runtime: Runtime.NODEJS_12_X,
}
export namespace CognitoPreTokenGenerationCode {
	export interface Environment extends LambdaEnvironment {
		CLAIM_PREFIX: string
		INTERNAL_TENANT: string
		INTERNAL_NAMESPACE: string
		INTERNAL_GROUPS: string
	}
}
