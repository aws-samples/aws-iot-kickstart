import { SpecDefinition } from '@deathstar/sputnik-core-api'
import { substituteSpec } from './substitute'

// TODO: move this to global
type JestExpect = <R>(actual: R) => jest.Matchers<R> & jasmine.Matchers<R>;
declare const expect: JestExpect

describe('substitue', () => {
	test('should substitute tokens', () => {
		const substitutions = {
			CERTIFICATE_ARN: '!!cert-arn!!',
			THING_ARN: '!!thing-arn!!',
			FUNCTION_ARN: '!!function-arn!!',
			ACCOUNT: '!!acount!!',
		}

		const spec: SpecDefinition = {
			CoreDefinitionVersion: {
				Cores: [
					{
						CertificateArn: '[CERTIFICATE_ARN]',
						Id: 'Id',
						ThingArn: '[THING_ARN]',
					},
				],
			},
			DeviceDefinitionVersion: {
				Devices: [
					{
						CertificateArn: '[CERTIFICATE_ARN]',
						Id: 'Id',
						ThingArn: '[THING_ARN]',
					},
				],
			},
			FunctionDefinitionVersion: {
				Functions: [
					{
						FunctionArn: '[FUNCTION_ARN]',
						FunctionConfiguration: {},
						Id: '[ACCOUNT]-Id',
					},
				],
			},
		}

		expect(substituteSpec(spec, substitutions)).toMatchSnapshot('substitutions')
	})
})
