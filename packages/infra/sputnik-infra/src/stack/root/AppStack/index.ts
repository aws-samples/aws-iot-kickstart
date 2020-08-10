import { Construct, Stack, ISynthesisSession, StackProps, NestedStack, NestedStackProps, Duration, CustomResource } from '@aws-cdk/core'
import { ApiStack } from '../../nested/api/ApiStack'
import { DataProcessingStack } from '../../nested/data/DataProcessingStack'
import { DeviceManagementStack } from '../../nested/device/management/DeviceManagementStack'
import { SputnikStack } from '../../nested/existing/SputnikStack'
import { CognitoStack } from '../../nested/identity/CognitoStack'
import { IPersistent } from '../PersistentStack'
import { UserManagementStack } from '../../nested/identity/UserManagementStack'
import { setNamespace, namespaced } from '@deathstar/sputnik-infra-core/lib/utils/cdk-identity-utils'
import { validateStackParameterLimit } from '@deathstar/sputnik-infra-core/lib/utils/stack-utils'
import { getAppContext } from '@deathstar/sputnik-infra-core/lib/context'
import { S3HelperLambda, HelperUtilsLambda } from '@deathstar/sputnik-infra-lambda-code'
import { Role, ServicePrincipal, ManagedPolicy, Effect } from '@aws-cdk/aws-iam'
import { ServicePrincipals } from 'cdk-constants'
import { CfnPolicy as CfnIotPolicy } from '@aws-cdk/aws-iot'

export interface IApp {
	readonly persistent: IPersistent

	readonly cognitoStack: CognitoStack

	readonly apiStack: ApiStack

	readonly sputnikStack?: SputnikStack

	readonly userManagementStack: UserManagementStack

	readonly dataProcessingStack: DataProcessingStack

	readonly deviceManagementStack: DeviceManagementStack

	readonly greengrassServiceRole: Role

	readonly greengrassGroupsRole: Role

	readonly iotPolicyForGreengrassCores: CfnIotPolicy

	readonly iotEndpointAddress: string
}

interface AppResourcesProps {
	readonly persistent: IPersistent
}

interface AppStackProps extends AppResourcesProps {
	readonly namespace?: string
}

function createResources (scope: Construct, props: AppResourcesProps): IApp {
	const { persistent } = props

	const cognitoStack = new CognitoStack(scope, 'Cognito', {
		userPool: persistent.cognitoStack.userPool,
		websiteClient: persistent.cognitoStack.websiteClient,
		dataBucket: persistent.dataBucketStack.dataBucket,
	})

	const { userPool } = cognitoStack

	const apiStack = new ApiStack(scope, 'Api', {
		userPool,
	})

	const { graphQLApi } = apiStack

	const greengrassServiceRole = new Role(scope, 'GreengrassServiceIAMRole', {
		assumedBy: new ServicePrincipal(ServicePrincipals.GREENGRASS),
		managedPolicies: [
			ManagedPolicy.fromAwsManagedPolicyName(
				'service-role/AWSGreengrassResourceAccessRolePolicy',
			),
		],
	})

	const greengrassGroupsRole = new Role(scope, 'GreengrassGroupsIAMRole', {
		roleName: namespaced(scope, 'GreengrassGroups'),
		assumedBy: new ServicePrincipal(ServicePrincipals.GREENGRASS),
	})

	const iotPolicyForGreengrassCores = new CfnIotPolicy(scope, 'IoTPolicyForGreengrassCores', {
		policyDocument: {
			Version: '2012-10-17',
			Statement: [
				{
					Effect: Effect.ALLOW,
					Action: ['iot:*', 'greengrass:*'],
					Resource: ['*'],
				},
			],
		},
	})

	const s3HelperLambda = new S3HelperLambda(scope, 'S3HelperLambda', {
		dependencies: {
			dataBucket: persistent.dataBucketStack.dataBucket,
			destBucket: persistent.websiteStack.websiteBucket,
			deviceBlueprintTable: persistent.deviceManagementStack.deviceBlueprintTable,
			deviceTable: persistent.deviceManagementStack.deviceTable,
			deviceTypeTable: persistent.deviceManagementStack.deviceTypeTable,
			settingTable: persistent.deviceManagementStack.settingTable,
			systemBlueprintTable: persistent.deviceManagementStack.systemBlueprintTable,
			systemTable: persistent.deviceManagementStack.systemTable,
		},
	})

	const helperUtilsLambda = new HelperUtilsLambda(scope, 'HelperUtilsLambda', {
		dependencies: {
			deviceBlueprintTable: persistent.deviceManagementStack.deviceBlueprintTable,
			deviceTable: persistent.deviceManagementStack.deviceTable,
			deviceTypeTable: persistent.deviceManagementStack.deviceTypeTable,
			settingTable: persistent.deviceManagementStack.settingTable,
			systemBlueprintTable: persistent.deviceManagementStack.systemBlueprintTable,
			systemTable: persistent.deviceManagementStack.systemTable,
			greengrassServiceRole,
		},
	})

	const iotEndpoint = new CustomResource(scope, 'IotEndpoint', {
		resourceType: 'Custom::Lambda',
		serviceToken: helperUtilsLambda.functionArn,
		properties: {
			customAction: 'iotDescribeEndpoint',
			endpointType: 'iot:Data-ATS',
		},
	})
	const iotEndpointAddress = iotEndpoint.getAttString('endpointAddress')

	const greengrassAssociateServiceRoleToAccount = new CustomResource(scope, 'GreengrassAssociateServiceRoleToAccount', {
		resourceType: 'Custom::Lambda',
		serviceToken: helperUtilsLambda.functionArn,
		properties: {
			customAction: 'greengrassAssociateServiceRoleToAccount',
		},
	})

	const userManagementStack = new UserManagementStack(scope, 'UserManagement', {
		graphQLApi,
		userPool,
		tenantRole: cognitoStack.tenantRole,
	})

	const dataProcessingStack = new DataProcessingStack(scope, 'DataProcessing', {
		snsAlertsTopic: persistent.dataProcessingStack.snsAlertsTopic,
		iotEventBucket: persistent.dataProcessingStack.iotEventBucket,
		iotErrorsBucket: persistent.dataProcessingStack.iotErrorsBucket,
	})

	const deviceManagementStack = new DeviceManagementStack(scope, 'DeviceManagement', {
		graphQLApi,
		dataBucket: persistent.dataBucketStack.dataBucket,
		dataStoreTable: persistent.deviceManagementStack.dataStoreTable,
		deviceTable: persistent.deviceManagementStack.deviceTable,
		deviceTypeTable: persistent.deviceManagementStack.deviceTypeTable,
		deviceBlueprintTable: persistent.deviceManagementStack.deviceBlueprintTable,
		systemTable: persistent.deviceManagementStack.systemTable,
		systemBlueprintTable: persistent.deviceManagementStack.systemBlueprintTable,
		deploymentTable: persistent.deviceManagementStack.deploymentTable,
		settingTable: persistent.deviceManagementStack.settingTable,
		iotConnectPolicy: persistent.deviceManagementStack.iotConnectPolicy,
		iotEndpointAddress,
		greengrassGroupsRole,
		iotPolicyForGreengrassCores,
	})

	const sputnikStack = new SputnikStack(scope, 'Sputnik', {
		persistent,
		graphQLApi,
		cognitoStack,
		iotEndpointAddress,
		greengrassGroupsRole,
		helperUtilsLambda,
		s3HelperLambda,
		iotPolicyForGreengrassCores,
		sendAnonymousUsageData: false,
		timeout: Duration.minutes(15),
	})

	return {
		persistent,
		dataProcessingStack,
		cognitoStack,
		apiStack,
		sputnikStack,
		userManagementStack,
		deviceManagementStack,
		greengrassServiceRole,
		greengrassGroupsRole,
		iotEndpointAddress,
		iotPolicyForGreengrassCores,
	}
}

export class AppNestedStack extends NestedStack implements IApp {
	readonly persistent: IPersistent

	readonly cognitoStack: CognitoStack

	readonly apiStack: ApiStack

	readonly sputnikStack: SputnikStack

	readonly userManagementStack: UserManagementStack

	readonly dataProcessingStack: DataProcessingStack

	readonly deviceManagementStack: DeviceManagementStack

	readonly greengrassServiceRole: Role

	readonly greengrassGroupsRole: Role

	readonly iotPolicyForGreengrassCores: CfnIotPolicy

	readonly iotEndpointAddress: string

	constructor (scope: Construct, id: string, props: AppStackProps & NestedStackProps) {
		super(scope, id, props)

		const {
			Namespace,
		} = getAppContext(this)

		setNamespace(this, props.namespace || Namespace || 'Sputnik')

		Object.assign(this, createResources(this, props))
	}

	onSynthesize (session: ISynthesisSession): void {
		super.onSynthesize(session)

		validateStackParameterLimit(this)
	}
}

export class AppStack extends Stack implements IApp {
	readonly persistent: IPersistent

	readonly cognitoStack: CognitoStack

	readonly apiStack: ApiStack

	readonly sputnikStack: SputnikStack

	readonly userManagementStack: UserManagementStack

	readonly dataProcessingStack: DataProcessingStack

	readonly deviceManagementStack: DeviceManagementStack

	readonly greengrassServiceRole: Role

	readonly greengrassGroupsRole: Role

	readonly iotPolicyForGreengrassCores: CfnIotPolicy

	readonly iotEndpointAddress: string

	constructor (scope: Construct, id: string, props: AppStackProps & StackProps) {
		super(scope, id, props)

		const {
			Namespace,
		} = getAppContext(this)

		setNamespace(this, props.namespace || Namespace || 'Sputnik')

		Object.assign(this, createResources(this, props))
	}
}
