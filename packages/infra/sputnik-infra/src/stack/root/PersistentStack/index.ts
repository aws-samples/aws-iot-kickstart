import { Construct, Stack, StackProps, NestedStack, NestedStackProps } from '@aws-cdk/core'
import { DataBucketPersistentStack } from '../../nested/data/DataBucketPersistentStack'
import { DataProcessingPersistentStack } from '../../nested/data/DataProcessingPersistentStack'
import { DeviceManagementPersistentStack } from '../../nested/device/management/DeviceManagementPersistentStack'
import { CognitoPersistentStack } from '../../nested/identity/CognitoPersistentStack'
import { WebsitePersistentStack } from '../../nested/web/WebsitePersistentStack'
import { setNamespace } from '@deathstar/sputnik-infra-core/lib/utils/cdk-identity-utils'
import { getAppContext } from '@deathstar/sputnik-infra-core/lib/context'
import { SputnikLibraryLambdaLayer } from '@deathstar/sputnik-infra-lambda-code'
import { ISource } from '@aws-cdk/aws-s3-deployment'
import { UserPool } from '@aws-cdk/aws-cognito'

export interface IPersistent {
	readonly websiteStack: WebsitePersistentStack

	readonly dataBucketStack: DataBucketPersistentStack

	readonly cognitoStack: CognitoPersistentStack

	readonly dataProcessingStack: DataProcessingPersistentStack

	readonly deviceManagementStack: DeviceManagementPersistentStack
}

interface PersistentResourcesProps {
	readonly websiteSource: ISource | ISource[]
	readonly userPool?: UserPool
}

interface PersistentStackProps extends PersistentResourcesProps {
	readonly namespace?: string
}

function createResources (scope: Construct, props: PersistentResourcesProps): IPersistent {
	const { websiteSource, userPool } = props

	const {
		AppFullName: appFullName,
		AdministratorEmail: administratorEmail,
		AdministratorName: administratorName,
	} = getAppContext(scope)

	// Create shared lambda layers in persistent root to prevent nested output issues
	SputnikLibraryLambdaLayer.createLayerVersion(scope)

	const deviceManagementStack = new DeviceManagementPersistentStack(scope, 'DeviceManagement', {})

	const dataBucketStack = new DataBucketPersistentStack(scope, 'DataBucket', {})

	const websiteStack = new WebsitePersistentStack(scope, 'Website', {
		source: websiteSource,
	})

	const cognitoStack = new CognitoPersistentStack(scope, 'Cognito', {
		userPool,
		administratorEmail,
		administratorName,
		appFullName,
		websiteURL: websiteStack.websiteURL,
	})

	const dataProcessingStack = new DataProcessingPersistentStack(scope, 'DataProcessing', {
		administratorName,
		administratorEmail,
	})

	return {
		dataBucketStack,
		websiteStack,
		cognitoStack,
		dataProcessingStack,
		deviceManagementStack,
	}
}

export class PersistentStack extends Stack implements IPersistent {
	readonly websiteStack: WebsitePersistentStack

	readonly dataBucketStack: DataBucketPersistentStack

	readonly cognitoStack: CognitoPersistentStack

	readonly dataProcessingStack: DataProcessingPersistentStack

	readonly deviceManagementStack: DeviceManagementPersistentStack

	constructor (scope: Construct, id: string, props: PersistentStackProps & StackProps) {
		super(scope, id, props)

		const {
			Namespace,
		} = getAppContext(this)

		setNamespace(this, props.namespace || Namespace || 'Sputnik')

		Object.assign(this, createResources(this, props))
	}
}

export class PersistentNestedStack extends NestedStack implements IPersistent {
	readonly websiteStack: WebsitePersistentStack

	readonly dataBucketStack: DataBucketPersistentStack

	readonly cognitoStack: CognitoPersistentStack

	readonly dataProcessingStack: DataProcessingPersistentStack

	readonly deviceManagementStack: DeviceManagementPersistentStack

	constructor (scope: Construct, id: string, props: PersistentStackProps & NestedStackProps) {
		super(scope, id, props)

		const {
			Namespace,
		} = getAppContext(this)

		setNamespace(this, props.namespace || Namespace || 'Sputnik')

		Object.assign(this, createResources(this, props))
	}
}
