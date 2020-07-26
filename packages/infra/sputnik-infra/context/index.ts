import { envContext, getContext, Context } from './env-context';
import { Construct, Stack, App } from '@aws-cdk/core'

export interface AppContext extends Context {
	Namespace: string
	AdministratorName: string
	AdministratorEmail: string
	AppShortName: string
	AppFullName: string
	// RepositoryName: string
	// RepositoryBranch: string
	// RepositoryRegion: string
	// AppRegion: string
}

let context: AppContext

export function initEnvContext (defaults: AppContext): AppContext {
	context = envContext(defaults)

	return context
}

export function getAppContext (scope: Construct): AppContext {
	const app = scope instanceof App || scope instanceof Stack ? scope : Stack.of(scope).node.scope as Construct

	return getContext(app, Object.keys(context))
}
