import { Construct, Stack, StackProps } from '@aws-cdk/core'
import { DataBucketPersistentStack } from '../../nested/data/DataBucketPersistentStack'
import { DataProcessingPersistentStack } from '../../nested/data/DataProcessingPersistentStack'
import { DeviceManagementPersistentStack } from '../../nested/device/management/DeviceManagementPersistentStack'
import { CognitoPersistentStack } from '../../nested/identity/CognitoPersistentStack'
import { WebsitePersistentStack } from '../../nested/web/WebsitePersistentStack'
import { setNamespace } from '../../../utils/cdk-identity-utils'
import { getAppContext } from '../../../context'
import { ISource } from '@aws-cdk/aws-s3-deployment'

interface PersistentStackProps extends StackProps {
	readonly namespace?: string
	readonly websiteSource: ISource | ISource[]
}

/**
 * Stack that contains all persistent resources
 */
export class PersistentStack extends Stack {
	readonly websiteStack: WebsitePersistentStack

	readonly dataBucketStack: DataBucketPersistentStack

	readonly cognitoStack: CognitoPersistentStack

	readonly dataProcessingStack: DataProcessingPersistentStack

	readonly deviceManagementStack: DeviceManagementPersistentStack

	constructor (scope: Construct, id: string, props: PersistentStackProps) {
		super(scope, id, props)

		const { websiteSource } = props

		const {
			Namespace,
			AppFullName: appFullName,
			AdministratorEmail: administratorEmail,
			AdministratorName: administratorName,
		} = getAppContext(this)

		setNamespace(this, props.namespace || Namespace + 'P')

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
