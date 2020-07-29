#!/usr/bin/env node
import { initEnvContext, getAppContext } from '@deathstar/sputnik-infra/dist/context'
import * as cdk from '@aws-cdk/core'
import 'source-map-support/register'
import { SputnikKickstarter } from '../lib/SputnikKickstarter'
import chalk from 'chalk'

const defaultContext = initEnvContext({
	Namespace: 'Sputnik',
	AdministratorName: 'Administrator',
	AdministratorEmail: 'CHANGEME@CHANGE.ME',
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
