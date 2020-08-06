import * as fs from 'fs'
import * as path from 'path'
import { Stack, Construct } from '@aws-cdk/core'

export function validateStackParameterLimit (stack: Stack): void {
	const template = JSON.parse(fs.readFileSync(path.join(process.env.CDK_OUTDIR as string, stack.templateFile), 'utf-8'))
	const parameterCount = Object.keys(template.Parameters || {}).length

	if (parameterCount > 60) {
		throw new Error(`Stack "${stack.stackName}" exceeded limit of 60 parameters: ${parameterCount}`)
	}
}

export function getRootStack (scope: Construct): Stack {
	let stack: Stack = Stack.of(scope)

	while (stack.parentStack != null) {
		stack = stack.parentStack
	}

	return stack
}
