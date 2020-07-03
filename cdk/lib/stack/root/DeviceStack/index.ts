import { Construct, Stack } from '@aws-cdk/core'
import { setNamespace } from '../../../utils/cdk-identity-utils'
import { DeviceFunctionsStack } from '../../nested/device/functions/DeviceFunctionsStack'
import { BaseStackProps } from '../types'

export interface DeviceStackProps extends BaseStackProps {
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IDeviceReference {
	readonly device: DeviceStack
}

export class DeviceStack extends Stack {
	readonly deviceFunctionsStack: DeviceFunctionsStack

	/**
	 * Helper to get related persistent stack within app stack.
	 * Prevent having to chain it for every nested construct/resource.
	 * @param construct
	 */
	public static of (construct: Construct): DeviceStack {
		const stack = Stack.of(construct)

		return (stack as unknown as IDeviceReference).device
	}

	constructor (scope: Construct, id: string, props: DeviceStackProps) {
		super(scope, id, props)

		setNamespace(this, props.rootNamespace)

		const deviceFunctionsStack = new DeviceFunctionsStack(this, 'DeviceFunctions', {})

		// Assign all stacks to instance
		Object.assign(this, {
			deviceFunctionsStack,
		})
	}
}
