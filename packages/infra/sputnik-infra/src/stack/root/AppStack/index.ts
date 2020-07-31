import { Construct, Stack, ISynthesisSession, StackProps, NestedStack, NestedStackProps } from '@aws-cdk/core'
import { ApiStack } from '../../nested/api/ApiStack'
import { DataProcessingStack } from '../../nested/data/DataProcessingStack'
import { DeviceManagementStack } from '../../nested/device/management/DeviceManagementStack'
import { SputnikStack } from '../../nested/existing/SputnikStack'
import { CognitoStack } from '../../nested/identity/CognitoStack'
import { IPersistent } from '../PersistentStack'
import { UserManagementStack } from '../../nested/identity/UserManagementStack'
import { setNamespace } from '../../../utils/cdk-identity-utils'
import { validateStackParameterLimit } from '../../../utils/stack-utils'
import { getAppContext } from '../../../context'

export interface IApp {
	readonly persistent: IPersistent

	readonly cognitoStack: CognitoStack

	readonly apiStack: ApiStack

	readonly sputnikStack: SputnikStack

	readonly userManagementStack: UserManagementStack

	readonly dataProcessingStack: DataProcessingStack

	readonly deviceManagementStack: DeviceManagementStack
}

interface AppResourcesProps {
	readonly persistent: IPersistent
}

interface AppStackProps extends AppResourcesProps {
	readonly namespace?: string
}

function createResources (scope: Construct, props: AppResourcesProps): IApp {
	const { persistent } = props

	const {
		AppFullName: appFullName,
		AppShortName: appShortName,
		AdministratorEmail: administratorEmail,
		AdministratorName: administratorName,
	} = getAppContext(scope)

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

	const sputnikStack = new SputnikStack(scope, 'Sputnik', {
		persistent,
		userPool,
		graphQLApi,
		userManagementStack,
		deviceManagementStack,
		cognitoStack,
		administratorName,
		administratorEmail,
		appFullName,
		appShortName,
		sendAnonymousUsageData: false,
	})

	return {
		persistent,
		dataProcessingStack,
		cognitoStack,
		apiStack,
		sputnikStack,
		userManagementStack,
		deviceManagementStack,
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

	constructor (scope: Construct, id: string, props: AppStackProps & StackProps) {
		super(scope, id, props)

		const {
			Namespace,
		} = getAppContext(this)

		setNamespace(this, props.namespace || Namespace || 'Sputnik')

		Object.assign(this, createResources(this, props))
	}
}
