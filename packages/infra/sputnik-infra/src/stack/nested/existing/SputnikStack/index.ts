import * as path from 'path'
import * as iot from '@aws-cdk/aws-iot'
import { v1 as uuid } from 'uuid'
import { IFunction } from '@aws-cdk/aws-lambda'
import {
	Construct,
	CustomResource,
	Fn,
	NestedStack,
	NestedStackProps,
} from '@aws-cdk/core'
import { ExtendableGraphQLApi } from '@deathstar/sputnik-infra-core/lib/construct/api/graphql/ExtendableGraphQLApi'
import { uniqueIdHash } from '@deathstar/sputnik-infra-core/lib/utils/cdk-identity-utils'
import { IPersistent } from '../../../../stack/root/PersistentStack'
import {
	SettingsServiceLambda,
	SystemsServiceLambda,
	JITOnboardingServiceLambda,
	SputnikLibraryLambdaLayer,
} from '@deathstar/sputnik-infra-lambda-code/dist'
import { CognitoStack } from '../../identity/CognitoStack'
import { IncludeStack } from './IncludeStack'
import { IRole } from '@aws-cdk/aws-iam'

function getTemplateFile (templateName: string): string {
	return path.join(__dirname, 'cf', `${templateName}.yml`)
}

export interface SputnikStackProps extends NestedStackProps {
	readonly includeCloudTrail?: boolean

	readonly persistent: IPersistent

	readonly graphQLApi: ExtendableGraphQLApi
	readonly cognitoStack: CognitoStack
	readonly sendAnonymousUsageData?: boolean

	readonly greengrassGroupsRole: IRole
	readonly iotPolicyForGreengrassCores: iot.CfnPolicy

	readonly helperUtilsLambda: IFunction
	readonly s3HelperLambda: IFunction

	readonly iotEndpointAddress: string
}

export class SputnikStack extends NestedStack {
	readonly lambdaServiceStack: IncludeStack;

	readonly appSyncStack: IncludeStack;

	readonly cloudTrailStack?: IncludeStack;

	readonly websiteConfig: CustomResource;

	readonly initSettings: CustomResource;

	constructor (scope: Construct, id: string, props: SputnikStackProps) {
		super(scope, id, props)

		const {
			includeCloudTrail,
			sendAnonymousUsageData,
			graphQLApi,
			persistent,
			cognitoStack,
			iotPolicyForGreengrassCores,
			iotEndpointAddress,
			helperUtilsLambda,
			s3HelperLambda,
			greengrassGroupsRole,
		} = props

		this.lambdaServiceStack = new IncludeStack(
			this,
			'CFStackForLambdaServices',
			{
				templateFile: getTemplateFile('lambda-services'),
				parameters: {
					sputnikLibLayerArn: SputnikLibraryLambdaLayer.getLayerVersion(this).layerVersionArn,
					tenantRoleArn: cognitoStack.tenantRole.roleArn,
					settingsServiceLambdaFunction: SettingsServiceLambda.codeAsset,
					systemsServiceLambdaFunction: SystemsServiceLambda.codeAsset,
					justInTimeOnBoardingServiceLambdaFunction:
						JITOnboardingServiceLambda.codeAsset,
					dataBucket: persistent.dataBucketStack.dataBucket.bucketName,
					settingsTable:
						persistent.deviceManagementStack.settingTable.tableName,
					devicesTable: persistent.deviceManagementStack.deviceTable.tableName,
					deviceTypesTable:
						persistent.deviceManagementStack.deviceTypeTable.tableName,
					deviceBlueprintsTable:
						persistent.deviceManagementStack.deviceBlueprintTable.tableName,
					deploymentsTable:
						persistent.deviceManagementStack.deploymentTable.tableName,
					systemsTable: persistent.deviceManagementStack.systemTable.tableName,
					systemBlueprintsTable:
						persistent.deviceManagementStack.systemBlueprintTable.tableName,
					greengrassGroupsIAMRoleArn: greengrassGroupsRole.roleArn,
					iotPolicyForGreengrassCores: iotPolicyForGreengrassCores.ref,
					iotEndpoint: iotEndpointAddress,
				},
			},
		)

		this.appSyncStack = new IncludeStack(this, 'CFStackForAppSync', {
			templateFile: getTemplateFile('appsync'),
			parameters: {
				uniqueId: uniqueIdHash(this),
				apiId: graphQLApi.apiId,
				apiRole: graphQLApi.apiRoleName,
				apiRoleArn: graphQLApi.apiRoleArn,
				settingsTable: persistent.deviceManagementStack.settingTable.tableName,
				dataStoreTable:
					persistent.deviceManagementStack.dataStoreTable.tableName,
				deviceTypesTable:
					persistent.deviceManagementStack.deviceTypeTable.tableName,
				deviceBlueprintsTable:
					persistent.deviceManagementStack.deviceBlueprintTable.tableName,
				deploymentsTable:
					persistent.deviceManagementStack.deploymentTable.tableName,
				systemsTable: persistent.deviceManagementStack.systemTable.tableName,
				systemBlueprintsTable:
					persistent.deviceManagementStack.systemBlueprintTable.tableName,
				settingsServiceLambdaFunctionArn: this.lambdaServiceStack.getOutput(
					'settingsServiceLambdaFunctionArn',
				),
				systemsServiceLambdaFunctionArn: this.lambdaServiceStack.getOutput(
					'systemsServiceLambdaFunctionArn',
				),
				HelperUtilsLambdaFunctionArn: helperUtilsLambda.functionArn,
			},
		})

		// Do not include cloudtrail for dev, create massive unused buckets only worthy of auditing
		if (includeCloudTrail) {
			this.cloudTrailStack = new IncludeStack(this, 'CFStackForCloudTrail', {
				templateFile: getTemplateFile('cloudtrail'),
			})
		}

		/**************************************************************************
		 * CUSTOM RESOURCES
		 ***************************************************************************/

		this.websiteConfig = new CustomResource(this, 'websiteConfig', {
			resourceType: 'Custom::LoadLambda',
			serviceToken: s3HelperLambda.functionArn,
			properties: {
				destS3Bucket: persistent.websiteStack.websiteBucket.bucketName,
				destS3Key: 'assets/appVariables.js',
				varName: 'appVariables',
				file: {
					USER_POOL_ID: cognitoStack.userPoolId,
					USER_POOL_CLIENT_ID: cognitoStack.websiteClientId,
					IDENTITY_POOL_ID: cognitoStack.identityPoolId,
					REGION: Fn.ref('AWS::Region'),
					IOT_COGNITO_POLICY:
						persistent.cognitoStack.websiteCognitoIoTPolicy.policyName,
					S3_DATA_BUCKET: persistent.dataBucketStack.dataBucket.bucketName,
					APP_SYNC_GRAPHQL_ENDPOINT: graphQLApi.graphQlUrl,
					IOT_ENDPOINT: iotEndpointAddress,
				},
				customAction: 'putFile',
			},
		})

		this.initSettings = new CustomResource(this, 'initSettings', {
			resourceType: 'Custom::LoadLambda',
			serviceToken: helperUtilsLambda.functionArn,
			properties: {
				ddbTable: persistent.deviceManagementStack.settingTable.tableName,
				ddbItem: {
					id: 'app-config',
					type: 'config',
					setting: {
						// NOTE: Not sure how UUID is used in the Sputnik system, but "usage metrics" requires it
						uuid: uuid(),
						mapboxToken: 'NA',
						anonymousData: sendAnonymousUsageData,
					},
				},
				customAction: 'dynamodbSaveItem',
			},
		})
	}
}
