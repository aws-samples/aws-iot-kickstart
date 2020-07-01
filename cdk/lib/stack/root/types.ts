import { StackProps } from '@aws-cdk/core'

export interface BaseStackProps extends StackProps {
	readonly appShortName: string
	readonly appFullName: string
	readonly rootNamespace: string
}
