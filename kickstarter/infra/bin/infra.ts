#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { SputnikKickstarterStack } from '../lib/SputnikKickstarterStack'

const app = new cdk.App()

new SputnikKickstarterStack(app, 'SputnikKickstarter', {
	stackName: 'SputnikKickstarter',
})
