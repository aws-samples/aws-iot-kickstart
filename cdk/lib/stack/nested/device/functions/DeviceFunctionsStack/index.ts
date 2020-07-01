import * as lambda from '@aws-cdk/aws-lambda'
import * as cdk from '@aws-cdk/core'
import * as path from 'path'
import { NpmCode } from '../../../../../construct/lambda/NpmCode'
import { namespaced } from '../../../../../utils/cdk-identity-utils'

const SOURCE_PATH = '../../../../../../../examples/device-functions'

export class DeviceFunctionsStack extends cdk.NestedStack {
	readonly modbusClientLambda: lambda.Function
	readonly modbusGensetSimulatorLambda: lambda.Function
	readonly commandHandlerLambda: lambda.Function
	readonly modbusForkliftSimulatorLambda: lambda.Function

	constructor (scope: cdk.Construct, id: string, props: cdk.NestedStackProps) {
		super(scope, id, props)

		const modbusClientLambda = new lambda.Function(this, 'ModbusGenericClient', {
			functionName: namespaced(this, 'ModbusGenericClient'),
			description: `Long Running Lambda deployed via Greengrass to connect to modbus using blueprint configuration. ${new Date().toISOString()}`,
			code: NpmCode.fromNpmPackageDir(
				this,
				path.join(__dirname, SOURCE_PATH, '/modbus-client/'),
			),
			handler: 'index.handler',
			timeout: cdk.Duration.seconds(120),
			runtime: lambda.Runtime.NODEJS_12_X,
		})
		new lambda.Alias(this, 'ModbusGenericClientAlias', {
			aliasName: 'prod',
			version: modbusClientLambda.addVersion(new Date().toISOString()),
		})

		const modbusGensetSimulatorLambda = new lambda.Function(this, 'ModbusGensetSimulator', {
			functionName: namespaced(this, 'ModbusGensetSimulator'),
			description: `Long Running Lambda deployed via Greengrass to simulate a genset. ${new Date().toISOString()}`,
			code: NpmCode.fromNpmPackageDir(
				this,
				path.join(__dirname, SOURCE_PATH, '/modbus-simulator/genset/'),
			),
			handler: 'index.handler',
			timeout: cdk.Duration.seconds(120),
			runtime: lambda.Runtime.NODEJS_12_X,
		})
		new lambda.Alias(this, 'ModbusGensetSimulatorAlias', {
			aliasName: 'prod',
			version: modbusGensetSimulatorLambda.addVersion(new Date().toISOString()),
		})

		const commandHandlerLambda = new lambda.Function(this, 'ModbusCommandHandler', {
			functionName: namespaced(this, 'ModbusCommandHandler'),
			description: `On demand Lambda deployed via Greengrass to handle commands coming from the cloud. ${new Date().toISOString()}`,
			code: NpmCode.fromNpmPackageDir(
				this,
				path.join(__dirname, SOURCE_PATH, '/command-handler/'),
			),
			handler: 'index.handler',
			timeout: cdk.Duration.seconds(120),
			runtime: lambda.Runtime.NODEJS_12_X,
		})
		new lambda.Alias(this, 'ModbusCommandHandlerAlias', {
			aliasName: 'prod',
			version: commandHandlerLambda.addVersion(new Date().toISOString()),
		})

		const modbusForkliftSimulatorLambda = new lambda.Function(this, 'ModbusForkliftSimulator', {
			functionName: namespaced(this, 'ModbusForkliftSimulator'),
			description: `Long Running Lambda deployed via Greengrass to simulate a forklift. ${new Date().toISOString()}`,
			code: NpmCode.fromNpmPackageDir(
				this,
				path.join(__dirname, SOURCE_PATH, '/modbus-simulator/forklift/'),
			),
			handler: 'index.handler',
			timeout: cdk.Duration.seconds(120),
			runtime: lambda.Runtime.NODEJS_12_X,
		})
		new lambda.Alias(this, 'ModbusForkliftSimulatorAlias', {
			aliasName: 'prod',
			version: modbusForkliftSimulatorLambda.addVersion(new Date().toISOString()),
		})

		Object.assign(this, {
			modbusClientLambda,
			modbusGensetSimulatorLambda,
			modbusForkliftSimulatorLambda,
			commandHandlerLambda,
		})
	}
}
