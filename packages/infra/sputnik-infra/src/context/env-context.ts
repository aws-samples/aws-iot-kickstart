import { config } from 'dotenv'
import chalk from 'chalk'
import { Construct } from '@aws-cdk/core'

export interface Context {
	[key: string]: string
}

/**
 * Set default using [dotenv](https://github.com/motdotla/dotenv) to override defaults.
 *
 * This only set the `default` values passed into `App` instance and
 * [CDK Runtime Context](https://docs.aws.amazon.com/cdk/latest/guide/context.html)
 * standard functionality will take precedence.
 *
 * Intended for development purposes rather than deployment. This will enable override defaults without
 * having to set *cdk.json* or passing `--context` during development.
 *
 */
export function envContext<TContext extends Context> (defaults: TContext): TContext {
	// Load .env file into process.env
	config()

	return Object.keys(defaults).reduce((context: Partial<TContext>, key: string): Partial<TContext> => {
		let value = context[key] as string

		if (process.env[key]) {
			value = process.env[key] as string
			console.warn(chalk.bgYellowBright.black(`[.env]: ${key} = "${value}"`))
		}

		return {
			...context,
			[key]: value,
		}
	}, defaults) as TContext
}

export function getContext<TContext extends Context> (scope: Construct, keys: string[]): TContext {
	return keys.reduce((context: Partial<TContext>, key: string): Partial<TContext> => {
		return {
			...context,
			[key]: scope.node.tryGetContext(key) || context[key] as string,
		}
	}, {}) as TContext
}

// export function propagateContext(scope: Construct, keys: string[]): void {
// 	const context = getContext(scope, keys)

// 	keys.forEach((key) => {
// 		scope.node.setContext(key, context[key])
// 	})
// }
