import * as path from 'path'
import { Construct, App } from '@aws-cdk/core'
import { PersistentStack } from '@deathstar/sputnik-infra/lib/stack/root/PersistentStack'
import { AppStack } from '@deathstar/sputnik-infra/lib/stack/root/AppStack'
import { Source } from '@aws-cdk/aws-s3-deployment'
import { getAppContext } from '@deathstar/sputnik-infra-core/lib/context'

const ROOT_DIR = path.resolve(__dirname, '../../../')
const WEBSITE_SOURCE = path.resolve(ROOT_DIR, 'kickstarter/web')

export class SputnikKickstarter extends Construct {
	constructor (app: App, id: string) {
		super(app, id)

		const context = getAppContext(app)

		// Website must be built before call this
		const websiteSource = Source.asset(path.join(WEBSITE_SOURCE, 'dist'))

		const persistentStack = new PersistentStack(app, 'PersistentStack', {
			namespace: `${context.Namespace}P`,
			stackName: `${context.Namespace}-Persistent`,
			websiteSource,
		})

		new AppStack(app, 'AppStack', {
			stackName: `${context.Namespace}-App`,
			persistent: persistentStack,
		})
	}
}
