#!/usr/bin/env node
import * as cdk from '@aws-cdk/core'
import 'source-map-support/register'
import { AppStack } from '../lib/stack/root/AppStack'
import { PersistentStack } from '../lib/stack/root/PersistentStack'
import { PipelineStack } from '../lib/stack/root/PipelineStack'
import { BaseStackProps } from '../lib/stack/root/types'
import { DeviceStack } from '../lib/stack/root/DeviceStack'
import chalk = require('chalk')

const ACCOUNT = process.env.CDK_DEFAULT_ACCOUNT
const CDK_DEFAULT_REGION = process.env.CDK_DEFAULT_REGION
const CONTEXT_VAR_PATTERN = /\$\{([_A-Z]+)\}/

const app = new cdk.App()

const context: { [key: string]: string, } = {
	Namespace: app.node.tryGetContext('Namespace'),
	AdministratorName: app.node.tryGetContext('AdministratorName'),
	AdministratorEmail: app.node.tryGetContext('AdministratorEmail'),
	RepositoryName: app.node.tryGetContext('RepositoryName'),
	RepositoryBranch: app.node.tryGetContext('RepositoryBranch'),
	RepositoryRegion: app.node.tryGetContext('RepositoryRegion'),
	AppRegion: app.node.tryGetContext('AppRegion'),
	AppShortName: app.node.tryGetContext('AppShortName'),
	AppFullName: app.node.tryGetContext('AppFullName'),
}

Object.entries(context).forEach(([key, value]): void => {
	if (!value || value === '' || CONTEXT_VAR_PATTERN.test(value)) {
		switch (key) {
			case 'AppRegion':
			case 'RepositoryRegion': {
				context[key] = CDK_DEFAULT_REGION as string
				break
			}
		}
	}
})

console.info(context)

if (context.AdministratorEmail === 'CHANGEME@CHANGE.ME') {
	console.warn(chalk.yellow('Update AdministratorEmail in context before deploying: CHANGEME@CHANGE.ME'))
}

const appProps: BaseStackProps = {
	rootNamespace: context.Namespace,
	appShortName: context.AppShortName,
	appFullName: context.AppFullName,
	env: {
		account: ACCOUNT,
		region: context.AppRegion,
	},
}
const persistentStack = new PersistentStack(app, `${context.Namespace}-Persistent`, appProps)

const deviceStack = new DeviceStack(app, `${context.Namespace}-Device`, {
	...appProps,
})

const appStack = new AppStack(app, `${context.Namespace}-App`, {
	...appProps,
	persistent: persistentStack,
	device: deviceStack,
	loadDefaults: app.node.tryGetContext('LoadDefaults') === 'true',
})

new PipelineStack(app, `${context.Namespace}-Pipeline`, {
	appStackName: appStack.stackName,
	appStackRegion: appStack.region,
	repositoryName: context.RepositoryName,
	repositoryBranch: context.RepositoryBranch,
	selfUpdate: false,
	env: {
		// NOTE: PicaPica only support us-west-2 region so out pipeline needs to be there
		region: context.RepositoryRegion,
		// Required for cross-region to prevent "You need to specify an explicit account when using CodePipeline's cross-region support"
		account: ACCOUNT,
	},
})
