#!/usr/bin/env node
import { initEnvContext, getAppContext } from '@deathstar/sputnik-infra/context'
import * as cdk from '@aws-cdk/core'
import 'source-map-support/register'
import { SputnikKickstarter } from '../lib/SputnikKickstarter'
import chalk from 'chalk'

const CDK_DEFAULT_REGION = process.env.CDK_DEFAULT_REGION as string

const defaultContext = initEnvContext({
	Namespace: 'Sputnik',
	AdministratorName: 'Administrator',
	AdministratorEmail: 'CHANGEME@CHANGE.ME',
	// RepositoryName: 'Sputnik',
	// RepositoryBranch: 'master',
	// RepositoryRegion: CDK_DEFAULT_REGION,
	// AppRegion: CDK_DEFAULT_REGION,
	AppShortName: 'Sputnik',
	AppFullName: 'Sputnik - The IoT Pilot Kickstart Solution',
})

const app = new cdk.App({
	context: defaultContext,
})

const context = getAppContext(app)

if (context.AdministratorEmail === 'CHANGEME@CHANGE.ME') {
	console.warn(chalk.yellow('Update AdministratorEmail in context before deploying: CHANGEME@CHANGE.ME'))
}

new SputnikKickstarter(app, 'SputnikKickstarter')
