import { Construct, Stack } from '@aws-cdk/core'
import { DataBucketPersistentStack } from '../../nested/data/DataBucketPersistentStack'
import { DataProcessingPersistentStack } from '../../nested/data/DataProcessingPersistentStack'
import { DeviceManagementPersistentStack } from '../../nested/device/management/DeviceManagementPersistentStack'
import { CognitoPersistentStack } from '../../nested/identity/CognitoPersistentStack'
import { WebsitePersistentStack } from '../../nested/web/WebsitePersistentStack'
import { BaseStackProps } from '../types'
import { setNamespace } from '../../../utils/cdk-identity-utils'

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IPersitentReference {
	readonly persistent: PersistentStack
}

export interface PersistentStackProps extends BaseStackProps {

}

export class PersistentStack extends Stack {
	/**
	 * Helper to get related persistent stack within app stack.
	 * Prevent having to chain it for every nested construct/resource.
	 * @param construct
	 */
	public static of (construct: Construct): PersistentStack {
		const stack = Stack.of(construct)

		return (stack as unknown as IPersitentReference).persistent
	}

	readonly websiteStack: WebsitePersistentStack
	readonly dataBucketStack: DataBucketPersistentStack
	readonly cognitoStack: CognitoPersistentStack
	readonly dataProcessingStack: DataProcessingPersistentStack
	readonly deviceManagementStack: DeviceManagementPersistentStack

	constructor (scope: Construct, id: string, props: PersistentStackProps) {
		super(scope, id, props)

		const { appShortName, appFullName, rootNamespace } = props

		setNamespace(this, `${rootNamespace}P`)

		const administratorName = this.node.tryGetContext('AdministratorName')
		const administratorEmail = this.node.tryGetContext('AdministratorEmail')

		const deviceManagementStack = new DeviceManagementPersistentStack(this, 'DeviceManagement', {})

		const dataBucketStack = new DataBucketPersistentStack(this, 'DataBucket', {})

		const websiteStack = new WebsitePersistentStack(this, 'Website')

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
