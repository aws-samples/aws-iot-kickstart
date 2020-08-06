import { AnyPrincipal, Role } from '@aws-cdk/aws-iam'
import { CfnResource, Construct, RemovalPolicy, Resource, Stack } from '@aws-cdk/core'
import chalk from 'chalk'

export function retainResource (construct: Construct): void {
	// @ts-ignore
	if ((construct as CfnResource)?.applyRemovalPolicy) {
		(construct as CfnResource)?.applyRemovalPolicy(RemovalPolicy.RETAIN)
	} else {
		(construct.node.findChild('Resource') as CfnResource)?.applyRemovalPolicy(RemovalPolicy.RETAIN)
	}
}

/**
 * Creates a placeholder resource (Role) for stacks that don't define any resources.
 * These should be removed after already have a resource defined... or if stack is
 * found to not need resources but only contributes to other stacks, it should be
 * changed to a construct.
 * @param scope
 */
export function TODO_placeholderResource (stack: Stack): Resource {
	console.warn(chalk.yellow(`TODO: Creating placeholder resource in stack ${stack.stackId}, need to remove later`))

	return new Role(stack, 'PlaceholderRole', {
		assumedBy: new AnyPrincipal(),
		description: 'Placeholder because need resource in stack',
	})
}
