import { Construct, Stack, StackProps } from '@aws-cdk/core'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface SputnikKickstarterStackProps extends StackProps {

}

export class SputnikKickstarterStack extends Stack {
	constructor (scope: Construct, id: string, props: SputnikKickstarterStackProps) {
		super(scope, id, props)

		// TODO: add some stuff
	}
}
