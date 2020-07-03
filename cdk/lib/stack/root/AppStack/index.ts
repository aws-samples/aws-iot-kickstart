import { Construct, Stack, CfnOutput, ISynthesisSession } from '@aws-cdk/core'
import { ApiStack } from '../../nested/api/ApiStack'
import { DataProcessingStack } from '../../nested/data/DataProcessingStack'
import { DeviceManagementStack } from '../../nested/device/management/DeviceManagementStack'
import { SputnikStack } from '../../nested/existing/SputnikStack'
import { CognitoStack } from '../../nested/identity/CognitoStack'
import { IPersitentReference, PersistentStack } from '../PersistentStack'
import { BaseStackProps } from '../types'
import { UserManagementStack } from '../../nested/identity/UserManagementStack'
import { setNamespace } from '../../../utils/cdk-identity-utils'
import { DeviceStack, IDeviceReference } from '../DeviceStack'
import { validateStackParameterLimit } from '../../../utils/stack-utils'

export interface AppStackProps extends BaseStackProps {
	readonly persistent: PersistentStack
	readonly device: DeviceStack
	readonly loadDefaults?: boolean
}

export class AppStack extends Stack implements IPersitentReference, IDeviceReference {
	readonly persistent: PersistentStack
	readonly device: DeviceStack

	readonly cognitoStack: CognitoStack
	readonly apiStack: ApiStack

	readonly sputnikStack: SputnikStack
	readonly userManagementStack: UserManagementStack
	readonly dataProcessingStack: DataProcessingStack
	readonly deviceManagementStack: DeviceManagementStack

	constructor (scope: Construct, id: string, props: AppStackProps) {
		super(scope, id, props)

		const { persistent, device, appShortName, appFullName, loadDefaults, rootNamespace } = props

		setNamespace(this, rootNamespace)

		const administratorName = this.node.tryGetContext('AdministratorName')
		const administratorEmail = this.node.tryGetContext('AdministratorEmail')

		this.persistent = persistent
		this.device = device

		const cognitoStack = new CognitoStack(this, 'Cognito', {
			userPool: persistent.cognitoStack.userPool,
			websiteClient: persistent.cognitoStack.websiteClient,
			dataBucket: persistent.dataBucketStack.dataBucket,
		})

		const { userPool } = cognitoStack

		const apiStack = new ApiStack(this, 'Api', {
			userPool,
		})

		const { graphQLApi } = apiStack

		const userManagementStack = new UserManagementStack(this, 'UserManagement', {
			graphQLApi,
			userPool,
			tenantRole: cognitoStack.tenantRole,
		})

		const dataProcessingStack = new DataProcessingStack(this, 'DataProcessing', {
			snsAlertsTopic: persistent.dataProcessingStack.snsAlertsTopic,
			iotEventBucket: persistent.dataProcessingStack.iotEventBucket,
			iotErrorsBucket: persistent.dataProcessingStack.iotErrorsBucket,
		})

		const deviceManagementStack = new DeviceManagementStack(this, 'DeviceManagement', {
			graphQLApi,
			dataStoreTable: persistent.deviceManagementStack.dataStoreTable,
			deviceTable: persistent.deviceManagementStack.deviceTable,
			deviceTypeTable: persistent.deviceManagementStack.deviceTypeTable,
			deviceBlueprintTable: persistent.deviceManagementStack.deviceBlueprintTable,
			systemTable: persistent.deviceManagementStack.systemTable,
			systemBlueprintTable: persistent.deviceManagementStack.systemBlueprintTable,
			deploymentTable: persistent.deviceManagementStack.deploymentTable,
			settingTable: persistent.deviceManagementStack.settingTable,
			iotConnectPolicy: persistent.deviceManagementStack.iotConnectPolicy,
		})

		const sputnikStack = new SputnikStack(this, 'Sputnik', {
			device,
			persistent,
			userPool,
			graphQLApi,
			userManagementStack,
			deviceManagementStack,
			cognitoStack,
			// existing
			administratorName,
			administratorEmail,
			appFullName,
			appShortName,
			sendAnonymousUsageData: false,
			loadDefaults,
		})

		// Assign all stacks to instance
		Object.assign(this, {
			dataProcessingStack,
			cognitoStack,
			apiStack,
			sputnikStack,
			userManagementStack,
			deviceManagementStack,
		})

		// /**************************************************************************
		//  * OUTPUT
		// ***************************************************************************/
		// Website
		// new CfnOutput(this, 'Output-WebsiteUrl', {
		// 	exportName: 'websiteUrl',
		// 	description: 'Website URL',
		// 	value: persistent.websiteStack.websiteURL,
		// })
		// Cognito
		// new CfnOutput(this, 'Output-UserPoolArn', {
		// 	exportName: 'userPoolArn',
		// 	description: 'sputnik User Pool',
		// 	value: cognitoStack.userPoolArn,
		// })
		// new CfnOutput(this, 'Output-UserPoolId', {
		// 	exportName: 'userPoolId',
		// 	description: 'sputnik User Pool ID',
		// 	value: cognitoStack.userPoolId,
		// })
		// new CfnOutput(this, 'Output-WebsiteCognitoClientId', {
		// 	exportName: 'websiteCognitoClientId',
		// 	description: 'sputnik Website Cognito Client',
		// 	value: cognitoStack.websiteClientId,
		// })
		// new CfnOutput(this, 'Output-IdentityPool', {
		// 	exportName: 'identityPool',
		// 	description: 'sputnik Identity Pool',
		// 	value: cognitoStack.identityPool.identityPoolName as string,
		// })
		// new CfnOutput(this, 'Output-WebsiteCognitoIoTPolicy', {
		// 	exportName: 'websiteCognitoIoTPolicy',
		// 	description: 'IoT Policy to access resources',
		// 	value: persistent.cognitoStack.websiteCognitoIoTPolicy.attrArn,
		// })
		// IOT
		// new CfnOutput(this, 'Output-IotEndpoint', {
		// 	exportName: 'iotEndpoint',
		// 	description: 'IoT Endpoint',
		// 	value: sputnikStack.iotEndpoint.getAttString('endpointAddress'),
		// })
		// new CfnOutput(this, 'Output-GreengrassGroupsIAMRole', {
		// 	exportName: 'greengrassGroupsIAMRole',
		// 	description: 'IAM Role For Greengrass Groups to be used by Addons',
		// 	value: sputnikStack.greengrassGroupsIAMRole.roleName,
		// })

		// not really required just create a link between app and device stack
		// to allow deployment of device stack
		// new CfnOutput(this, 'Output-ModbusClientLambda', {
		// 	exportName: 'modbusClientLambdaArn',
		// 	description: 'Arn of modbus client',
		// 	value: device.deviceFunctionsStack.modbusClientLambda.functionArn,
		// })
	}

	onSynthesize (session: ISynthesisSession): void {
		super.onSynthesize(session)

		validateStackParameterLimit(this)
	}
}
