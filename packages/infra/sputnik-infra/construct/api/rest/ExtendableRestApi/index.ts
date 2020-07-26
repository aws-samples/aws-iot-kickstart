import { ApiKey, EndpointType, LambdaIntegration, MethodOptions, Resource, RestApi, RestApiProps } from '@aws-cdk/aws-apigateway'
import { ManagedPolicy, Role, ServicePrincipal } from '@aws-cdk/aws-iam'
import { Function, FunctionProps } from '@aws-cdk/aws-lambda'
import { Construct } from '@aws-cdk/core'
import { uniqueIdHash, namespaced } from '../../../../utils/cdk-identity-utils'

export type ExtendableRestApiProps = RestApiProps

interface AddLambdaFunctionToResourceProps {
	resource: Resource
	httpMethod: string
	lambdaFunctionProps: FunctionProps
	methodOptions?: MethodOptions
}

export class ExtendableRestApi extends RestApi {
	private static defaultProps ({ endpointTypes, ...props }: ExtendableRestApiProps): RestApiProps {
		return {
			...props,
			endpointTypes: endpointTypes || [EndpointType.REGIONAL],
		}
	}

	constructor (scope: Construct, id: string, props: ExtendableRestApiProps) {
		super(scope, id, ExtendableRestApi.defaultProps(props))

		// dummy
		this.root.addMethod('ANY')

		let { restApiName } = props

		if (!restApiName) {
			restApiName = `restApi-${uniqueIdHash(this)}`
		}
	}

	addApiKeyWithUsagePlanAndStage (apiKeyId: string, usagePlanName?: string): ApiKey {
		const _usagePlanName = usagePlanName || `${apiKeyId}-usagePlan`

		// create the api key
		const apiKey = this.addApiKey(`${apiKeyId}-${uniqueIdHash(this)}`, {
			apiKeyName: namespaced(this, apiKeyId),
		}) as ApiKey

		// usage plan
		const usagePlan = this.addUsagePlan(`${apiKeyId}-usagePlan`, {
			name: _usagePlanName,
			apiKey,
		})

		// stage
		usagePlan.addApiStage({ api: this, stage: this.deploymentStage })

		return apiKey
	}

	addResourceWithAbsolutePath (path: string): Resource {
		return this.root.resourceForPath(path)
	}

	addLambdaFunctionToResource (props: AddLambdaFunctionToResourceProps): Function {
		const { resource, httpMethod, lambdaFunctionProps, methodOptions } = props

		const { functionName, role } = lambdaFunctionProps
		let id = functionName
			? `${functionName}-${uniqueIdHash(this)}`
			: `lambda-${uniqueIdHash(this)}`

		// if roleName.length > 64 -> validationError
		// "Role-" is 5 chars, so we use 64-5 = 59
		if (id.length > 59) {
			id = id.substring(0, 59)
		}

		let lambdaExecutionRole

		if (role === undefined) {
			lambdaExecutionRole = new Role(this, `Role-${id}-${uniqueIdHash(this)}`, {
				assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
				description: `Execution role for ${id}`,
				managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AWSLambdaExecute')],
				roleName: `Role-${id}`,
			})
		}

		const functionProps = {
			...lambdaFunctionProps,
			role: role || lambdaExecutionRole,
		}

		const lambdaFunction = new Function(this, id, functionProps)
		const lambdaIntegration = new LambdaIntegration(lambdaFunction)

		resource.addMethod(httpMethod, lambdaIntegration, methodOptions)

		return lambdaFunction
	}
}
