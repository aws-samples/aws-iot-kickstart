import { Construct, Stack, StackProps, NestedStack, NestedStackProps } from '@aws-cdk/core'
import { DataBucketPersistentStack } from '../../nested/data/DataBucketPersistentStack'
import { DataProcessingPersistentStack } from '../../nested/data/DataProcessingPersistentStack'
import { DeviceManagementPersistentStack } from '../../nested/device/management/DeviceManagementPersistentStack'
import { CognitoPersistentStack } from '../../nested/identity/CognitoPersistentStack'
import { WebsitePersistentStack } from '../../nested/web/WebsitePersistentStack'
import { setNamespace } from '../../../utils/cdk-identity-utils'
import { getAppContext } from '../../../context'
import { ISource } from '@aws-cdk/aws-s3-deployment'

export interface IPersistent {
	readonly websiteStack: WebsitePersistentStack

	readonly dataBucketStack: DataBucketPersistentStack

	readonly cognitoStack: CognitoPersistentStack

	readonly dataProcessingStack: DataProcessingPersistentStack

	readonly deviceManagementStack: DeviceManagementPersistentStack
}

interface PersistentResourcesProps {
	readonly websiteSource: ISource | ISource[]
}

interface PersistentStackProps extends PersistentResourcesProps {
	readonly namespace?: string
}

export class PersistentResources extends Construct implements IPersistent {
	readonly websiteStack: WebsitePersistentStack

	readonly dataBucketStack: DataBucketPersistentStack

	readonly cognitoStack: CognitoPersistentStack

	readonly dataProcessingStack: DataProcessingPersistentStack

	readonly deviceManagementStack: DeviceManagementPersistentStack

	constructor (scope: Construct, id: string, props: PersistentStackProps) {
		super(scope, id)

		const { websiteSource } = props

		const {
			AppFullName: appFullName,
			AdministratorEmail: administratorEmail,
			AdministratorName: administratorName,
		} = getAppContext(this)

		const deviceManagementStack = new DeviceManagementPersistentStack(this, 'DeviceManagement', {})

		const dataBucketStack = new DataBucketPersistentStack(this, 'DataBucket', {})

		const websiteStack = new WebsitePersistentStack(this, 'Website', {
			source: websiteSource,
		})

		const cognitoStack = new CognitoPersistentStack(this, 'Cognito', {
			administratorEmail,
			administratorName,
			appFullName,
			websiteURL: websiteStack.websiteURL,
		})

		const dataProcessingStack = new DataProcessingPersistentStack(this, 'DataProcessing', {
			administratorName,
			administratorEmail,
		})

		Object.assign(this, {
			dataBucketStack,
			websiteStack,
			cognitoStack,
			dataProcessingStack,
			deviceManagementStack,
		})
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

		const resources = new PersistentResources(this, 'Resources', props)

		this.websiteStack = resources.websiteStack
		this.dataBucketStack = resources.dataBucketStack
		this.dataProcessingStack = resources.dataProcessingStack
		this.dataProcessingStack = resources.dataProcessingStack
		this.deviceManagementStack = resources.deviceManagementStack
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

		const resources = new PersistentResources(this, 'Resources', props)

		this.websiteStack = resources.websiteStack
		this.dataBucketStack = resources.dataBucketStack
		this.dataProcessingStack = resources.dataProcessingStack
		this.dataProcessingStack = resources.dataProcessingStack
		this.deviceManagementStack = resources.deviceManagementStack
	}
}
