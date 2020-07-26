import * as path from 'path'
import { Construct, App } from '@aws-cdk/core'
import { PersistentStack } from '@deathstar/sputnik-infra/stack/root/PersistentStack'
import { AppStack } from '@deathstar/sputnik-infra/stack/root/AppStack'
import { Source } from '@aws-cdk/aws-s3-deployment'
import { getAppContext } from '@deathstar/sputnik-infra/context'
// import { PipelineStack } from '@deathstar/sputnik-infra/stack/root/PipelineStack'

export class SputnikKickstarter extends Construct {
	constructor (app: App, id: string) {
		super(app, id)

		const context = getAppContext(app)

		// TODO: use zip
		const websiteSource = Source.asset(path.resolve(__dirname, '../../../node_modules', '@deathstar/sputnik-ui-angular/compiled/sputnik-ui-angular.zip'))

		const persistentStack = new PersistentStack(app, 'PersistentStack', {
			stackName: `${context.Namespace}-Persistent`,
			websiteSource,
		})

		const appStack = new AppStack(app, 'AppStack', {
			stackName: `${context.Namespace}-App`,
			persistent: persistentStack,
		})

		// new PipelineStack(app, `${context.Namespace}-Pipeline`, {
		// 	appStackName: appStack.stackName,
		// 	appStackRegion: appStack.region,
		// 	repositoryName: context.RepositoryName,
		// 	repositoryBranch: context.RepositoryBranch,
		// 	selfUpdate: false,
		// 	env: {
		// 		region: context.RepositoryRegion,
		// 		// Required for cross-region to prevent "You need to specify an explicit
		// 		// account when using CodePipeline's cross-region support"
		// 		account: ACCOUNT,
		// 	},
		// })
	}
}
